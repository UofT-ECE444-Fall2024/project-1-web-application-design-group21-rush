import os

# AWS S3 configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_S3_USERS_BUCKET_NAME = os.getenv('AWS_S3_USERS_BUCKET_NAME')
AWS_S3_REGION = os.getenv('AWS_S3_REGION', 'us-east-2') 
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# SMTP email server configuration
SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_PORT = os.getenv('SMTP_PORT')
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
SENDER_EMAIL = os.getenv('SENDER_EMAIL')