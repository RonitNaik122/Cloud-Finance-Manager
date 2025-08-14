# goal_handler.py
import json
import os
import uuid
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('GOALS_TABLE_NAME')  # Default to 'Goals' if not set
table = dynamodb.Table(table_name)

def respond(status_code, body=None):
    """Helper function for responses with CORS headers"""
    return {
        'statusCode': status_code,
        'body': json.dumps(body, default=str) if body else None,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,Chrome',
        },
    }

def create_goal(event, context):
    try:
        user_id = event['pathParameters']['userid']
        body = json.loads(event['body'])

        goal_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        item = {
            'id': goal_id,
            'userId': user_id,
            'name': body.get('name'),
            'targetAmount': Decimal(str(body.get('targetAmount'))),
            'currentAmount': Decimal(str(body.get('currentAmount', 0))),  # Default to 0 if not provided
            'category': body.get('category'),
            'targetDate': body.get('targetDate'),
            'description': body.get('description'),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }

        table.put_item(Item=item)

        return respond(201, item)
    except Exception as e:
        print(f"Error creating goal: {e}")
        return respond(500, {'error': 'Could not create goal'})

def get_goals(event, context):
    try:
        user_id = event['pathParameters']['userid']
        goal_id = event['pathParameters'].get('goalid')

        if goal_id:
            response = table.get_item(
                Key={'id': goal_id, 'userId': user_id}
            )
            if 'Item' in response:
                return respond(200, response['Item'])
            else:
                return respond(200, [])  # Return empty array instead of 404
        else:
            try:
                # Try to use GSI if it exists
                response = table.query(
                    IndexName='UserIdIndex',
                    KeyConditionExpression='userId = :uid',
                    ExpressionAttributeValues={':uid': user_id}
                )
                return respond(200, response.get('Items', []))
            except Exception as inner_e:
                print(f"GSI query failed, falling back to scan: {inner_e}")
                # Fall back to scan if GSI doesn't exist
                response = table.scan(
                    FilterExpression='userId = :uid',
                    ExpressionAttributeValues={':uid': user_id}
                )
                return respond(200, response.get('Items', []))
    except Exception as e:
        print(f"Error getting goals: {e}")
        # Return empty array instead of error when no goals found
        return respond(200, [])

def update_goal(event, context):
    try:
        user_id = event['pathParameters']['userid']
        goal_id = event['pathParameters']['goalid']
        body = json.loads(event['body'])
        timestamp = datetime.now().isoformat()

        update_expression = "SET #n = :n, targetAmount = :ta, currentAmount = :ca, category = :c, targetDate = :td, #d = :d, updatedAt = :ua"
        expression_attribute_names = {
            '#n': 'name',
            '#d': 'description'
        }
        expression_attribute_values = {
            ':n': body.get('name'),
            ':ta': Decimal(str(body.get('targetAmount'))),
            ':ca': Decimal(str(body.get('currentAmount'))),
            ':c': body.get('category'),
            ':td': body.get('targetDate'),
            ':d': body.get('description'),
            ':ua': timestamp
        }

        response = table.update_item(
            Key={'id': goal_id, 'userId': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return respond(200, response['Attributes'])
    except Exception as e:
        print(f"Error updating goal: {e}")
        return respond(500, {'error': 'Could not update goal'})

def delete_goal(event, context):
    try:
        user_id = event['pathParameters']['userid']
        goal_id = event['pathParameters']['goalid']

        table.delete_item(
            Key={'id': goal_id, 'userId': user_id}
        )

        return respond(204, None)
    except Exception as e:
        print(f"Error deleting goal: {e}")
        return respond(500, {'error': 'Could not delete goal'})