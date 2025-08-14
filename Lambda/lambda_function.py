import json
import importlib.util
import sys
import os
import boto3
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB resource outside handler
dynamodb = boto3.resource('dynamodb')

# Helper function for responses
def respond(status_code, body=None):
    return {
        'statusCode': status_code,
        'body': json.dumps(body, default=str) if body else None,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # Allow all origins
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',  # Allow specific HTTP methods
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,Chrome',  # Allow specific headers
        },
    }

# Safely load handler module
def load_handler_module(file_path, module_name):
    try:
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module
        else:
            print(f"Error: Could not load {file_path}")
            return None
    except Exception as e:
        print(f"Error loading {module_name}: {e}")
        return None

# Load all handler modules
user_handler_module = load_handler_module("./user_handler.py", "user_handler")
expense_handler_module = load_handler_module("./expense_handler.py", "expense_handler")
income_handler_module = load_handler_module("./income_handler.py", "income_handler")
goal_handler_module = load_handler_module("./goal_handler.py", "goal_handler")
event_handler_module = load_handler_module("./event_handler.py", "event_handler")

# Get handler functions from modules
def get_handler_function(module, function_name):
    if module:
        return getattr(module, function_name, None)
    return None

# User handlers
signup = get_handler_function(user_handler_module, 'signup')
get_user = get_handler_function(user_handler_module, 'get_user')
update_user = get_handler_function(user_handler_module, 'update_user')
delete_user = get_handler_function(user_handler_module, 'delete_user')
login = get_handler_function(user_handler_module, 'login')
change_password = get_handler_function(user_handler_module, 'change_password')

# Expense handlers
create_expense = get_handler_function(expense_handler_module, 'create_expense')
get_expenses = get_handler_function(expense_handler_module, 'get_expenses')
update_expense = get_handler_function(expense_handler_module, 'update_expense')
delete_expense = get_handler_function(expense_handler_module, 'delete_expense')

# Income handlers
create_income = get_handler_function(income_handler_module, 'create_income')
get_income = get_handler_function(income_handler_module, 'get_income')
update_income = get_handler_function(income_handler_module, 'update_income')
delete_income = get_handler_function(income_handler_module, 'delete_income')

# Goal handlers
create_goal = get_handler_function(goal_handler_module, 'create_goal')
get_goals = get_handler_function(goal_handler_module, 'get_goals')
update_goal = get_handler_function(goal_handler_module, 'update_goal')
delete_goal = get_handler_function(goal_handler_module, 'delete_goal')

# Event handlers
create_event = get_handler_function(event_handler_module, 'create_event')
get_event = get_handler_function(event_handler_module, 'get_event')
update_event = get_handler_function(event_handler_module, 'update_event')
delete_event = get_handler_function(event_handler_module, 'delete_event')

