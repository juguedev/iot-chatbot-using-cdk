import json
import logging
import boto3
import os
from boto3.dynamodb.conditions import Key
from statistics import mean, median, mode
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)
TBL_NAME = os.environ['TBL_NAME']


def calculate_aggregation(response, aggregation, feature_id, device_id):
    values = [item[feature_id] for item in response['Items']]
    timestamp = [item['timestamp'] for item in response['Items']]

    if aggregation == 'mean':
        return f"The mean value of the feature {feature_id} for the device {device_id} is {mean(values)}"
    
    elif aggregation == 'latest':
        latest_timestamp = datetime.strptime(str(timestamp[0]), '%Y%m%d%H%M%S')
        print(timestamp)
        return f"The last value of the feature {feature_id} for the device {device_id} is {values[0]} at {str(latest_timestamp)}"
        
    elif aggregation == 'range':
        return f"The range of values of the feature {feature_id} for the device {device_id} is from {min(values)} to {max(values)}"

    elif aggregation == 'mode':
        return f"The mode value of the feature {feature_id} for the device {device_id} is {mode(values)}"
    
    elif aggregation == 'median':
        return f"The median value of the feature {feature_id} for the device {device_id} is {median(values)}"

    else:
        return None

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

    
    data = get_dynamo_data(device_name, feature_name, aggregation)
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


def get_dynamo_data(device_id, feature_id, aggregation_id):
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

    #response = table.get_item(
    #    Key={
    #        'device_id': device_id
    #    }
    #)
    response = table.query(
        KeyConditionExpression=Key('device_id').eq(device_id),
        ScanIndexForward=False,  # Reverse the order of results
        Limit=600  # Limit the result to one item
    )
    
   
    result_aggregated = calculate_aggregation(response, aggregation_id, feature_id , device_id)
    print(result_aggregated)

    return result_aggregated
