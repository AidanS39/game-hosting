from Server import Server

import os
from dotenv import load_dotenv
import boto3
import botocore.exceptions
import psycopg
from psycopg import sql

class Account:
    def __init__(self, id: int, username: str):
        self.id = id
        self.username = username
        self.servers = list()

    @staticmethod
    def createAccount(username: str) -> 'Account':
        conn_string = os.getenv("DB_CONNECTION_STRING")
        with psycopg.connect(conn_string) as conn:
            print("CONNECTED TO DB")
            with conn.cursor() as cursor:
                cursor.execute(
                    sql.SQL("INSERT INTO accounts ({}) VALUES ({}) RETURNING id;").format(
                        sql.Identifier('name'),
                        sql.Placeholder('name')
                    ),
                    {
                        "name" : username
                    }
                )
                id_row = cursor.fetchone()
                if id_row == None:
                    print("Error occurred while fetching inserted account id.")
                    return -1
                id = id_row[0]
        return Account(id, username)
            
    # creates a server
    # 1. create new ebs volume
    # 2. add server entry to database
    def createServer(self, name: str, cpu: int, memory: int, type: str="VANILLA", version: str = "LATEST") -> Server:
        
        # 1. create new ebs volume
        ec2 = boto3.client("ec2")
        response = {}
        try:
            response = ec2.create_volume(
                AvailabilityZone='us-east-1a',
                VolumeType='gp3',
                Size=20,
                DryRun=True
            )
            if response['State'] == 'error':
                raise Exception
        except botocore.exceptions.ClientError as error:
            print(f"ClientError occurred while creating EBS volume: {error}")
            
        except Exception as error:
            print (f"Error occurred while creating EBS volume: {error}")
            return -1

        # volumeId = response['VolumeId']
        volumeId = "test"

        # 2. add server entry to database
        names = ["name", "cpu", "memory", "type", "version", "account_id", "volume_id"]
        conn_string = os.getenv("DB_CONNECTION_STRING")
        with psycopg.connect(conn_string) as conn:
            print("CONNECTED TO DB")
            with conn.cursor() as cursor:
                cursor.execute(
                    sql.SQL("INSERT INTO servers ({}) VALUES ({}) RETURNING id;").format(
                        sql.SQL(", ").join(map(sql.Identifier, names)),
                        sql.SQL(", ").join(map(sql.Placeholder, names))
                    ),
                    {
                        "name"       : name,
                        "cpu"        : cpu, 
                        "memory"     : memory,
                        "type"       : type,
                        "version"    : version,
                        "account_id" : self.id,
                        "volume_id"  : volumeId
                    }
                )
                id_row = cursor.fetchone()
                if id_row == None:
                    print("Error occurred while fetching inserted server id.")
                    return -1
                id = id_row[0]
        return Server(id, name, cpu, memory, type, version, self.id, volumeId)

load_dotenv()

account = Account.createAccount("testName")
print(account.id, account.username)
server = account.createServer("testName", 2048, 8196, "PAPER", "LATEST")
print(server.id, server.name, server.cpu, server.memory)


