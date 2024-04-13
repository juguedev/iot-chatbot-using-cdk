

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
                value: 'average',
            },
        },
        {
            sampleValue: {
                value: 'mean',
            },
        }
    ]
}

export { deviceTypeName, featureTypeName, aggregationTypeName };
