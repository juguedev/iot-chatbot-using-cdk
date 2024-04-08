import json
import boto3
import base64

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('events')

def lambda_handler(event, context):
    for record in event['Records']:
        pk = record["kinesis"]["partitionKey"]
        msg = base64.b64decode(record["kinesis"]["data"])

        table.put_item(Item={
            "pk": pk,
            "data": msg.decode("utf-8")
        })

    return {
        'statusCode': 200,
        'body': json.dumps("Datos insertados correctamente en la tabla.")
    }