import os
import pytest
import boto3
from app import app

# set these in your own environment when testing (just match the docker-compose.yml file)
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_S3_USERS_BUCKET_NAME = os.getenv('AWS_S3_USERS_BUCKET_NAME')
AWS_S3_REGION = os.getenv('AWS_S3_REGION')

@pytest.fixture
def client():
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client

def test_real_users_s3_upload(client):
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_S3_REGION
    )

    image_path = 'user_profile_service/test_image.jpg'
    with open(image_path, 'rb') as img_file:
        data = {
            'file': (img_file, 'test_image.jpg')
        }

        # upload test_image.jpg to the users bucket
        response = client.post('/upload', data=data, content_type='multipart/form-data')

        assert response.status_code == 200
        response_data = response.get_json()
        assert 'file_url' in response_data

        response = s3_client.list_objects_v2(Bucket=AWS_S3_USERS_BUCKET_NAME)
        file_exists = any(obj['Key'] == 'users/test_image.jpg' for obj in response.get('Contents', []))
        assert file_exists, "Uploaded file not found in S3 bucket"

    # delete the test image from the users bucket
    s3_client.delete_object(Bucket=AWS_S3_USERS_BUCKET_NAME, Key='users/test_image.jpg')
