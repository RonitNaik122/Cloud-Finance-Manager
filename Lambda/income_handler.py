# income_handler.py
import json
import os
import uuid
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('INCOME_TABLE_NAME')  # Default to 'Income' if not set
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

def create_income(event, context):
    try:
        user_id = event['pathParameters']['userid']
        body = json.loads(event['body'])

        income_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        item = {
            'id': income_id,  # Partition key
            'userId': user_id, # Sort key
            'name': body.get('name'),
            'amount': Decimal(str(body.get('amount'))),
            'category': body.get('category'),
            'date': body.get('date'),
            'paymentMethod': body.get('paymentMethod'),
            'notes': body.get('notes'),
            'receiptUrl': body.get('receiptUrl'),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }

        table.put_item(Item=item)

        return respond(201, item)
    except Exception as e:
        print(f"Error creating income: {e}")
        return respond(500, {'error': 'Could not create income'})

def get_income(event, context):
    try:
        user_id = event['pathParameters']['userid']
        income_id = event['pathParameters'].get('incomeid')

        if income_id:
            response = table.get_item(
                Key={'id': income_id, 'userId': user_id}  # Correct key order
            )
            if 'Item' in response:
                return respond(200, response['Item'])
            else:
                return respond(404, {'error': 'Income item not found'})
        else:
            # Query the Global Secondary Index (assuming you create 'UserIdIndex')
            response = table.query(
                IndexName='UserIdIndex',  # Replace with your GSI name
                KeyConditionExpression='userId = :uid',
                ExpressionAttributeValues={':uid': user_id}
            )
            return respond(200, response['Items'])
    except Exception as e:
        print(f"Error getting income: {e}")
        return respond(500, {'error': 'Could not retrieve income'})

def update_income(event, context):
    try:
        user_id = event['pathParameters']['userid']
        income_id = event['pathParameters']['incomeid']
        body = json.loads(event['body'])
        timestamp = datetime.now().isoformat()

        update_expression = "SET #n = :n, amount = :a, category = :c, #d = :d, paymentMethod = :pm, notes = :nt, receiptUrl = :ru, updatedAt = :ua"
        expression_attribute_names = {
            '#n': 'name',
            '#d': 'date'
        }
        expression_attribute_values = {
            ':n': body.get('name'),
            ':a': Decimal(str(body.get('amount'))),
            ':c': body.get('category'),
            ':d': body.get('date'),
            ':pm': body.get('paymentMethod'),
            ':nt': body.get('notes'),
            ':ru': body.get('receiptUrl'),
            ':ua': timestamp
        }

        response = table.update_item(
            Key={'id': income_id, 'userId': user_id},  # Correct key order
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return respond(200, response['Attributes'])
    except Exception as e:
        print(f"Error updating income: {e}")
        return respond(500, {'error': 'Could not update income'})

def delete_income(event, context):
    try:
        user_id = event['pathParameters']['userid']
        income_id = event['pathParameters']['incomeid']

        table.delete_item(
            Key={'id': income_id, 'userId': user_id}  # Correct key order
        )

        return respond(204, None)
    except Exception as e:
        print(f"Error deleting income: {e}")
        return respond(500, {'error': 'Could not delete income'})