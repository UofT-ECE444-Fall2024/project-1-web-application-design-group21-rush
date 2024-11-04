from flask import Flask, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import uuid
import requests
import os
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


app = Flask(__name__)
app.config.from_pyfile('config.py')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user_service.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['SECRET_KEY'] = 'your_secret_key_for_token_generation'

db = SQLAlchemy(app)
jwt = JWTManager(app)

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# User model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, unique=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    wishlist = db.Column(db.Text, nullable=True)
    categories = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    email_verified = db.Column(db.Boolean, default=False)

    def __init__(self, username, email, password, wishlist, categories, location):
        self.id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password = generate_password_hash(password, method='pbkdf2:sha256')
        self.wishlist = wishlist
        self.categories = categories
        self.location = location

# In-memory store for pending registrations (use Redis or a database in production)
pending_registrations = {}

# Pre-Registration (Send Verification Email)
@app.route('/pre_register', methods=['POST'])
def pre_register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    wishlist = data.get('wishlist', "")
    categories = data.get('categories')
    location = data.get('location')

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this username or email already exists"}), 400

    # Temporarily store user data in pending registrations
    pending_registrations[email] = {
        "username": username,
        "password": password,
        "wishlist": wishlist,
        "categories": categories,
        "location": location,
    }

    # Generate and send a verification email
    send_verification_email(email)

    return jsonify({"message": "Verification email sent. Please verify your email to complete registration."}), 200

def send_verification_email(email):
    user_data = pending_registrations.get(email)
    if not user_data:
        return {"error": "User data not found for email verification"}

    # Generate a verification token
    token = serializer.dumps(email, salt='email-confirm-salt')

    with app.app_context():
        verification_url = url_for('verify_email', token=token, _external=True)

    # Email content
    subject = "Verify Your Email Address"
    sender_email = "your_sender_email@example.com"
    receiver_email = email
    smtp_server = "smtp.example.com"
    smtp_port = 587
    smtp_username = "your_smtp_username"
    smtp_password = "your_smtp_password"

    # Craft the email message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    text_content = f"Hello {user_data['username']},\n\nPlease verify your email by clicking the link below:\n{verification_url}\n\nThank you!"
    html_content = f"""
    <html>
      <body>
        <p>Hello {user_data['username']},<br><br>
           Please verify your email by clicking the link below:<br>
           <a href="{verification_url}">Verify Email</a><br><br>
           Thank you!
        </p>
      </body>
    </html>
    """

    # Attach both plain text and HTML versions
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)

    # Send the email via SMTP
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Upgrade the connection to secure
            server.login(smtp_username, smtp_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"Verification email sent to {receiver_email}")
    except Exception as e:
        print(f"Failed to send verification email: {e}")


# Verify Email and Complete Registration
@app.route('/verify_email/<token>', methods=['GET'])
def verify_email(token):
    try:
        email = serializer.loads(token, salt='email-confirm-salt', max_age=3600)  # 1 hour validity
        pending_data = pending_registrations.get(email)

        if not pending_data:
            return jsonify({"error": "Registration request not found or has expired"}), 400

        # Register user in authentication service
        auth_service_url = 'http://auth_service_host:5000/register'
        auth_response = requests.post(auth_service_url, json={"username": pending_data["username"], "password": pending_data["password"]})

        if auth_response.status_code != 201:
            return jsonify({"error": "Failed to create user in authentication service"}), 500

        # Create user in user service database
        user = User(
            username=pending_data["username"],
            email=email,
            password=pending_data["password"],
            wishlist=pending_data["wishlist"],
            categories=pending_data["categories"],
            location=pending_data["location"]
        )
        user.email_verified = True  # Mark as verified upon creation
        db.session.add(user)
        db.session.commit()

        # Remove from pending registrations
        del pending_registrations[email]

        return jsonify({"message": "Email verified and account created successfully"}), 201

    except (SignatureExpired, BadSignature):
        return jsonify({"error": "Verification link is invalid or has expired"}), 400


# Resend Verification Email (optional feature if user loses the initial email)
@app.route('/resend_verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')
    
    if email not in pending_registrations:
        return jsonify({"error": "No pending registration for this email"}), 400
    
    send_verification_email(email)
    return jsonify({"message": "Verification email resent"}), 200

# View Profile (requires email verification)
@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.email_verified:
        return jsonify({"error": "Please verify your email to access this data"}), 403

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "wishlist": user.wishlist,
        "categories": user.categories,
        "location": user.location,
    }
    return jsonify(user_data), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
