import json
import boto3

ddb_client = boto3.client('dynamodb')
table_name = "GameHostingLoginTable"

def lambda_handler(event, context):
    username = event.get("username")
    password = event.get("password")

    if username is None or password is None:
        return {
            "statusCode": 404,
            "error": "Missing username or password."
        }

    response = ddb_client.get_item(
                    TableName=table_name,
                    Key={
                        "Username": {
                            'S': username
                        }
                    }
                )

    return {
        "statusCode": 200,
        "body": json.dumps(response)
    }
