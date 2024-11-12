from flask import Flask, request, jsonify, url_for, current_app
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    jwt_required,
)
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import os
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import datetime
import json

from utils import (
    get_user_table,
    upload_to_user_table,
    get_user_by_id,
    get_user_by_username,
    scan_users_by_attribute,
    update_user,
    upload_to_user_s3,
)

db = SQLAlchemy()


def send_verification_email(email, username, serializer):
    """
    Sends a verification email to the specified email address.
    """
    # Generate a verification token
    token = serializer.dumps(email, salt="email-confirm-salt")

    # Build the verification URL
    verification_url = url_for("verify_email", token=token, _external=True)

    # Email content
    subject = "Verify Your Email Address"
    sender_email = current_app.config["SENDER_EMAIL"]
    smtp_server = current_app.config["SMTP_SERVER"]
    smtp_port = current_app.config["SMTP_PORT"]
    smtp_username = current_app.config["SMTP_USERNAME"]
    smtp_password = current_app.config["SMTP_PASSWORD"]

    receiver_email = email

    # Craft the email message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    text_content = f"Hello {username},\n\nPlease verify your email by clicking the link below:\n{verification_url}\n\nThank you!"
    html_content = f"""
    <html>
      <body>
        <p>Hello {username},<br><br>
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
        current_app.logger.info(f"Verification email sent to {receiver_email}")
        return token
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {e}")
        return None


def send_password_reset_email(email, username, serializer):
    """
    Sends a password reset email to the specified email address.
    """
    # Generate a password reset token
    token = serializer.dumps(email, salt="password-reset-salt")

    # Build the password reset URL
    frontend_base_url = "https://uoftsecondhandhub.com"  # Change this to your frontend's URL
    reset_url = f"{frontend_base_url}/reset_password/{token}"

    # reset_url = url_for("reset_password", token=token, _external=True)

    # Email content
    subject = "Password Reset Request"
    sender_email = current_app.config["SENDER_EMAIL"]
    smtp_server = current_app.config["SMTP_SERVER"]
    smtp_port = current_app.config["SMTP_PORT"]
    smtp_username = current_app.config["SMTP_USERNAME"]
    smtp_password = current_app.config["SMTP_PASSWORD"]

    receiver_email = email

    # Craft the email message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    text_content = f"""Hello {username},

We received a request to reset your password. Please click the link below to reset your password:

{reset_url}

If you did not request a password reset, please ignore this email.

Thank you!
"""
    html_content = f"""
    <html>
      <body>
        <p>Hello {username},<br><br>
           We received a request to reset your password. Please click the link below to reset your password:<br>
           <a href="{reset_url}">Reset Password</a><br><br>
           If you did not request a password reset, please ignore this email.<br><br>
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
        current_app.logger.info(f"Password reset email sent to {receiver_email}")
        return token
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email: {e}")
        return None


def create_app(config_filename=None):
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://uoftsecondhandhub.com"]}},
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])


    # Load configuration
    if config_filename:
        app.config.from_pyfile(config_filename)
    else:
        app.config.from_mapping(
            SECRET_KEY=os.getenv("SECRET_KEY", "default-secret-key"),
            JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "default-jwt-secret-key"),
            SMTP_SERVER=os.getenv("SMTP_SERVER", "smtp.default.com"),
            SMTP_PORT=int(os.getenv("SMTP_PORT", 587)),
            SMTP_USERNAME=os.getenv("SMTP_USERNAME", "default_smtp_user"),
            SMTP_PASSWORD=os.getenv("SMTP_PASSWORD", "default_smtp_password"),
            SENDER_EMAIL=os.getenv("SENDER_EMAIL", "no-reply@default.com"),
            AWS_ACCESS_KEY_ID=os.getenv("AWS_ACCESS_KEY_ID", "default_access_key"),
            AWS_SECRET_ACCESS_KEY=os.getenv(
                "AWS_SECRET_ACCESS_KEY", "default_secret_key"
            ),
            AWS_S3_USERS_BUCKET_NAME=os.getenv(
                "AWS_S3_USERS_BUCKET_NAME", "default_users_bucket"
            ),
            AWS_DB_USERS_TABLE_NAME=os.getenv(
                "AWS_DB_USERS_TABLE_NAME", "default_users_table"
            ),
            AWS_S3_REGION=os.getenv("AWS_S3_REGION", "us-east-2"),
            SQLALCHEMY_DATABASE_URI=os.getenv(
                "DATABASE_URI", "sqlite:///tokens.db"
            ),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            JWT_ACCESS_TOKEN_EXPIRES=datetime.timedelta(minutes=30),
        )

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Initialize serializer and attach to app
    serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])
    app.serializer = serializer

    # Initialize pending registrations store
    app.pending_registrations = {}

    # Register routes
    register_routes(app)

    # Configure logging (optional but recommended)
    configure_logging(app)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Set up JWT token-in-blacklist callback
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    return app


