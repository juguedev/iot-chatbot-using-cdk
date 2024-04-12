import json
import boto3
import base64
import os

def lambda_handler(event, context):
    TBL_NAME = os.environ['TBL_NAME']
    
    client = boto3.client('dynamodb')
    
    for record in event['Records']:
        pk = record["kinesis"]["partitionKey"]
        msg = base64.b64decode(record["kinesis"]["data"])
        msg_decode = msg.decode("utf-8")
        msg_dict = json.loads(msg_decode)
        
        item = {
            'id': {'S': pk},
            "timestamp": {"S": msg_dict["timestamp"]},
            "device": {"S": msg_dict["device"]},
            "humidity": {"N": str(msg_dict["humidity"])},
            "temperature": {"N": str(msg_dict["temperature"])}
        }

        client.put_item(TableName=TBL_NAME,Item=item)

    return {
        'statusCode': 200,
        'body': json.dumps("Datos insertados correctamente en la tabla.")
    }