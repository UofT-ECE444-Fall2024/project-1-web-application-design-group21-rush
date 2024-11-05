import os
import pytest
import boto3
from app import app
from dotenv import load_dotenv
from datetime import datetime
import uuid
from unittest.mock import patch, MagicMock
from io import BytesIO

load_dotenv()

# Set these in your own environment when testing (match the docker-compose.yml file or provide defaults)
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "test_access_key")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "test_secret_key")
AWS_S3_LISTINGS_BUCKET_NAME = os.getenv("AWS_S3_LISTINGS_BUCKET_NAME", "test-bucket")
AWS_DB_LISTINGS_TABLE_NAME = os.getenv("AWS_DB_LISTINGS_TABLE_NAME", "test-table")
AWS_S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")


@pytest.fixture
def client():
    app.config["TESTING"] = True
    # Set up AWS configurations
    app.config["AWS_ACCESS_KEY_ID"] = AWS_ACCESS_KEY_ID
    app.config["AWS_SECRET_ACCESS_KEY"] = AWS_SECRET_ACCESS_KEY
    app.config["AWS_S3_REGION"] = AWS_S3_REGION
    app.config["AWS_S3_LISTINGS_BUCKET_NAME"] = AWS_S3_LISTINGS_BUCKET_NAME
    app.config["AWS_DB_LISTINGS_TABLE_NAME"] = AWS_DB_LISTINGS_TABLE_NAME
    # Add any other necessary configurations here

    with app.test_client() as client:
        yield client


def test_real_listings_s3_upload(client):
    # Use BytesIO instead of actual file
    img_file = BytesIO(b"Test image content")
    img_file.name = "test_image.jpg"  # Set a name attribute if needed
    data = {"file": (img_file, "test_image.jpg")}

    # Upload test_image.jpg to the listings bucket
    response = client.post("/upload", data=data, content_type="multipart/form-data")

    assert response.status_code == 200
    response_data = response.get_json()
    assert "file_url" in response_data

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=app.config["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=app.config["AWS_SECRET_ACCESS_KEY"],
        region_name=app.config["AWS_S3_REGION"],
    )

    response = s3_client.list_objects_v2(
        Bucket=app.config["AWS_S3_LISTINGS_BUCKET_NAME"]
    )
    file_exists = any(
        obj["Key"] == "listings/test_image.jpg" for obj in response.get("Contents", [])
    )
    assert file_exists, "Uploaded file not found in S3 bucket"

    # Delete the test image from the listings bucket
    s3_client.delete_object(
        Bucket=app.config["AWS_S3_LISTINGS_BUCKET_NAME"], Key="listings/test_image.jpg"
    )


def test_real_listings_dynamodb_and_s3_upload(client):
    # Mock requests.post to simulate user service
    with patch("requests.post") as mock_post:
        mock_post.return_value.status_code = 200  # Simulate success response

        # Generate a unique ID for the test listing
        listing_id = str(uuid.uuid4())
        image_filenames = [
            f"{listing_id}/test_image.jpg",
            f"{listing_id}/test_image2.jpg",
        ]  # Expected filenames in S3

        # Prepare form data
        data = {
            "id": listing_id,
            "title": "New Test Listing Title",
            "description": "This is a description for a test listing.",
            "price": "20",
            "location": "St. George",
            "condition": "Used",
            "category": "Electronics",
            "datePosted": datetime.now().isoformat(),
            "sellerId": "test_seller_id",
            "sellerName": "Test Seller",
        }

        # Create BytesIO objects instead of reading from files
        img1 = BytesIO(b"Test image content 1")
        img1.name = "test_image.jpg"
        img2 = BytesIO(b"Test image content 2")
        img2.name = "test_image2.jpg"

        # Include the files in the data dictionary
        data["file"] = [(img1, "test_image.jpg"), (img2, "test_image2.jpg")]

        # Send POST request to the Flask endpoint
        response = client.post(
            "/create-listing", data=data, content_type="multipart/form-data"
        )

        assert response.status_code == 200
        response_data = response.get_json()
        assert (
            "message" in response_data
            and response_data["message"]
            == "Listing created and added to user profile successfully"
        )

        # Initialize DynamoDB client
        dynamodb_client = boto3.client(
            "dynamodb",
            aws_access_key_id=app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=app.config["AWS_SECRET_ACCESS_KEY"],
            region_name=app.config["AWS_S3_REGION"],
        )

        # Ensure the data ended up in the DynamoDB listings table
        response = dynamodb_client.get_item(
            TableName=app.config["AWS_DB_LISTINGS_TABLE_NAME"],
            Key={"id": {"S": listing_id}},
        )
        item = response.get("Item")
        assert item is not None, "Item not found in DynamoDB"
        assert item["title"]["S"] == "New Test Listing Title"
        assert item["description"]["S"] == "This is a description for a test listing."
        assert item["price"]["N"] == "20"

        expected_image_urls = [
            f"https://{app.config['AWS_S3_LISTINGS_BUCKET_NAME']}.s3.amazonaws.com/listings/{filename}"
            for filename in image_filenames
        ]

        assert set(item["images"]["SS"]) == set(
            expected_image_urls
        ), f"Image URLs do not match. Expected: {expected_image_urls}, Got: {item['images']['SS']}"

        # Initialize S3 client
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=app.config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=app.config["AWS_SECRET_ACCESS_KEY"],
            region_name=app.config["AWS_S3_REGION"],
        )

        # Ensure images were uploaded to listings S3 bucket
        for filename in image_filenames:
            try:
                s3_client.head_object(
                    Bucket=app.config["AWS_S3_LISTINGS_BUCKET_NAME"],
                    Key=f"listings/{filename}",
                )
            except s3_client.exceptions.ClientError:
                assert False, f"Image {filename} not found in S3 bucket"

    # Clean up: delete uploaded images
    for filename in image_filenames:
        s3_client.delete_object(
            Bucket=app.config["AWS_S3_LISTINGS_BUCKET_NAME"], Key=f"listings/{filename}"
        )


