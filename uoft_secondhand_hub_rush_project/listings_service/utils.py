import boto3
from flask import current_app
from decimal import Decimal

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

def upload_to_listings_table(listing_data):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )
    
    table = dynamodb.Table(current_app.config['AWS_DB_LISTINGS_TABLE_NAME'])

    # Convert any float values to Decimal as required by DynamoDB
    for key, value in listing_data.items():
        if isinstance(value, float):
            listing_data[key] = Decimal(str(value))

    # Ensure images is stored as a String Set (SS)
    if 'images' in listing_data:
        listing_data['images'] = set(listing_data['images'])  # Convert list to a set for DynamoDB SS type

    try:
        table.put_item(Item=listing_data)
        current_app.logger.info(f"Listing added to DynamoDB: {listing_data['id']}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to add listing to DynamoDB: {e}")
        return False

def delete_from_listings_table(listing_id):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )
    
    table = dynamodb.Table(current_app.config['AWS_DB_LISTINGS_TABLE_NAME'])

    try:
        response = table.delete_item(
            Key={'id': listing_id}
        )
        # Check if deletion was successful based on the response status
        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            current_app.logger.info(f"Listing with id {listing_id} deleted successfully.")
            return True
        else:
            current_app.logger.error(f"Failed to delete listing with id {listing_id}: {response}")
            return False
    except Exception as e:
        current_app.logger.error(f"Failed to delete listing with id {listing_id}: {e}")
        return False

def get_all_listings():
  dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )
      
  table = dynamodb.Table(current_app.config['AWS_DB_LISTINGS_TABLE_NAME'])
  
  try:
      # scan to retrieve everything
      response = table.scan()
      listings = response.get('Items', [])
      current_app.logger.info(f"Retrieved {len(listings)} from the database.")

      # check for pagination
      while 'LastEvaluatedKey' in response:
          response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
          listings.extend(response.get('Items', []))

      return listings

  except Exception as e:
      current_app.logger.error(f"Failed to retrieve all listings: {e}")
      return []

def get_listings_by_seller(seller_id):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )
    
    table = dynamodb.Table(current_app.config['AWS_DB_LISTINGS_TABLE_NAME'])

    try:
        # Query the listings table using the sellerId index
        response = table.query(
            IndexName='sellerId-index',  # Name of the GSI
            KeyConditionExpression=boto3.dynamodb.conditions.Key('sellerId').eq(seller_id)
        )
        listings = response.get('Items', [])
        current_app.logger.info(f"Retrieved {len(listings)} listings for seller ID {seller_id}: {listings}")
        return listings
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve listings for seller ID {seller_id}: {e}")
        return []

def retrieve_listings_by_category(category):
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )
    
    table = dynamodb.Table(current_app.config['AWS_DB_LISTINGS_TABLE_NAME'])

    try:
        # Query the listings table using the sellerId index
        response = table.query(
            IndexName='category-index',  # Name of the GSI
            KeyConditionExpression=boto3.dynamodb.conditions.Key('category').eq(category)
        )
        listings = response.get('Items', [])
        current_app.logger.info(f"Retrieved {len(listings)} listings in category {category}: {listings}")
        return listings
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve listings for category {category}: {e}")
        return []
