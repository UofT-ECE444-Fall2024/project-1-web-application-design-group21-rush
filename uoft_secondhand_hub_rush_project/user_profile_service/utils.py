import boto3
from flask import current_app
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr
import logging

def get_dynamodb_resource():
    """
    Initializes and returns the DynamoDB resource using credentials from Flask's config.

    Returns:
        boto3.resource: The DynamoDB resource object.
    """
    return boto3.resource(
        'dynamodb',
        region_name=current_app.config['AWS_S3_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

def get_user_table():
    """
    Retrieves the DynamoDB table object for the users table.

    Returns:
        boto3.resources.factory.dynamodb.Table: The DynamoDB table object.
    """
    dynamodb = get_dynamodb_resource()
    return dynamodb.Table(current_app.config['AWS_DB_USERS_TABLE_NAME'])

def convert_decimals(obj):
    """
    Recursively converts Decimal objects to int or float.

    Args:
        obj (dict or list or Decimal): The object to convert.

    Returns:
        dict or list or int or float: The converted object with native Python types.
    """
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        # Convert to int if possible, else float
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj

def upload_to_user_table(user_data):
    """
    Uploads a user record to the DynamoDB table.

    Args:
        user_data (dict): The user data to upload. Must include the primary key 'id'.

    Returns:
        bool: True if the upload is successful, False otherwise.
    """
    table = get_user_table()

    # Convert float and int values to Decimal as required by DynamoDB
    for key, value in user_data.items():
        if isinstance(value, float):
            user_data[key] = Decimal(str(value))
        elif isinstance(value, int):
            user_data[key] = Decimal(value)  # DynamoDB can store numbers as Decimal

    try:
        table.put_item(Item=user_data)
        current_app.logger.info(f"User added to DynamoDB: {user_data.get('id')}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to add user to DynamoDB: {e}")
        return False

def get_user_by_id(user_id):
    """
    Retrieves a user by their ID using DynamoDB query.

    Args:
        user_id (str): The ID of the user to retrieve.

    Returns:
        dict or None: The user data if found, converted to native Python types, else None.
    """
    table = get_user_table()

    try:
        response = table.query(
            KeyConditionExpression=Key('id').eq(user_id)
        )
        items = response.get('Items', [])
        current_app.logger.info(f"Queried DynamoDB for user_id={user_id}: Found {len(items)} items.")
        if items:
            return convert_decimals(items[0])
        else:
            return None
    except Exception as e:
        current_app.logger.error(f"Failed to query DynamoDB for user_id={user_id}: {e}")
        return None

def scan_users_by_attribute(attribute_name, attribute_value):
    """
    Scans the DynamoDB table for users matching a specific attribute.

    Args:
        attribute_name (str): The attribute to filter by.
        attribute_value (str or int or float): The value of the attribute to match.

    Returns:
        list or None: List of matching user data dictionaries with native Python types, or None on failure.
    """
    table = get_user_table()

    try:
        response = table.scan(
            FilterExpression=Attr(attribute_name).eq(attribute_value)
        )
        items = response.get('Items', [])
        current_app.logger.info(f"Scanned DynamoDB for {attribute_name}={attribute_value}: Found {len(items)} items.")
        return convert_decimals(items)
    except Exception as e:
        current_app.logger.error(f"Failed to scan DynamoDB for {attribute_name}={attribute_value}: {e}")
        return None

def update_user(user_id, updates):
    """
    Updates specified attributes of a user in the DynamoDB table.

    Args:
        user_id (str): The unique identifier of the user to update.
        updates (dict): A dictionary of attributes to update with their new values.
                        Example:
                            {
                                "name": "Jane Doe",
                                "age": 28,
                                "email": "jane.doe@example.com"
                            }

    Returns:
        bool: True if the update is successful, False otherwise.
    """
    table = get_user_table()

    if not updates:
        current_app.logger.error("No updates provided.")
        return False

    # Initialize components for UpdateExpression
    update_expression = "SET "
    expression_attribute_values = {}
    expression_attribute_names = {}
    update_fields = []

    # Iterate over the updates to build the UpdateExpression
    for idx, (key, value) in enumerate(updates.items()):
        # Handle attribute names that might conflict with DynamoDB reserved words
        attribute_name = f"#attr{idx}"
        attribute_value = f":val{idx}"
        update_fields.append(f"{attribute_name} = {attribute_value}")

        # Map the expression attribute names and values
        expression_attribute_names[attribute_name] = key

        # Convert numerical types to Decimal
        if isinstance(value, float):
            expression_attribute_values[attribute_value] = Decimal(str(value))
        elif isinstance(value, int):
            expression_attribute_values[attribute_value] = Decimal(value)
        else:
            expression_attribute_values[attribute_value] = value

    # Combine all fields into the UpdateExpression
    update_expression += ", ".join(update_fields)

    try:
        response = table.update_item(
            Key={'id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="UPDATED_NEW"  # Returns the updated attributes
        )
        updated_attributes = response.get('Attributes', {})
        current_app.logger.info(f"Successfully updated user {user_id}: {updated_attributes}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to update user {user_id}: {e}")
        return False

