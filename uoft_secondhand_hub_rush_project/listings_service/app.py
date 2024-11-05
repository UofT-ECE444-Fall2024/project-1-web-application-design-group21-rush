import os
from flask import Flask, request, jsonify, render_template_string, current_app
from utils import upload_to_listings_s3
from utils import upload_to_listings_table
import uuid
import requests
from decimal import Decimal



app = Flask(__name__)

app.config.from_pyfile('config.py')

# temporary HTML template for file upload
UPLOAD_FORM_HTML = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload to S3</title>
</head>
<body>
  <h1>Upload an Image to Listings S3 Bucket</h1>
  <form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file" accept="image/*">
    <button type="submit">Upload</button>
  </form>
</body>
</html>
"""

@app.route('/')
def home():
    return 'Hello from listings service!'

@app.route('/upload-form')
def upload_form():
    return render_template_string(UPLOAD_FORM_HTML)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = f"listings/{file.filename}"
    file_url = upload_to_listings_s3(file, filename)

    if file_url:
        return jsonify({'message': 'File uploaded successfully', 'file_url': file_url}), 200
    else:
        return jsonify({'error': 'Failed to upload file'}), 500

@app.route('/create-listing', methods=['POST'])
def create_listing():
    data = request.form.to_dict()  # Form data
    files = request.files.getlist('file')  # Expecting 'file' to be an array of files

    image_urls = []
    for file in files:
        filename = f"listings/{data['id']}/{file.filename}"  # store them in a folder named by listing id
        file_url = upload_to_listings_s3(file, filename)
        if file_url:
            image_urls.append(file_url)
        else:
            return jsonify({'error': 'Failed to upload one or more images'}), 500

    listing_data = {
        'id': data['id'],
        'title': data['title'],
        'description': data['description'],
        'price': Decimal(data['price']),
        'location': data['location'],
        'condition': data['condition'],
        'category': data['category'],
        'images': image_urls,  # array of S3 URLs
        'datePosted': data['datePosted'],
        'sellerId': data['sellerId'],
        'sellerName': data['sellerName']
    }

    # Upload listing data to listings table
    if upload_to_listings_table(listing_data):
        # After successful listing creation, make an API call to the user profile service
        user_service_url = 'http://user-profile-service:5000/add-listing'
        payload = {
            'user_id': data['sellerId'],
            'listing_id': data['id']
        }
        
        try:
            response = requests.post(user_service_url, json=payload)
            if response.status_code == 200:
                return jsonify({'message': 'Listing created and added to user profile successfully'}), 200
            else:
                return jsonify({'error': 'Listing created but failed to add to user profile'}), 500
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Failed to communicate with user service: {e}")
            return jsonify({'error': 'Listing created but failed to add to user profile due to service error'}), 500

    return jsonify({'error': 'Failed to create listing'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


