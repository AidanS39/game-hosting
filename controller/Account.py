from Server import Server
import boto3
import botocore.exceptions
import psycopg

class Account:
    def __init__(self, username):
        self.username = username
        self.servers = list()
    
    # creates a server
    # 1. create new ebs volume
    # 2. add server entry to database
    def createServer(self, serverName):
        
        # 1. create new ebs volume
        ec2 = boto3.client("ec2")
        response = {}
        try:
            response = ec2.create_volume(
                AvailabilityZone='us-east-1a',
                VolumeType='gp3',
                Size=20
            )
            if response['State'] == 'error':
                raise botocore.exceptions.ClientError
        except botocore.exceptions.ClientError as error:
            print("ClientError occurred while creating EBS volume: {error}")
            return -1
        except Exception as error:
            print ("Error occurred while creating EBS volume: {error}")

        volumeId = response['VolumeId']

        # 2. add server entry to database
        # with psycopg.connect("dbname=test user=postgres") as conn:


        return
