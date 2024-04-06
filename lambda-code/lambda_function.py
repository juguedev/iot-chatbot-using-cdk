import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def lambda_handler(event, context):
    logger.debug('event={}'.format(event))

    slots = event['interpretations'][0]['intent']['slots']
    logger.debug('slots={}'.format(slots))
    device_name = slots['device']['value']['originalValue']
    
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    logger.debug(f"request received for device: {device_name}")

    
    data = get_dynamo_data("raspberry")
    print(data)
    
    return close(data, 'Fulfilled', {'contentType': 'PlainText','content': "response-test"})  


def close(event_data, fulfillment_state, message):
    response = {
        "sessionState": {
        "dialogAction": {
            "type": "Close"
        },
        "intent": {
            "name": "GetData",
            "state": "Fulfilled"
        }
    },
    "messages": [
        {
            "contentType": "PlainText",
            "content": str(event_data)
        },
        {
            "contentType": "PlainText",
            "content": "Otros datos"
        },
    ],
    }
    
    logger.debug('<<SupportBot>> "Lambda fulfillment function response = \n' + str(response)) 

    return response


def get_dynamo_data(device_id):
    """
    Query DynamoDB for data.

    Parameters:
        event (dict): Event data passed to the Lambda function.
        context (LambdaContext): Runtime information of the Lambda function.

    Returns:
        dict: Response object.
    """
    logger.info("getDynamoData")

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('device-data')

    response = table.get_item(
        Key={
            'device_id': device_id
        }
    )

    return response['Item']