def lambda_handler(event, context):
    # Debug the incoming event
    print(f"Incoming event: {json.dumps(event, default=str)}")
    
    # Extract HTTP method and path
    http_method = event.get('httpMethod')
    path = event.get('path')
    
    # Handle direct Lambda invocations or malformed events
    if path is None or http_method is None:
        # Check if this might be a test event or direct invocation
        test_type = event.get('type')
        if test_type == 'test':
            return respond(200, {'message': 'Lambda function is working correctly'})
        
        # Otherwise, it's probably a malformed request
        print(f"Error: Missing required parameters. Event structure: {event}")
        return respond(400, {'message': 'Missing required API Gateway parameters'})
    
    print(f"Processing request: Method: {http_method}, Path: {path}")
    
    # Handle OPTIONS requests for CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'CORS preflight successful'})
    
    # User routes
    if path == '/users' and http_method == 'POST' and signup:
        return signup(event)
    elif path.startswith('/users/') and http_method == 'GET' and get_user:
        user_id = path.split('/')[-1]
        return get_user(user_id)
    elif path.startswith('/users/') and http_method == 'PUT' and update_user:
        user_id = path.split('/')[-1]
        return update_user(event, user_id)
    elif path.startswith('/users/') and http_method == 'DELETE' and delete_user:
        user_id = path.split('/')[-1]
        return delete_user(user_id)
    elif path == '/login' and http_method == 'POST' and login:
        return login(event)
    elif path == '/pass_change' and http_method == 'POST' and change_password:
        return change_password(event)
    
    # Expense routes
    elif path.startswith('/expenses/'):
        path_parts = path.split('/')
        if len(path_parts) < 3:
            return respond(400, {'message': 'User ID is required in the path'})
    

        user_id = path_parts[2]  # Extract userId
        # Prepare pathParameters for the handlers
        if 'pathParameters' not in event or event['pathParameters'] is None:
            event['pathParameters'] = {}
        event['pathParameters']['userid'] = user_id

        if http_method == 'POST' and create_expense:
            return create_expense(event, context)
        elif http_method == 'GET' and get_expenses:
            return get_expenses(event, context)
        elif http_method == 'PUT' and update_expense:
            if len(path_parts) >= 4:
                expense_id = path_parts[3]
                event['pathParameters']['expenseid'] = expense_id
                return update_expense(event, context)
            else:
                return respond(400, {'message': 'Expense ID is required for this operation'})
        elif http_method == 'DELETE' and delete_expense:
            if len(path_parts) >= 4:
                expense_id = path_parts[3]
                event['pathParameters']['expenseid'] = expense_id
                return delete_expense(event, context)
            else:
                return respond(400, {'message': 'Expense ID is required for this operation'})
        else:
            return respond(400, {'message': 'Invalid HTTP method for this resource'})
    
    # Income routes
    elif path.startswith('/income/'):
        path_parts = path.split('/')
        if len(path_parts) < 3:
            return respond(400, {'message': 'User ID is required in the path'})

        user_id = path_parts[2]  # Extract userId
        # Prepare pathParameters for the handlers
        if 'pathParameters' not in event or event['pathParameters'] is None:
            event['pathParameters'] = {}
        event['pathParameters']['userid'] = user_id

        if http_method == 'POST' and create_income:
            return create_income(event, context)
        elif http_method == 'GET' and get_income:
            income_id = path_parts[3] if len(path_parts) >= 4 else None
            if income_id:
                event['pathParameters']['incomeid'] = income_id
            return get_income(event, context)
        elif http_method == 'PUT' and update_income:
            if len(path_parts) >= 4:
                income_id = path_parts[3]
                event['pathParameters']['incomeid'] = income_id
                return update_income(event, context)
            else:
                return respond(400, {'message': 'Income ID is required for this operation'})
        elif http_method == 'DELETE' and delete_income:
            if len(path_parts) >= 4:
                income_id = path_parts[3]
                event['pathParameters']['incomeid'] = income_id
                return delete_income(event, context)
            else:
                return respond(400, {'message': 'Income ID is required for this operation'})
        else:
            return respond(400, {'message': 'Invalid HTTP method for this resource'})
    
    # Goal routes
    elif path.startswith('/goals/'):
        path_parts = path.split('/')
        if len(path_parts) < 3:
            return respond(400, {'message': 'User ID is required in the path'})
        user_id = path_parts[2]
        
        # Prepare pathParameters for the handlers
        if 'pathParameters' not in event or event['pathParameters'] is None:
            event['pathParameters'] = {}
        event['pathParameters']['userid'] = user_id

        if http_method == 'POST' and create_goal:
            return create_goal(event, context)
        elif http_method == 'GET' and get_goals:
            goal_id = path_parts[3] if len(path_parts) >= 4 else None
            if goal_id:
                event['pathParameters']['goalid'] = goal_id
            return get_goals(event, context)
        elif http_method == 'PUT' and update_goal:
            if len(path_parts) >= 4:
                goal_id = path_parts[3]
                event['pathParameters']['goalid'] = goal_id
                return update_goal(event, context)
            else:
                return respond(400, {'message': 'Goal ID is required for this operation'})
        elif http_method == 'DELETE' and delete_goal:
            if len(path_parts) >= 4:
                goal_id = path_parts[3]
                event['pathParameters']['goalid'] = goal_id
                return delete_goal(event, context)
            else:
                return respond(400, {'message': 'Goal ID is required for this operation'})
        else:
            return respond(404, {'message': 'Route not found'})
    
    # Event routes
    elif path.startswith('/events/'):
        path_parts = path.split('/')
        user_id = path_parts[2] if len(path_parts) > 2 else None
        event_id = path_parts[3] if len(path_parts) > 3 else None
        
        if not user_id:
            return respond(400, {'message': 'User ID is required in the path'})
        
        # Prepare pathParameters for the handlers
        if 'pathParameters' not in event or event['pathParameters'] is None:
            event['pathParameters'] = {}
        event['pathParameters']['userid'] = user_id
        
        if event_id:
            event['pathParameters']['eventid'] = event_id
            if http_method == 'PUT' and update_event:
                return update_event(event, context)
            elif http_method == 'DELETE' and delete_event:
                return delete_event(event, context)
            elif http_method == 'GET' and get_event:
                return get_event(event, context)
            else:
                return respond(400, {'message': 'Invalid HTTP method for this resource'})
        else:
            if http_method == 'POST' and create_event:
                return create_event(event, context)
            elif http_method == 'GET' and get_event:
                return get_event(event, context)
            else:
                return respond(400, {'message': 'Invalid HTTP method for this resource'})
    
    # Route not found
    else:
        return respond(404, {'message': 'Route not found'})