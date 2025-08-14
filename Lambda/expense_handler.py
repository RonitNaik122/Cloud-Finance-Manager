import json
import os
import uuid
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('EXPENSES_TABLE_NAME')  # Default to 'Expenses' if not set
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

def create_expense(event, context):
    try:
        user_id = event['pathParameters']['userid']
        body = json.loads(event['body'])

        expense_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        item = {
            'userId': user_id,
            'id': expense_id,
            'name': body.get('name'),
            'amount': Decimal(str(body.get('amount'))),
            'category': body.get('category'),
            'date': body.get('date'),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }

        table.put_item(Item=item)

        return respond(201, item)
    except Exception as e:
        print(f"Error creating expense: {e}")
        return respond(500, {'error': 'Could not create expense'})

def get_expenses(event, context):
    try:
        user_id = event['pathParameters']['userid']
        response = table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        return respond(200, response['Items'])
    except Exception as e:
        print(f"Error getting expenses: {e}")
        return respond(500, {'error': 'Could not retrieve expenses'})

def update_expense(event, context):
    try:
        user_id = event['pathParameters']['userid']
        expense_id = event['pathParameters']['expenseid']
        body = json.loads(event['body'])
        timestamp = datetime.now().isoformat()

        update_expression = "SET #n = :n, amount = :a, category = :c, #d = :d, updatedAt = :ua"
        expression_attribute_names = {
            '#n': 'name',
            '#d': 'date'
        }
        expression_attribute_values = {
            ':n': body.get('name'),
            ':a': Decimal(str(body.get('amount'))),
            ':c': body.get('category'),
            ':d': body.get('date'),
            ':ua': timestamp
        }

        response = table.update_item(
            Key={'userId': user_id, 'id': expense_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        return respond(200, response['Attributes'])
    except Exception as e:
        print(f"Error updating expense: {e}")
        return respond(500, {'error': 'Could not update expense'})

def delete_expense(event, context):
    try:
        user_id = event['pathParameters']['userid']
        expense_id = event['pathParameters']['expenseid']

        table.delete_item(
            Key={'userId': user_id, 'id': expense_id}
        )

        return respond(204, None)
    except Exception as e:
        print(f"Error deleting expense: {e}")
        return respond(500, {'error': 'Could not delete expense'})