def configure_logging(app):
    """
    Configures logging for the Flask application.
    """
    import logging
    from logging.handlers import RotatingFileHandler

    handler = RotatingFileHandler("app.log", maxBytes=100000, backupCount=3)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
    )
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)


class TokenBlocklist(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)


def register_routes(app):
    """
    Registers all routes with the Flask application.
    """

    @app.route("/api/users/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy"}), 200

    @app.route("/health", methods=["GET"])
    def simple_health_check():
        return jsonify({"status": "healthy"}), 200

    @app.route("/api/users/pre_register", methods=["POST"])
    def pre_register():
        app.logger.info("Received pre-registration request")
        data = request.get_json()
        if not data:
            app.logger.warning("No JSON payload received")
            return jsonify({"error": "Invalid input"}), 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        wishlist = data.get("wishlist", "")
        categories = data.get("categories", "")
        location = data.get("location", "")

        # Input validation
        if not all([username, email, password]):
            app.logger.warning("Missing required fields in pre-registration")
            return jsonify({"error": "Username, email, and password are required"}), 400

        # Check if username or email already exists
        exists_username = scan_users_by_attribute("username", username)
        exists_email = scan_users_by_attribute("email", email)

        if exists_username and exists_email:
            assert(len(exists_username) == 1 and len(exists_email) == 1)
            app.logger.info(
                f"Pre-registration failed: Username and email already exist for {email}"
            )
            return (
                jsonify({"error": "User with this username and email already exists"}),
                400,
            )
        elif exists_username:
            assert(len(exists_username) == 1)
            app.logger.info(
                f"Pre-registration failed: Username already exists for {username}"
            )
            return jsonify({"error": "User with this username already exists"}), 400
        elif exists_email:
            assert(len(exists_email) == 1)
            app.logger.info(
                f"Pre-registration failed: Email already exists for {email}"
            )
            return jsonify({"error": "User with this email already exists"}), 400

        # Temporarily store user data in pending registrations
        app.pending_registrations[email] = {
            "username": username,
            "password": password,
            "wishlist": wishlist,
            "categories": categories,
            "location": location,
        }

        app.logger.info(f"Pending registration created for {email}")

        # Generate and send a verification email
        token = send_verification_email(email, username, app.serializer)

        if token:
            app.logger.info(f"Verification email sent to {email}")
            return (
                jsonify(
                    {
                        "message": "Verification email sent. Please verify your email to complete registration."
                    }
                ),
                200,
            )
        else:
            # Cleanup pending registration if email sending fails
            del app.pending_registrations[email]
            app.logger.error(f"Failed to send verification email to {email}")
            return (
                jsonify(
                    {
                        "message": "Failed to send verification email. Please try again later."
                    }
                ),
                500,
            )

    @app.route("/api/users/verify_email/<token>", methods=["GET"])
    def verify_email(token):
        app.logger.info("Received email verification request")
        try:
            # Decode the token to get the email
            email = app.serializer.loads(
                token, salt="email-confirm-salt", max_age=3600
            )  # 1 hour validity
            app.logger.info(f"Token decoded successfully for {email}")

            pending_data = app.pending_registrations.get(email)

            if not pending_data:
                app.logger.warning(f"No pending registration found for {email}")
                return (
                    jsonify({"error": "Registration request not found or has expired"}),
                    400,
                )

            # Create user in user service database via DynamoDB
            user_data = {
                "id": str(uuid.uuid4()),  # Assuming 'id' is the primary key
                "username": pending_data["username"],
                "email": email,
                "password": generate_password_hash(pending_data["password"]),
                "wishlist": pending_data["wishlist"],
                "categories": pending_data["categories"],
                "location": pending_data["location"],
                "email_verified": True,
            }
            app.logger.info(f"Uploading user data to DynamoDB for {email}")
            success = upload_to_user_table(user_data)

            if not success:
                app.logger.error(f"Failed to create user in database for {email}")
                return jsonify({"error": "Failed to create user in database"}), 500

            # Remove from pending registrations
            del app.pending_registrations[email]
            app.logger.info(
                f"User {email} successfully registered and pending registration removed"
            )

            return (
                jsonify({"message": "Email verified and account created successfully"}),
                201,
            )

        except SignatureExpired:
            app.logger.warning("Verification link has expired")
            return (
                jsonify({"error": "Verification link is invalid or has expired"}),
                400,
            )
        except BadSignature:
            app.logger.warning("Invalid verification token")
            return (
                jsonify({"error": "Verification link is invalid or has expired"}),
                400,
            )
        except Exception as e:
            app.logger.error(
                f"An unexpected error occurred during email verification: {e}"
            )
            return jsonify({"error": "An unexpected error occurred"}), 500

    @app.route("/api/users/resend_verification", methods=["POST"])
    def resend_verification():
        app.logger.info("Received request to resend verification email")
        data = request.get_json()
        if not data:
            app.logger.warning("No JSON payload received for resend verification")
            return jsonify({"error": "Invalid input"}), 400

        email = data.get("email")

        if not email:
            app.logger.warning("Email not provided in resend verification request")
            return jsonify({"error": "Email is required"}), 400

        pending_data = app.pending_registrations.get(email)

        if not pending_data:
            app.logger.info(f"No pending registration found for {email}")
            return jsonify({"error": "No pending registration for this email"}), 400

        # Generate and send a new verification email
        token = send_verification_email(email, pending_data["username"], app.serializer)

        if token:
            app.logger.info(f"Verification email resent to {email}")
            return jsonify({"message": "Verification email resent"}), 200
        else:
            app.logger.error(f"Failed to resend verification email to {email}")
            return jsonify({"message": "Failed to resend verification email"}), 500
    
    @app.route("/api/users/is_username_existing", methods=["GET"])
    def is_username_existing():
        # Get the 'username' parameter from the query string
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "Username parameter is required"}), 400

        # Check if a user with this username exists
        existing_user = scan_users_by_attribute("username", username)
        if existing_user:
            return jsonify({"exists": True}), 200
        else:
            return jsonify({"exists": False}), 200


    @app.route("/api/users/is_email_existing", methods=["GET"])
    def is_email_existing():
        # Get the 'email' parameter from the query string
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400

        # Check if a user with this email exists
        existing_user = scan_users_by_attribute("email", email)
        if existing_user:
            return jsonify({"exists": True}), 200
        else:
            return jsonify({"exists": False}), 200
    
    @app.route("/api/users/login", methods=["POST"])
    def login():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid input"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Fetch users by email (returns a list)
        users = scan_users_by_attribute("email", email)
        if not users or len(users) == 0:
            return jsonify({"error": "Invalid email or password"}), 401

        # Since email should be unique, take the first user
        user = users[0]

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        if not user.get("email_verified"):
            return jsonify({"error": "Email not verified"}), 403

        # Generate a JWT token
        access_token = create_access_token(identity=user["id"])
        return jsonify({"access_token": access_token, "message": "Login successful"}), 200

    @app.route("/api/users/logout", methods=["POST"])
    @jwt_required()
    def logout():
        jti = get_jwt()["jti"]
        now = datetime.datetime.utcnow()
        db.session.add(TokenBlocklist(jti=jti, created_at=now))
        db.session.commit()
        return jsonify({"message": "Successfully logged out"}), 200

    @app.route("/api/users/user_id", methods=["GET"])
    @jwt_required()
    def get_user_id():
        # Retrieve the user's ID from the JWT token
        user_id = get_jwt_identity()
        return jsonify({"user_id": user_id}), 200

    @app.route("/api/users/wishlist/get", methods=["GET"])
    @jwt_required()
    def get_wishlist():
        user_id = get_jwt_identity()
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        wishlist = user.get("wishlist", [])
        return jsonify({"wishlist": wishlist}), 200

    @app.route("/api/users/user_info/<username>", methods=["GET"])
    @jwt_required()
    def get_user_info(username):
        if not username:
            return jsonify({"error": "Username parameter is required"}), 400
        
        try:
            user_info = get_user_by_username(username)
            
            if not user_info:
                return jsonify({"error": "User not found"}), 404
            
            else:
                return jsonify(user_info), 200
                            
        except Exception as e:
            return jsonify({"error": "Could not access user database", "details": str(e)}), 500

    @app.route("/api/users/current_user_info", methods=["GET"])
    @jwt_required()
    def get_current_user_info():
        user_id = get_jwt_identity()
        try:
            user_info = get_user_by_id(user_id)
            
            if not user_info:
                return jsonify({"error": "User not found"}), 404
            
            else:
                return jsonify(user_info), 200
                            
        except Exception as e:
            return jsonify({"error": "Could not access user database", "details": str(e)}), 500


    @app.route("/api/users/public_user_info", methods=["GET"])
    @jwt_required()
    def get_public_user_info():
        username = request.args.get("username")
        
        if not username:
            return jsonify({"error": "Username parameter is required"}), 400
        
        users = scan_users_by_attribute("username", username)
        if not users or len(users) == 0:
            return jsonify({"error": "User not found"}), 404
        
        # Since username should be unique, take the first user
        user = users[0]
        
        # Construct public user info
        public_fields = ['id', 'username', 'email', 'categories', 'location']
        public_user_info = {field: user.get(field) for field in public_fields if field in user}
        
        return jsonify(public_user_info), 200

    @app.route("/api/users/wishlist", methods=["POST"])
    @jwt_required()
    def add_to_wishlist():
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or "listingId" not in data:
            return jsonify({"error": "Listing ID is required"}), 400

        listing_id = data["listingId"]

        # Fetch user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Initialize wishlist as list if it doesn't exist or is a string
        if not user.get("wishlist") or isinstance(user["wishlist"], str):
            user["wishlist"] = []
        
        # Update the user's wishlist
        if listing_id not in user["wishlist"]:
            user["wishlist"].append(listing_id)

        success = update_user(user_id, {"wishlist": user["wishlist"]})
        if not success:
            return jsonify({"error": "Failed to update wishlist"}), 500

        return (
            jsonify({"message": "Listing added to wishlist", "wishlist": user["wishlist"]}),
            200,
        )

    @app.route("/api/users/wishlist/<listing_id>", methods=["DELETE"])
    @jwt_required()
    def remove_from_wishlist(listing_id):
        user_id = get_jwt_identity()
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        wishlist = user.get("wishlist", [])
        if listing_id in wishlist:
            wishlist.remove(listing_id)
            update_user(user_id, {"wishlist": wishlist})
            
        return jsonify({"message": "Removed from wishlist", "wishlist": wishlist}), 200

    @app.route("/api/users/edit_user", methods=["POST"])
    @jwt_required()
    def edit_user():
        user_id = get_jwt_identity()
        data = request.form.to_dict()

        # Optional: new images
        files = request.files.getlist('file')  # Optional: new images
    
        # If there is new image, upload it to S3
        if files:
            for file in files:
                filename = f"users/{user_id}/{file.filename}"  # Store in a folder named by listing id
                file_url = upload_to_user_s3(file, filename)
                if file_url:
                    data['profile_picture'] = file_url
                else:
                    return jsonify({'error': 'Failed to upload one or more images'}), 500
    
        if 'file' in data:
            del data['file']  # Remove the file key from data dictionary
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        if 'categories' in data:
            data['categories'] = json.loads(data['categories'])
       
        # Define fields that are allowed to be updated and their expected types
        allowed_fields = {
            "username": str,
            "wishlist": list,
            "categories": list,
            "location": str,
            "profile_picture": str,
        }

        # Identify any disallowed fields in the input
        disallowed_fields = set(data.keys()) - set(allowed_fields.keys())

        if disallowed_fields:
            current_app.logger.warning(
                f"User {user_id} attempted to modify restricted fields: {disallowed_fields}"
            )
            return jsonify({
                "error": f"Modification of fields {', '.join(disallowed_fields)} is not allowed."
            }), 400

        # Validate data types
        invalid_fields = []
        for field, expected_type in allowed_fields.items():
            if field in data and not isinstance(data[field], expected_type):
                invalid_fields.append(field)

        if invalid_fields:
            current_app.logger.warning(
                f"User {user_id} provided invalid types for fields: {invalid_fields}"
            )
            return jsonify({
                "error": f"Invalid data types for fields: {', '.join(invalid_fields)}"
            }), 400

        # Proceed to update with only allowed fields
        try:
            if update_user(user_id, data):
                current_app.logger.info(f"User {user_id} updated successfully with data: {data}")
                return jsonify({"message": "Updated user successfully"}), 200
            else:
                current_app.logger.error(f"Failed to update user {user_id} with data: {data}")
                return jsonify({"error": "Failed to update user"}), 500
        except Exception as e:
            current_app.logger.exception(f"An error occurred while updating user {user_id}: {e}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    @app.route("/api/users/wishlist/check", methods=["POST"])
    @jwt_required()
    def check_wishlist():
        user_id = get_jwt_identity()
        data = request.get_json(silent=True)

        if not data or "listingId" not in data:
            return jsonify({"error": "Listing ID is required"}), 400

        listing_id = data["listingId"]

        # Fetch user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the listing ID is in the user's wishlist
        wishlist = user.get("wishlist", [])
        is_in_wishlist = listing_id in wishlist

        return jsonify({"is_in_wishlist": is_in_wishlist}), 200


    @app.route("/api/users/change_password", methods=["POST"])
    @jwt_required()
    def change_password():
        """
        Allows an authenticated user to change their password.
        Required fields:
        - old_password
        - new_password
        """
        app.logger.info("Received change password request")
        data = request.get_json()
        if data is None:
            app.logger.warning("No JSON payload received for change password")
            return jsonify({"error": "Invalid input"}), 400

        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            app.logger.warning("Missing old_password or new_password in request")
            return jsonify({"error": "Old password and new password are required"}), 400

        user_id = get_jwt_identity()
        user = get_user_by_id(user_id)

        if not user:
            app.logger.warning(f"User not found with ID: {user_id}")
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user["password"], old_password):
            app.logger.warning(f"Incorrect old password for user ID: {user_id}")
            return jsonify({"error": "Incorrect old password"}), 401

        if old_password == new_password:
            app.logger.warning("Old password and new password are the same")
            return jsonify({"error": "New password must be different"}), 400

        # Update the password
        hashed_new_password = generate_password_hash(new_password)
        success = update_user(user_id, {"password": hashed_new_password})

        if not success:
            app.logger.error(f"Failed to update password for user ID: {user_id}")
            return jsonify({"error": "Failed to update password"}), 500

        app.logger.info(f"Password changed successfully for user ID: {user_id}")
        return jsonify({"message": "Password changed successfully"}), 200


    @app.route("/api/users/forgot_password", methods=["POST"])
    def forgot_password():
        """
        Initiates the password reset process by sending a reset email to the user.
        Required fields:
        - email
        """
        app.logger.info("Received forgot password request")
        data = request.get_json()
        if data is None:
            app.logger.warning("No JSON payload received for forgot password")
            return jsonify({"error": "Invalid input"}), 400

        email = data.get("email")
        if not email:
            app.logger.warning("Email not provided in forgot password request")
            return jsonify({"error": "Email is required"}), 400

        # Check if the user exists
        users = scan_users_by_attribute("email", email)
        if not users:
            app.logger.warning(f"Forgot password requested for non-existent email: {email}")
            # To prevent email enumeration, respond with a generic message
            return jsonify({"message": "If the email exists, a reset link has been sent."}), 200

        assert(len(users) == 1)
        user = users[0]
        username = user["username"]

        # Generate and send a password reset email
        token = send_password_reset_email(email, username, app.serializer)

        if token:
            app.logger.info(f"Password reset email sent to {email}")
            return jsonify({"message": "If the email exists, a reset link has been sent."}), 200
        else:
            app.logger.error(f"Failed to send password reset email to {email}")
            return jsonify({"message": "Failed to send password reset email. Please try again later."}), 500


    @app.route("/api/users/reset_password/<token>", methods=["POST"])
    def reset_password(token):
        """
        Resets the user's password using the provided token.
        Required fields:
        - new_password
        """

        app.logger.info("Received reset password request")
        data = request.get_json()
        if data is None:
            app.logger.warning("No JSON payload received for reset password")
            return jsonify({"error": "Invalid input"}), 400

        new_password = data.get("new_password")
        if not new_password:
            app.logger.warning("New password not provided in reset password request")
            return jsonify({"error": "New password is required"}), 400

        try:
            # Decode the token to get the email
            email = app.serializer.loads(
                token, salt="password-reset-salt", max_age=3600
            )  # 1 hour validity
            app.logger.info(f"Token decoded successfully for {email}")

            # Fetch user data
            users = scan_users_by_attribute("email", email)
            if not users:
                app.logger.warning(f"No user found for email: {email}")
                return jsonify({"error": "Invalid token or user does not exist"}), 400

            assert(len(users) == 1)
            user = users[0]
            user_id = user["id"]

            # Update the user's password
            hashed_new_password = generate_password_hash(new_password)
            success = update_user(user_id, {"password": hashed_new_password})

            if not success:
                app.logger.error(f"Failed to update password for user ID: {user_id}")
                return jsonify({"error": "Failed to update password"}), 500

            app.logger.info(f"Password reset successfully for user ID: {user_id}")
            return jsonify({"message": "Password has been reset successfully"}), 200

        except SignatureExpired:
            app.logger.warning("Password reset link has expired")
            return jsonify({"error": "Reset link has expired"}), 400
        except BadSignature:
            app.logger.warning("Invalid password reset token")
            return jsonify({"error": "Invalid reset link"}), 400
        except Exception as e:
            app.logger.error(f"An unexpected error occurred during password reset: {e}")
            return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    app = create_app()
    app.run(port=5005, debug=True)
