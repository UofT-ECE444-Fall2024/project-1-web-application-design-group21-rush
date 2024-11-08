# tests/test_app.py

import unittest
from unittest.mock import patch, MagicMock
import json
import os
from dotenv import load_dotenv
from itsdangerous import BadSignature, SignatureExpired

# Load environment variables from .env.test
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.test'))

from app import create_app

class TestFlaskApp(unittest.TestCase):
    def setUp(self):
        # Create a test app instance with testing configuration
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Access the pending_registrations from the app instance
        self.pending_registrations = self.app.pending_registrations
        self.pending_registrations.clear()

    @patch('app.send_verification_email')
    @patch('app.scan_users_by_attribute')
    def test_pre_register_success(self, mock_scan_users, mock_send_verification_email):
        # Mock scan_users_by_attribute to return no existing user
        mock_scan_users.return_value = []

        # Mock send_verification_email to return a token
        mock_send_verification_email.return_value = 'test-token'

        # Define the user data
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123",
            "wishlist": "Books, Electronics",
            "categories": "Fiction, Gadgets",
            "location": "New York"
        }

        # Send POST request to /pre_register
        response = self.client.post('/pre_register',
                                    data=json.dumps(user_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Verification email sent", response.data)

        # Verify that the pending_registrations is updated
        self.assertIn("test@example.com", self.pending_registrations)
        self.assertEqual(self.pending_registrations["test@example.com"]["username"], "testuser")

        # Verify that send_verification_email was called with the correct email, username, and serializer
        mock_send_verification_email.assert_called_with(
            "test@example.com",
            "testuser",
            self.app.serializer
        )

    @patch('app.scan_users_by_attribute')
    def test_pre_register_existing_username(self, mock_scan_users):
        # Mock scan_users_by_attribute to return existing username
        def side_effect(attribute, value):
            if attribute == "username" and value == "testuser":
                return [{"username": "testuser"}]
            return []
        mock_scan_users.side_effect = side_effect

        # Define the user data
        user_data = {
            "username": "testuser",
            "email": "newemail@example.com",
            "password": "TestPassword123",
            "wishlist": "",
            "categories": "",
            "location": ""
        }

        # Send POST request to /pre_register
        response = self.client.post('/pre_register',
                                    data=json.dumps(user_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"User with this username already exists", response.data)

    @patch('app.scan_users_by_attribute')
    def test_pre_register_existing_email(self, mock_scan_users):
        # Mock scan_users_by_attribute to return existing email
        def side_effect(attribute, value):
            if attribute == "email" and value == "test@example.com":
                return [{"email": "test@example.com"}]
            return []
        mock_scan_users.side_effect = side_effect

        # Define the user data
        user_data = {
            "username": "newuser",
            "email": "test@example.com",
            "password": "TestPassword123",
            "wishlist": "",
            "categories": "",
            "location": ""
        }

        # Send POST request to /pre_register
        response = self.client.post('/pre_register',
                                    data=json.dumps(user_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"User with this email already exists", response.data)

    @patch('app.scan_users_by_attribute')
    def test_pre_register_existing_username_and_email(self, mock_scan_users):
        # Mock scan_users_by_attribute to return existing username and email
        def side_effect(attribute, value):
            if (attribute == "username" and value == "testuser") or (attribute == "email" and value == "test@example.com"):
                return [{"username": "testuser", "email": "test@example.com"}]
            return []
        mock_scan_users.side_effect = side_effect

        # Define the user data
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123",
            "wishlist": "",
            "categories": "",
            "location": ""
        }

        # Send POST request to /pre_register
        response = self.client.post('/pre_register',
                                    data=json.dumps(user_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"User with this username and email already exists", response.data)

    def test_verify_email_success(self):
        with patch.object(self.app.serializer, 'loads', return_value="test@example.com"), \
             patch('app.upload_to_user_table') as mock_upload_to_user_table:

            # Add a pending registration
            self.pending_registrations["test@example.com"] = {
                "username": "testuser",
                "password": "TestPassword123",
                "wishlist": "",
                "categories": "",
                "location": ""
            }

            # Mock upload_to_user_table to return True
            mock_upload_to_user_table.return_value = True

            # Send GET request to /verify_email/<token>
            response = self.client.get('/verify_email/test-token')

            # Check the response
            self.assertEqual(response.status_code, 201)
            self.assertIn(b"Email verified and account created successfully", response.data)

            # Verify that the user was created in database
            mock_upload_to_user_table.assert_called()
            args, kwargs = mock_upload_to_user_table.call_args
            user_data = args[0]
            self.assertEqual(user_data["username"], "testuser")
            self.assertEqual(user_data["email"], "test@example.com")
            self.assertEqual(user_data["wishlist"], "")
            self.assertEqual(user_data["categories"], "")
            self.assertEqual(user_data["location"], "")
            self.assertTrue(user_data["email_verified"])

            # Verify that the pending registration was removed
            self.assertNotIn("test@example.com", self.pending_registrations)

    def test_verify_email_invalid_token(self):
        with patch.object(self.app.serializer, 'loads', side_effect=BadSignature("Invalid signature")):
            # Send GET request to /verify_email/<invalid_token>
            response = self.client.get('/verify_email/invalid-token')

            # Check the response
            self.assertEqual(response.status_code, 400)
            self.assertIn(b"Verification link is invalid or has expired", response.data)

    def test_verify_email_expired_token(self):
        with patch.object(self.app.serializer, 'loads', side_effect=SignatureExpired("Signature expired")):
            # Send GET request to /verify_email/<expired_token>
            response = self.client.get('/verify_email/expired-token')

            # Check the response
            self.assertEqual(response.status_code, 400)
            self.assertIn(b"Verification link is invalid or has expired", response.data)

    def test_verify_email_no_pending_registration(self):
        with patch.object(self.app.serializer, 'loads', return_value="nonexistent@example.com"):
            # Ensure no pending registration exists
            self.pending_registrations.pop("nonexistent@example.com", None)

            # Send GET request to /verify_email/<token>
            response = self.client.get('/verify_email/test-token')

            # Check the response
            self.assertEqual(response.status_code, 400)
            self.assertIn(b"Registration request not found or has expired", response.data)

    @patch('app.send_verification_email')
    def test_resend_verification_success(self, mock_send_verification_email):
        # Add a pending registration
        self.pending_registrations["test@example.com"] = {
            "username": "testuser",
            "password": "TestPassword123",
            "wishlist": "",
            "categories": "",
            "location": ""
        }

        # Mock send_verification_email to return a token
        mock_send_verification_email.return_value = 'new-test-token'

        # Define the resend data
        resend_data = {
            "email": "test@example.com"
        }

        # Send POST request to /resend_verification
        response = self.client.post('/resend_verification',
                                    data=json.dumps(resend_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Verification email resent", response.data)

        # Verify that send_verification_email was called with the correct email, username, and serializer
        mock_send_verification_email.assert_called_with(
            "test@example.com",
            "testuser",
            self.app.serializer
        )

    def test_resend_verification_no_pending_registration(self):
        # Define the resend data with no pending registration
        resend_data = {
            "email": "nonexistent@example.com"
        }

        # Send POST request to /resend_verification
        response = self.client.post('/resend_verification',
                                    data=json.dumps(resend_data),
                                    content_type='application/json')

        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"No pending registration for this email", response.data)

if __name__ == '__main__':
    unittest.main()
