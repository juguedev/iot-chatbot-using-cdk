import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnBot, CfnBotAlias, CfnBotVersion } from 'aws-cdk-lib/aws-lex';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as slotTypes from './chatbot/slot-types';
import * as intents from './chatbot/intents';

export interface IotChatbotUsingCdkStackProps extends cdk.StackProps {
	env: {
		region: string;
		project: string;
		environment: string;
		accountId: string;
		tblName: string;
	};
}

export class IotChatbotUsingCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: IotChatbotUsingCdkStackProps) {
		super(scope, id, props);

		// Create IAM role for the Lex bot
		const lambdaRole = new iam.Role(this, 'LambdaRole', {
			assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
			description: 'IAM role for the Lambda',
			roleName: 'LambdaRole',
		});

		// Define the Lambda function
		const fulfillmentLambda = new lambda.Function(this, 'MyLambda', {
			runtime: lambda.Runtime.PYTHON_3_8,
			handler: 'lambda_function.lambda_handler',
			functionName: 'fulfillment-lambda',
			code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-code')),
			memorySize: 256,
			timeout: cdk.Duration.seconds(10),
			role: lambdaRole,
		});
		lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

		const dynamoTable = new ddb.Table(this, 'ddb-table', {
			tableName: props.env.tblName,
			partitionKey: { name: 'device_id', type: ddb.AttributeType.STRING },
			billingMode: ddb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// Attach permission policy to the IAM Role to invoke the Lambda function
		lambdaRole.addToPolicy(
			new iam.PolicyStatement({
				actions: ['*'],
				resources: [dynamoTable.tableArn],
			})
		);

		// Create IAM role for the Lex bot
		const lexBotRole = new iam.Role(this, 'LexBotRole', {
			assumedBy: new iam.ServicePrincipal('lex.amazonaws.com'),
			description: 'IAM role for the Amazon Lex bot',
			roleName: 'LexBotRole',
		});

		// Attach policies to the role
		lexBotRole.addToPolicy(
			new iam.PolicyStatement({
				actions: ['lex:*', 'polly:SynthesizeSpeech'],
				resources: ['*'],
			})
		);

		// Attach permission policy to the IAM Role to invoke the Lambda function
		lexBotRole.addToPolicy(
			new iam.PolicyStatement({
				actions: ['lambda:InvokeFunction'],
				resources: [fulfillmentLambda.functionArn],
			})
		);

		const bot = new CfnBot(this, 'chatbot-test', {
			roleArn: lexBotRole.roleArn,
			dataPrivacy: {
				ChildDirected: true,
			},
			idleSessionTtlInSeconds: 120,
			name: 'bot-name',

			botLocales: [
				{
					localeId: 'en_US',
					nluConfidenceThreshold: 0.4,

					slotTypes: [slotTypes.deviceTypeName],

					intents: [
						intents.greetingIntent,
						intents.getDataIntent,
						intents.fallbackIntent
					],
				},
			],
		});

		// Creates an immutable Bot Version
		const botVersion = new CfnBotVersion(this, 'chatbot-version-test', {
			botId: bot.attrId,
			botVersionLocaleSpecification: [
				{
					localeId: 'en_US',
					botVersionLocaleDetails: {
						sourceBotVersion: 'DRAFT',
					},
				},
			],
		});

		const botAlias = new CfnBotAlias(this, 'chatbot-alias-test', {
			botAliasName: 'alias-test',
			botId: bot.attrId,
			botVersion: botVersion.attrBotVersion,
			botAliasLocaleSettings: [
				{
					botAliasLocaleSetting: {
						enabled: true,
						codeHookSpecification: {
							lambdaCodeHook: {
								codeHookInterfaceVersion: '1.0',
								lambdaArn: fulfillmentLambda.functionArn,
							},
						},
					},
					localeId: 'en_US',
				},
			],
		});

		//Lex Alias needs a resource-based permission attatched to the lambda function to invoke
		fulfillmentLambda.addPermission('AllowLexInvocation', {
			principal: new iam.ServicePrincipal('lex.amazonaws.com'),
			action: 'lambda:InvokeFunction',
			sourceArn: botAlias.attrArn,
		});
	}
}
