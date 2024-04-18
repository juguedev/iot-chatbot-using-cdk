import json
import logging
import boto3
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)
TBL_NAME = os.environ['TBL_NAME']


def lambda_handler(event, context):
    logger.info('event={}'.format(event))

    slots = event['interpretations'][0]['intent']['slots']
    logger.info('slots={}'.format(slots))
    device_name = slots['device']['value']['originalValue']
    feature_name = slots['feature']['value']['originalValue']
    aggregation = slots['aggregation']['value']['originalValue']
    
    logger.info('event.bot.name={}'.format(event['bot']['name']))
    logger.info(f"request received for device: {device_name}")
    logger.info(f"request received for feature: {feature_name}")
    logger.info(f"request received for aggregation: {aggregation}")

    
    data = get_dynamo_data(device_name, feature_name)
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
    ],
    }
    
    logger.info('"Lambda fulfillment function response = \n' + str(response)) 

    return response


def get_dynamo_data(device_id, feature_id):
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
    table = dynamodb.Table(TBL_NAME)

    response = table.get_item(
        Key={
            'device_id': device_id
        }
    )

    print(str(response['Item'][feature_id]))

    return f"The value of the feature {feature_id} for the device {device_id} is {str(response['Item'][feature_id])}"
