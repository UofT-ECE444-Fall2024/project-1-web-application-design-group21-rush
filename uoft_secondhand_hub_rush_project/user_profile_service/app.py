import os
from flask import Flask, request, jsonify, render_template_string
from utils import upload_to_users_s3

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
  <h1>Upload an Image to Users S3 Bucket</h1>
  <form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file" accept="image/*">
    <button type="submit">Upload</button>
  </form>
</body>
</html>
"""

@app.route('/')
def home():
    return 'Hello from user profile service!'

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

    filename = f"users/{file.filename}"
    file_url = upload_to_users_s3(file, filename)

    if file_url:
        return jsonify({'message': 'File uploaded successfully', 'file_url': file_url}), 200
    else:
        return jsonify({'error': 'Failed to upload file'}), 500
    
@app.route('/add-listing', methods=['POST'])
def add_listing():
    data = request.get_json()
    user_id = data.get('user_id')
    listing_id = data.get('listing_id')

    if not user_id or not listing_id:
        return jsonify({'error': 'User ID and listing ID are required'}), 400

    # Call the function to update the user profile
    success = add_listing_id_to_user(user_id, listing_id)
    if success:
        return jsonify({'message': 'Listing ID added to user profile'}), 200
    else:
        return jsonify({'error': 'Failed to add listing ID to user profile'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


