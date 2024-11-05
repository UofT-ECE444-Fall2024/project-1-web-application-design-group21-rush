import boto3
from flask import current_app

def upload_to_users_s3(file, filename):
    s3_client = boto3.client(
        's3',
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
        region_name=current_app.config['AWS_S3_REGION']
    )

    try:
        s3_client.upload_fileobj(
            file,
            current_app.config['AWS_S3_USERS_BUCKET_NAME'],
            filename
        )
        return f"https://{current_app.config['AWS_S3_USERS_BUCKET_NAME']}.s3.amazonaws.com/{filename}"
    except Exception as e:
        current_app.logger.error(f"Failed to upload to S3: {e}")
        return None

def add_listing_id_to_user(user_id, listing_id):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

    user_table = dynamodb.Table(current_app.config['AWS_DB_USERS_TABLE_NAME'])

    try:
        user_table.update_item(
            Key={'id': user_id},
            UpdateExpression="ADD listings :new_listing_id",
            ExpressionAttributeValues={':new_listing_id': {listing_id}},
            ConditionExpression="attribute_exists(id)",  # Ensure the user exists
        )
        current_app.logger.info(f"Listing ID {listing_id} added to user {user_id}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to add listing ID to user: {e}")
        return False