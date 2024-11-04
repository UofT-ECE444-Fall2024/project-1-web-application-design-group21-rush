import unittest
from unittest.mock import patch
from app import app, db, User, pending_registrations, send_verification_email, serializer
from flask_jwt_extended import create_access_token
import json

class UserServiceTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['JWT_SECRET_KEY'] = 'test_jwt_secret'
        app.config['SERVER_NAME'] = 'localhost'
        app.config['PREFERRED_URL_SCHEME'] = 'https'
        cls.client = app.test_client()

        # Create all tables
        with app.app_context():
            db.create_all()

    @classmethod
    def tearDownClass(cls):
        # Drop all tables after tests
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def tearDown(self):
        # Clear the database and pending registrations after each test
        with app.app_context():
            db.session.query(User).delete()
            db.session.commit()
        pending_registrations.clear()

    @patch('app.send_verification_email')
    def test_pre_register(self, mock_send_email):
        # Simulate a pre-registration request
        data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "securepassword",
            "wishlist": "[]",
            "categories": "test_category",
            "location": "test_location"
        }
        response = self.client.post('/pre_register', data=json.dumps(data), content_type='application/json')
        
        # Check that the response is successful
        self.assertEqual(response.status_code, 200)
        self.assertIn("Verification email sent", response.json['message'])
        
        # Verify that the user data is in pending registrations
        self.assertIn("testuser@example.com", pending_registrations)
        
        # Ensure that send_verification_email was called
        mock_send_email.assert_called_once_with("testuser@example.com")

    @patch('app.send_verification_email')
    @patch('app.requests.post')
    def test_verify_email(self, mock_auth_service_post, mock_send_email):
        # Simulate adding a pending registration
        email = "testuser@example.com"
        pending_registrations[email] = {
            "username": "testuser",
            "password": "securepassword",
            "wishlist": "[]",
            "categories": "test_category",
            "location": "test_location"
        }

        # Mock the send_verification_email function to return a token without sending an actual email
        with app.app_context():
            token = serializer.dumps(email, salt='email-confirm-salt')  # Generate token directly
            mock_send_email.return_value = token  # Mock return to avoid actual email sending

        # Mock authentication service response to simulate successful registration
        mock_auth_service_post.return_value.status_code = 201

        # Simulate verification link click
        response = self.client.get(f'/verify_email/{token}')
        
        # Check if the user was successfully created
        self.assertEqual(response.status_code, 201)
        self.assertIn("account created successfully", response.json['message'])
        
        # Verify that the user was moved from pending registrations to the database
        self.assertNotIn(email, pending_registrations)
        with app.app_context():
            user = User.query.filter_by(email=email).first()
            self.assertIsNotNone(user)
            self.assertTrue(user.email_verified)

    @patch('app.send_verification_email')
    def test_resend_verification(self, mock_send_email):
        # Simulate a pre-registration without email verification
        email = "testuser@example.com"
        pending_registrations[email] = {
            "username": "testuser",
            "password": "securepassword",
            "wishlist": "[]",
            "categories": "test_category",
            "location": "test_location"
        }

        response = self.client.post('/resend_verification', data=json.dumps({"email": email}), content_type='application/json')
        
        # Verify response and that send_verification_email is called
        self.assertEqual(response.status_code, 200)
        self.assertIn("Verification email resent", response.json['message'])
        mock_send_email.assert_called_once_with(email)

    def test_access_profile_without_verification(self):
        # Add an unverified user directly to the database for testing purposes
        with app.app_context():
            unverified_user = User(username="unverified", email="unverified@example.com",
                                   password="hashed_password", wishlist="[]", categories="none", location="nowhere")
            db.session.add(unverified_user)
            db.session.commit()
            user_id = unverified_user.id

        # Generate a JWT for the unverified user
        with app.app_context():
            access_token = create_access_token(identity=user_id)

        # Send a request with the token in headers
        headers = {"Authorization": f"Bearer {access_token}"}
        response = self.client.get('/profile', headers=headers)

        # Check for forbidden access due to lack of email verification
        self.assertEqual(response.status_code, 403)
        self.assertIn("Please verify your email", response.json['error'])

    def test_access_profile_with_verification(self):
        # Add a verified user to the database
        with app.app_context():
            verified_user = User(username="verified", email="verified@example.com", 
                                 password="hashed_password", wishlist="[]", categories="test_category", location="test_location")
            verified_user.email_verified = True
            db.session.add(verified_user)
            db.session.commit()
            user_id = verified_user.id

        # Generate a JWT for the verified user
        with app.app_context():
            access_token = create_access_token(identity=user_id)

        # Send a request with the token in headers
        headers = {"Authorization": f"Bearer {access_token}"}
        response = self.client.get('/profile', headers=headers)

        # Check for successful access
        self.assertEqual(response.status_code, 200)
        self.assertIn("username", response.json)
        self.assertEqual(response.json["username"], "verified")

if __name__ == '__main__':
    unittest.main()
