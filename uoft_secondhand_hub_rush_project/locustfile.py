from locust import HttpUser, task, between
import random
import uuid
import json

# Base Locust test for Listings Service
class ListingsServiceUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def get_all_listings(self):
        self.client.get("/api/listings/all")

    @task
    def upload_listing_image(self):
        with open("test_image.jpg", "rb") as file:
            self.client.post("/api/listings/upload", files={"file": file})

    @task
    def create_listing(self):
        data = {
            "id": str(uuid.uuid4()),
            "title": "Test Listing",
            "description": "This is a test listing",
            "price": "100.00",
            "location": "Toronto",
            "condition": "new",
            "category": "electronics",
            "datePosted": "2024-01-01",
            "sellerId": str(uuid.uuid4()),
            "sellerName": "Test Seller"
        }
        files = {'file': open("test_image.jpg", "rb")}
        self.client.post("/api/listings/create-listing", data=data, files=files)

    @task
    def delete_listing(self):
        listing_id = str(uuid.uuid4())  # Assume listing exists
        self.client.delete(f"/api/listings/delete/{listing_id}")

# Base Locust test for User Profile Service
class UserProfileServiceUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def register_user(self):
        data = {
            "username": f"user_{random.randint(1, 1000)}",
            "email": f"user{random.randint(1, 1000)}@test.com",
            "password": "password123"
        }
        self.client.post("/api/users/pre_register", json=data)

    @task
    def login_user(self):
        data = {
            "email": "user@test.com",
            "password": "password123"
        }
        self.client.post("/api/users/login", json=data)

    @task
    def get_user_info(self):
        self.client.get("/api/users/current_user_info")  # Assuming authentication

    @task
    def update_user_profile(self):
        data = {
            "username": f"user_{random.randint(1, 1000)}",
            "location": "Toronto",
            "categories": ["electronics", "furniture"]
        }
        self.client.post("/api/users/edit_user", data=data)

    @task
    def forgot_password(self):
        data = {
            "email": "user@test.com"
        }
        self.client.post("/api/users/forgot_password", json=data)
