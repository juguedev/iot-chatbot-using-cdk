

const deviceTypeName = {
    name: 'deviceType',
    parentSlotTypeSignature: 'AMAZON.AlphaNumeric',
    valueSelectionSetting: {
        resolutionStrategy: 'ORIGINAL_VALUE',
        regexFilter: {
            pattern: '[a-z]{1,10}',
        },
    },
};

const featureTypeName = {
    name: 'featureType',
    valueSelectionSetting: {
        resolutionStrategy: 'TOP_RESOLUTION',
    },
    slotTypeValues: [
        {
            sampleValue: {
                value: 'temperature',
            },
            synonyms: [
                {
                    value: 'degrees'
                }
            ],
        },
        {
            sampleValue: {
                value: 'humidity',
            },
            synonyms: [
                {
                    value: 'wetness'
                }
            ],
        }
    ]
}

const aggregationTypeName = {
    name: 'aggregationType',
    valueSelectionSetting: {
        resolutionStrategy: 'ORIGINAL_VALUE',
    },
    slotTypeValues: [
        {
            sampleValue: {
                value: 'median',
            },
        },
        {
            sampleValue: {
                value: 'mean',
            },
        },
        {
            sampleValue: {
                value: 'mode',
            },
        },
        {
            sampleValue: {
                value: 'range',
            },
        },
        {
            sampleValue: {
                value: 'latest',
            },
        }
    ]
}

export { deviceTypeName, featureTypeName, aggregationTypeName };
