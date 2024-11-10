from flask import Flask, request, jsonify, url_for, current_app
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import os
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from utils import (
    get_user_table,
    upload_to_user_table,
    get_user_by_id,
    scan_users_by_attribute,
    update_user,
)


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


def create_app(config_filename=None):
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)

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
        )

    # Initialize extensions
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
            app.logger.info(
                f"Pre-registration failed: Username and email already exist for {email}"
            )
            return (
                jsonify({"error": "User with this username and email already exists"}),
                400,
            )
        elif exists_username:
            app.logger.info(
                f"Pre-registration failed: Username already exists for {username}"
            )
            return jsonify({"error": "User with this username already exists"}), 400
        elif exists_email:
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

    @app.route("/api/users/login", methods=["POST"])
    def login():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid input"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Fetch user by email
        user = scan_users_by_attribute("email", email)
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        if not user.get("email_verified"):
            return jsonify({"error": "Email not verified"}), 403

        # Generate a JWT token
        access_token = create_access_token(identity=user["id"])
        return (
            jsonify({"access_token": access_token, "message": "Login successful"}),
            200,
        )

    @app.route("/api/users/logout", methods=["POST"])
    @jwt_required()
    def logout():
        # Blacklist token if required (e.g., add token to blacklist in a DB or cache)
        return jsonify({"message": "Successfully logged out"}), 200

    @app.route("/api/users/user_id", methods=["GET"])
    @jwt_required()
    def get_user_id():
        # Retrieve the user's ID from the JWT token
        user_id = get_jwt_identity()
        return jsonify({"user_id": user_id}), 200

    @app.route("/api/users/wishlist", methods=["POST"])
    @jwt_required()
    def add_to_wishlist():
        # This retrieves the user ID stored in the JWT token
        user_id = get_jwt_identity()
        data = request.get_json(silent=True)

        if not data or "listingId" not in data:
            return jsonify({"error": "Listing ID is required"}), 400

        listing_id = data["listingId"]

        # Fetch user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update the user's wishlist
        wishlist = user.get("wishlist", [])
        if listing_id not in wishlist:
            wishlist.append(listing_id)

        success = update_user(user_id, {"wishlist": wishlist})
        if not success:
            return jsonify({"error": "Failed to update wishlist"}), 500

        return (
            jsonify({"message": "Listing added to wishlist", "wishlist": wishlist}),
            200,
        )


if __name__ == "__main__":
    app = create_app()
    app.run(port=5000, debug=True)
