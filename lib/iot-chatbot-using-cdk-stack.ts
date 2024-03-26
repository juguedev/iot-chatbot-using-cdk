import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnBot, CfnBotAlias, CfnBotVersion } from 'aws-cdk-lib/aws-lex';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class IotChatbotUsingCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Define the Lambda function
    const fulfillmentLambda = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-code')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        MY_ENV_VARIABLE: 'some_value'
      }
    });

    // Create IAM role for the Lex bot
    const lexBotRole = new iam.Role(this, 'LexBotRole', {
      assumedBy: new iam.ServicePrincipal('lex.amazonaws.com'),
      description: 'IAM role for the Amazon Lex bot',
      roleName: 'LexBotRole'
    });

    // Attach policies to the role
    lexBotRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'lex:*',
        'polly:SynthesizeSpeech'
      ],
      resources: ['*']
    }));

    // Attach permission policy to the IAM Role to invoke the Lambda function
    lexBotRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [fulfillmentLambda.functionArn]
    }));



    const bot = new CfnBot(this, "chatbot-test", {
      roleArn: lexBotRole.roleArn,
      dataPrivacy: {
        "ChildDirected": true
      },
      idleSessionTtlInSeconds: 120,
      name: "bot-name",

      botLocales: [
        {
          localeId: "en_US",
          nluConfidenceThreshold: 0.40,

          slotTypes: [
            {
              name: "valueType",
              parentSlotTypeSignature: "AMAZON.AlphaNumeric",
              valueSelectionSetting: {
                resolutionStrategy: "ORIGINAL_VALUE",
                regexFilter: {
                  pattern: "[0-9]{8}"
                }
              }
            }
          ],

          intents: [
            {
              name: "Update",
              sampleUtterances: [
                { utterance: "I want to update" },
                { utterance: "I have a new data" },
                { utterance: "My new value is {value}" }
              ],
              slots: [
                {
                  name: "value",
                  slotTypeName: "valueType",
                  valueElicitationSetting: {
                    slotConstraint: "Required",
                    promptSpecification: {
                      messageGroupsList: [
                        {
                          message: {
                            plainTextMessage: {
                              value: "What is your value?"
                            }
                          }
                        }
                      ],
                      maxRetries: 2,
                      allowInterrupt: true
                    }
                  }
                }
              ],
              slotPriorities: [
                {
                  priority: 1,
                  slotName: "value"
                }
              ],
              fulfillmentCodeHook: {
                enabled: true,
              }
            },
            {
              name: "FallbackIntent",
              description: "Default intent when no other intent matches",
              parentIntentSignature: "AMAZON.FallbackIntent",
              intentClosingSetting: {
                closingResponse: {
                  messageGroupsList: [
                    {
                      message: {
                        plainTextMessage: {
                          value: "Sorry I am having trouble understanding."
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]

        }
      ]
    })

    // Creates an immutable Bot Version
    const botVersion = new CfnBotVersion(this, "chatbot-version-test", {
      botId: bot.attrId,
      botVersionLocaleSpecification: [
        {
          localeId: "en_US",
          botVersionLocaleDetails: {
            sourceBotVersion: "DRAFT"
          }
        }
      ],
    }
    )

    const botAlias = new CfnBotAlias(this, "chatbot-alias-test", {
      botAliasName: "alias-test",
      botId: bot.attrId,
      botVersion: botVersion.attrBotVersion,
      botAliasLocaleSettings: [{
        botAliasLocaleSetting: {
          enabled: true,
          codeHookSpecification: {
            lambdaCodeHook: {
              codeHookInterfaceVersion: "1.0",
              lambdaArn: fulfillmentLambda.functionArn
            }
          }
        },
        localeId: 'en_US',
      }],
    })


    
    //Lex Alias needs a resource-based permission attatched to the lambda function to invoke
    fulfillmentLambda.addPermission('AllowLexInvocation', {
      principal: new iam.ServicePrincipal('lex.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: botAlias.attrArn,
    });


  }
}
