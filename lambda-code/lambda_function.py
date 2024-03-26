import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def close(session_attributes, fulfillment_state, message):
    """
    Close dialog with the customer.

    Parameters:
        session_attributes (dict): Session attributes.
        fulfillment_state (str): Fulfillment state.
        message (dict): Message to be sent to the user.

    Returns:
        dict: Response object.
    """
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitIntent',
            'message': message
        }
    }

def build_response(intent, callback):
    """
    Build response to send to the user.

    Parameters:
        intent (dict): Intent data.
        callback (function): Callback function to invoke.

    Returns:
        None
    """
    logger.info("buildResponse")

    response_text = "Welcome to our service. Are you interested in registering? Reply REGISTER if interested, otherwise reply CANCEL or just ignore this message."

    callback(close(intent['sessionAttributes'], 'Fulfilled', {
        'contentType': 'PlainText',
        'content': response_text
    }))

def lambda_handler(event, context):
    """
    Main Lambda handler.

    Parameters:
        event (dict): Event data passed to the Lambda function.
        context (LambdaContext): Runtime information of the Lambda function.

    Returns:
        dict: Response object.
    """
    try:
        logger.info(event)
        logger.info(f"request received for userId={event['userId']}, intentName={event['currentIntent']['name']}")

        build_response(event,
                       lambda response: response)
    except Exception as e:
        logger.exception("An error occurred:")
        raise e
