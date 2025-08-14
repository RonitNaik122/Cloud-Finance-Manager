#user_handler.py

import json
import boto3
import uuid
from datetime import datetime

# Database resources
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def respond(status_code, body=None):
    return {
        'statusCode': status_code,
        'body': json.dumps(body, default=str) if body else None,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # For CORS
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    }

def signup(event):
    try:
        # Handle the case where event might not have a body
        if not event.get('body'):
            return respond(400, {'message': 'Request body is missing'})
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return respond(400, {'message': 'Invalid JSON in request body'})
        
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')

        if not all([email, password, name]):
            return respond(400, {'message': 'Missing required fields'})

        user_id = f"user_{uuid.uuid4().hex[:9]}"
        created_at = datetime.utcnow().isoformat() + "Z"
        last_login = datetime.utcnow().isoformat() + "Z"

        user_data = {
            'id': user_id,
            'email': email,
            'password': password,  # In a real app, hash this!
            'name': name,
            'createdAt': created_at,
            'lastLogin': last_login,
        }

        users_table.put_item(Item=user_data)

        return respond(201, user_data)
    except Exception as e:
        print(f"Error during signup: {e}")
        return respond(500, {'message': 'Could not create user'})

def get_user(user_id):
    try:
        response = users_table.get_item(Key={'id': user_id})
        if 'Item' in response:
            return respond(200, response['Item'])
        else:
            return respond(404, {'message': 'User not found'})
    except Exception as e:
        print(f"Error getting user {user_id}: {e}")
        return respond(500, {'message': 'Could not retrieve user'})

def update_user(event, user_id):
    try:
        # Handle the case where event might not have a body
        if not event.get('body'):
            return respond(400, {'message': 'Request body is missing'})
            
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return respond(400, {'message': 'Invalid JSON in request body'})
            
        name = body.get('name')
        email = body.get('email')
        
        # Get the current user data first
        old_user_response = users_table.get_item(Key={'id': user_id})
        if 'Item' not in old_user_response:
            return respond(404, {'message': 'User not found'})
            
        old_user = old_user_response['Item']
        old_email = old_user.get('email')

        updated_fields = {}
        update_expression = "SET"
        expression_attribute_values = {}
        expression_attribute_names = {}

        if name and name != old_user.get('name'):
            update_expression += " #n = :n,"
            expression_attribute_values[':n'] = name
            expression_attribute_names['#n'] = 'name'
            updated_fields['name'] = name
            
        if email and email != old_email:
            update_expression += " email = :e,"
            expression_attribute_values[':e'] = email
            updated_fields['email'] = email

        if not updated_fields:
            return respond(400, {'message': 'No fields provided for update'})

        update_expression = update_expression.rstrip(',')

        response = users_table.update_item(
            Key={'id': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names if expression_attribute_names else None,
            ReturnValues="ALL_NEW"
        )

        return respond(200, response['Attributes'])
    except Exception as e:
        print(f"Error updating user {user_id}: {e}")
        return respond(500, {'message': 'Could not update user'})

def delete_user(user_id):
    try:
        # Check if user exists first
        response = users_table.get_item(Key={'id': user_id})
        if 'Item' not in response:
            return respond(404, {'message': 'User not found'})
            
        users_table.delete_item(Key={'id': user_id})
        return respond(204)
    except Exception as e:
        print(f"Error deleting user {user_id}: {e}")
        return respond(500, {'message': 'Could not delete user'})

def login(event):
    try:
        # Handle the case where event might not have a body
        if not event.get('body'):
            return respond(400, {'message': 'Request body is missing'})
            
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return respond(400, {'message': 'Invalid JSON in request body'})
            
        email = body.get('email')
        password = body.get('password')

        if not all([email, password]):
            return respond(400, {'message': 'Missing email or password'})

        response = users_table.scan(
            FilterExpression='email = :email_val AND password = :password_val', # In a real app, compare hashed passwords
            ExpressionAttributeValues={
                ':email_val': email,
                ':password_val': password
            }
        )

        if response['Items']:
            user = response['Items'][0]
            current_time = datetime.utcnow().isoformat() + "Z"
            users_table.update_item(
                Key={'id': user['id']},
                UpdateExpression='SET lastLogin = :last_login',
                ExpressionAttributeValues={':last_login': current_time}
            )
            user['lastLogin'] = current_time
            return respond(200, user)
        else:
            return respond(401, {'message': 'Invalid credentials'})
    except Exception as e:
        print(f"Error during login: {e}")
        return respond(500, {'message': 'Could not log in'})

def change_password(event):
    try:
        # Handle the case where event might not have a body
        if not event.get('body'):
            return respond(400, {'message': 'Request body is missing'})
            
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return respond(400, {'message': 'Invalid JSON in request body'})
            
        user_id = body.get('userId')
        old_password = body.get('oldPassword')
        new_password = body.get('newPassword')

        if not all([user_id, old_password, new_password]):
            return respond(400, {'message': 'Missing required fields for password change'})

        response = users_table.get_item(Key={'id': user_id})
        if 'Item' in response:
            user = response['Item']
            if user['password'] == old_password: # In a real app, compare hashed passwords
                users_table.update_item(
                    Key={'id': user_id},
                    UpdateExpression='SET password = :new_password',
                    ExpressionAttributeValues={':new_password': new_password} # In a real app, hash this!
                )

                return respond(200, {'message': 'Password updated successfully'})
            else:
                return respond(401, {'message': 'Invalid old password'})
        else:
            return respond(404, {'message': 'User not found'})
    except Exception as e:
        print(f"Error changing password: {e}")
        return respond(500, {'message': 'Could not change password'})