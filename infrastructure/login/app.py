import json
import boto3

ddb_client = boto3.client('dynamodb')
table_name = "GameHostingLoginTable"

def lambda_handler(event, context):
    username = event.get("username")

    if username is None:
        return {
            "statusCode": 400,
            "error": "Missing username."
        }

    response = ddb_client.get_item(
                    TableName=table_name,
                    Key={
                        "Username": {
                            'S': username
                        }
                    }
                )

    responsePassword = response.get('Item', {}).get('Password', {}).get('S')  

    if responsePassword is None:
        return {
            "statusCode": 401,
            "error": "Invalid username."
        }

    return {
        "statusCode": 200,
        "password": responsePassword
    }
