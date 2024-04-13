

const greetingIntent = {
    name: 'Greetings',
    sampleUtterances: [
        { utterance: 'Hi' },
        { utterance: 'Hola' },
        { utterance: 'Whats Up' },
        { utterance: 'Hi!' },
        { utterance: 'Hello!' }
    ],
    intentClosingSetting : {
        closingResponse: {
            messageGroupsList: [
                {
                    message: {
                        plainTextMessage: {
                            value: 'Hello, have a nice day using our bot, how can we help you?',
                        }
                    }
                }
            ]
        }
    }
}

const getDataIntent = {
    name: 'GetData',
    sampleUtterances: [
        { utterance: 'I want to get data from my device' },
        { utterance: 'I need to query data for my device {device}' },
        { utterance: 'My device is {device}' },
    ],
    slots: [
        {
            name: 'device',
            slotTypeName: 'deviceType',
            valueElicitationSetting: {
                slotConstraint: 'Required',
                promptSpecification: {
                    messageGroupsList: [
                        {
                            message: {
                                plainTextMessage: {
                                    value: 'What is your device?',
                                },
                            },
                        },
                    ],
                    maxRetries: 2,
                    allowInterrupt: true,
                },
            },
        },
    ],
    slotPriorities: [
        {
            priority: 1,
            slotName: 'device',
        },
    ],
    fulfillmentCodeHook: {
        enabled: true,
    },
}

const fallbackIntent = {
    name: 'FallbackIntent',
    description: 'Default intent when no other intent matches',
    parentIntentSignature: 'AMAZON.FallbackIntent',
    intentClosingSetting: {
        closingResponse: {
            messageGroupsList: [
                {
                    message: {
                        plainTextMessage: {
                            value: 'Sorry I am having trouble understanding.',
                        },
                    },
                },
            ],
        },
    },
}

export { greetingIntent, getDataIntent, fallbackIntent };