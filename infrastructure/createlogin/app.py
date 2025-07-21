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

    try:
        response = ddb_client.put_item(
                        TableName=table_name,
                        Item={
                            "Username":{"S":username},
                            "Password":{"S":password}
                        },
                        ConditionExpression="attribute_not_exists(Username)"
                    )
    except ddb_client.exceptions.ConditionalCheckFailedException:
        return {
            "statusCode": 422,
            "error": "Username already exists."
        }

    return {
        "statusCode": 200,
        "body": json.dumps(response)
    }
