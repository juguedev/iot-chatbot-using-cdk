

const greetingIntent = {
    name: 'Greetings',
    sampleUtterances: [
        { utterance: 'Hi' },
        { utterance: 'Hola' },
        { utterance: 'Whats Up' },
        { utterance: 'Hi!' },
        { utterance: 'Hello!' }
    ],
    intentClosingSetting: {
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

const getDataIntent = (deviceTypeName: string, featureTypeName: string) => {
    return {
        name: 'GetData',
        sampleUtterances: [
            { utterance: 'I want to get data from my device' },
            { utterance: 'I need to query data for my device {device}' },
            { utterance: 'My device is {device}' },
        ],
        slots: [
            {
                name: 'device',
                slotTypeName: deviceTypeName,
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
            {
                name: 'feature',
                slotTypeName: featureTypeName,
                valueElicitationSetting: {
                    slotConstraint: 'Required',
                    promptSpecification: {
                        messageGroupsList: [
                            {
                                message: {
                                    plainTextMessage: {
                                        value: 'What is the value or feature you want to query?',
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
            {
                priority: 2,
                slotName: 'feature',
            },
        ],
        fulfillmentCodeHook: {
            enabled: true,
        },
    }
};

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