import json
import boto3

ddb_client = boto3.client('dynamodb')
table_name = "GameHostingLoginTable"

def lambda_handler(event, context):
    username = str(event.get("username"))
    password = str(event.get("password"))
    id       = str(event.get("id"))

    if username is None or password is None:
        return {
            "statusCode": 400,
            "error": "Missing username or password."
        }

    try:
        response = ddb_client.put_item(
                        TableName=table_name,
                        Item={
                            "Username"  :{"S":username},
                            "Password"  :{"S":password},
                            "Id"        :{"N":id},
                            "Scope"     :{"S":"standard"},
                        },
                        ConditionExpression="attribute_not_exists(Username)"
                    )
    except ddb_client.exceptions.ConditionalCheckFailedException:
        return {
            "statusCode": 422,
            "error": "Username already exists."
        }
    except Exception:
        return {
            "statusCode": 500,
            "error": "Error occurred while creating login."
        }

    return {
        "statusCode": 200,
        "body": "Login successfully created."
    }
