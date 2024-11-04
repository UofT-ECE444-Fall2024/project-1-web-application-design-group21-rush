import boto3
from flask import current_app

def upload_to_listings_s3(file, filename):
    s3_client = boto3.client(
        's3',
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
        region_name=current_app.config['AWS_S3_REGION']
    )

    try:
        s3_client.upload_fileobj(
            file,
            current_app.config['AWS_S3_LISTINGS_BUCKET_NAME'],
            filename
        )
        return f"https://{current_app.config['AWS_S3_LISTINGS_BUCKET_NAME']}.s3.amazonaws.com/{filename}"
    except Exception as e:
        current_app.logger.error(f"Failed to upload to S3: {e}")
        return None

