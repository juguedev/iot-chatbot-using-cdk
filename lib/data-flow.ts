import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as iot from 'aws-cdk-lib/aws-iot';
import { KinesisEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { createName } from '../utils/createName';

export class DataFlow extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// AWS KINESIS DATA STREAM
		const stream = new kinesis.Stream(this, 'MyEncryptedStream', {
			streamName: createName('kinesis', 'data-stream'),
			encryption: kinesis.StreamEncryption.MANAGED,
		});

		// AWS DYNAMODB
		const table = new dynamodb.Table(this, 'Table', {
			tableName: createName('tbl', 'measures'),
			partitionKey: {
				name: 'id',
				type: dynamodb.AttributeType.STRING,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// AWS LAMBDAS FUNCTION
		const savePayloadFunction = new lambda.Function(this, 'SavePayloadFunction', {
			runtime: lambda.Runtime.PYTHON_3_12,
			handler: 'save_payload.handler',
			functionName: createName('fn', 'save-payload'),
			description: 'Lambda function para guardar el payload en Dynamodb.',
			retryAttempts: 0,
			code: lambda.Code.fromAsset('lambda-code'),
			timeout: cdk.Duration.seconds(240),
			memorySize: 1024,
		});

		table.grantReadWriteData(savePayloadFunction);

		savePayloadFunction.addEventSource(
			new KinesisEventSource(stream, {
				batchSize: 100,
				startingPosition: lambda.StartingPosition.LATEST,
			})
		);

		// Define el rol IAM para la regla IoT
		const actionRole = new iam.Role(this, 'ActionRole', {
			assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
		});

		// Añade una política para permitir enviar datos a Kinesis
		const kinesisPolicyStatement = new iam.PolicyStatement({
			actions: ['kinesis:PutRecord'],
			resources: [stream.streamArn],
		});
		actionRole.addToPolicy(kinesisPolicyStatement);

		// Define el rol IAM para manejar los errores de la regla IoT
		const errorActionRole = new iam.Role(this, 'ErrorActionRole', {
			assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
		});

		// Añade una política para permitir publicar los errores de kinesis en IoT Core
		const errorKinesisPolicyStatement = new iam.PolicyStatement({
			actions: ['iot:Publish'],
			resources: [stream.streamArn],
		});
		errorActionRole.addToPolicy(errorKinesisPolicyStatement);

		// Define la regla IoT
		new iot.CfnTopicRule(this, 'Rule', {
			ruleName: createName('iot-core', 'rule'),
			topicRulePayload: {
				sql: 'SELECT * FROM "my/topic"',
				actions: [
					{
						kinesis: {
							roleArn: actionRole.roleArn,
							streamName: stream.streamName,
							partitionKey: '${newuuid()}',
						},
					},
				],
				errorAction: {
					kinesis: {
						roleArn: errorActionRole.roleArn,
						streamName: stream.streamName,
						partitionKey: '${newuuid()}',
					},
				},
			},
		});
	}
}
