import json
import os
import uuid
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('EVENT_TABLE_NAME', 'Events')  # Default to 'Events' if not set
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

def create_event(event, context):
    try:
        user_id = event['pathParameters']['userid']  # Get userId from URL path
        body = json.loads(event['body'])

        event_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # amount should be stored as Decimal
        amount = body.get('amount')
        if amount is not None:
            amount = Decimal(str(amount))

        item = {
            'id': event_id,
            'userId': user_id,  # Use userId from path parameters
            'title': body.get('title'),
            'date': body.get('date'),
            'type': body.get('type'),
            'amount': amount,
            'notes': body.get('notes'),
            'createdAt': timestamp,
            'updatedAt': timestamp,
            'category': body.get('category'),
        }

        table.put_item(Item=item)

        return respond(201, item)
    except Exception as e:
        print(f"Error creating event: {e}")
        return respond(500, {'error': 'Could not create event'})

def get_event(event, context):
    try:
        user_id = event['pathParameters']['userid']
        event_id = event['pathParameters'].get('eventid')

        if event_id:
            response = table.get_item(
                Key={'id': event_id, 'userId': user_id}
            )
            if 'Item' in response:
                return respond(200, response['Item'])
            else:
                return respond(404, {'error': 'Event item not found'})
        else:
            # Use a GSI like in goal_handler.py
            response = table.query(
                IndexName='UserIdIndex',  # Make sure this GSI exists in your table
                KeyConditionExpression='userId = :userId',
                ExpressionAttributeValues={':userId': user_id}
            )
            return respond(200, response['Items'])
    except Exception as e:
        print(f"Error getting event: {e}")
        return respond(500, {'error': 'Could not retrieve event'})

def update_event(event, context):
    try:
        event_id = event['pathParameters']['eventid']
        user_id = event['pathParameters']['userid']
        body = json.loads(event['body'])
        timestamp = datetime.now().isoformat()

        # amount should be stored as Decimal
        amount = body.get('amount')
        if amount is not None:
            amount = Decimal(str(amount))

        update_expression = "SET title = :title, #date = :date, #type = :type, amount = :amount, notes = :notes, updatedAt = :updatedAt, category = :category"
        expression_attribute_values = {
            ':title': body.get('title'),
            ':date': body.get('date'),
            ':type': body.get('type'),
            ':amount': amount,
            ':notes': body.get('notes'),
            ':updatedAt': timestamp,
            ':category': body.get('category')
        }
        expression_attribute_names = {
            '#date': 'date',  # Use a placeholder for reserved keyword
            '#type': 'type'
        }

        response = table.update_item(
            Key={'id': event_id, 'userId': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        if 'Attributes' in response:
            return respond(200, response['Attributes'])
        else:
            return respond(404, {'error': 'Event not found'})
    except Exception as e:
        print(f"Error updating event: {e}")
        return respond(500, {'error': 'Could not update event'})

def delete_event(event, context):
    try:
        event_id = event['pathParameters']['eventid']
        user_id = event['pathParameters']['userid']

        response = table.delete_item(
            Key={'id': event_id, 'userId': user_id}
        )

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return respond(204, None)
        else:
            return respond(404, {'error': 'Event not found'})
    except Exception as e:
        print(f"Error deleting event: {e}")
        return respond(500, {'error': 'Could not delete event'})