def test_create_listing_and_add_to_user(client):
    # Mock user data store to simulate the user table
    user_table = {
        "test_seller_id": {
            "id": "test_seller_id",
            "name": "Test Seller",
            "listings": set(),
        }
    }

    # Function to simulate the user service's behavior
    def mock_user_service(url, json):
        user_id = json.get("user_id")
        listing_id = json.get("listing_id")
        if user_id in user_table:
            user_table[user_id]["listings"].add(listing_id)
            mock_response = MagicMock()
            mock_response.status_code = 200
            return mock_response
        else:
            mock_response = MagicMock()
            mock_response.status_code = 404
            return mock_response

    # Mock requests.post to use our mock_user_service function
    with patch("requests.post", side_effect=mock_user_service) as mock_post:
        # Mock upload_to_listings_s3 and upload_to_listings_table if needed
        with patch("app.upload_to_listings_s3") as mock_upload_to_s3:
            mock_upload_to_s3.return_value = "http://example.com/fake_image_url.jpg"

            with patch("app.upload_to_listings_table") as mock_upload_to_table:
                mock_upload_to_table.return_value = True

                # Generate a unique ID for the test listing
                listing_id = str(uuid.uuid4())

                # Prepare form data
                data = {
                    "id": listing_id,
                    "title": "New Test Listing Title",
                    "description": "This is a description for a test listing.",
                    "price": "20",
                    "location": "St. George",
                    "condition": "Used",
                    "category": "Electronics",
                    "datePosted": datetime.now().isoformat(),
                    "sellerId": "test_seller_id",
                    "sellerName": "Test Seller",
                }

                # Create BytesIO objects instead of reading from files
                img1 = BytesIO(b"Test image content 1")
                img1.name = "test_image.jpg"
                img2 = BytesIO(b"Test image content 2")
                img2.name = "test_image2.jpg"

                # Include the files in the data dictionary
                data["file"] = [(img1, "test_image.jpg"), (img2, "test_image2.jpg")]

                # Send POST request to the Flask endpoint
                response = client.post(
                    "/create-listing", data=data, content_type="multipart/form-data"
                )

                assert response.status_code == 200
                response_data = response.get_json()
                assert (
                    "message" in response_data
                    and response_data["message"]
                    == "Listing created and added to user profile successfully"
                )

                # Verify that the listing ID was added to the user's listings
                user = user_table.get("test_seller_id")
                assert user is not None, "User not found in mock user table"
                assert (
                    listing_id in user["listings"]
                ), "Listing ID not added to user's listings"

                # Verify that the user service was called correctly
                mock_post.assert_called_once_with(
                    "http://user-profile-service:5000/add-listing",
                    json={"user_id": "test_seller_id", "listing_id": listing_id},
                )
