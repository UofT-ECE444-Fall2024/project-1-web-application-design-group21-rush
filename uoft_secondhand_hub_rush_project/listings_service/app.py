import os
from flask import Flask, request, jsonify, render_template_string
from utils import upload_to_listings_s3
from utils import upload_to_listings_table
from utils import delete_from_listings_table
import uuid
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

@app.route('/api/listings/upload-form')
def upload_form():
    return render_template_string(UPLOAD_FORM_HTML)

@app.route('/api/listings/upload', methods=['POST'])
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

@app.route('/api/listings/create-listing', methods=['POST'])
def create_listing():
    data = request.form.to_dict()  # Form data
    files = request.files.getlist('file')  # Expecting 'file' to be an array of files

    image_urls = []
    for file in files:
        filename = f"listings/{data['id']}/{file.filename}" # store them in a folder named by listing id
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

    if upload_to_listings_table(listing_data):
        return jsonify({'message': 'Listing created successfully'}), 200
    return jsonify({'error': 'Failed to create listing'}), 500

@app.route('/api/listings/delete/<id>', methods=['DELETE'])
def delete_listing(id):
    # attempt to delete the listing from the table
    success = delete_from_listings_table(id)
    
    if success:
        return jsonify({'message': f'Listing with id {id} deleted successfully'}), 200
    else:
        return jsonify({'error': f'Failed to delete listing with id {id}'}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


