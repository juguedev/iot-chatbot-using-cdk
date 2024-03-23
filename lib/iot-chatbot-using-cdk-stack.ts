import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnBot } from 'aws-cdk-lib/aws-lex';

export class IotChatbotUsingCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bot = new CfnBot(this, "chatbot-test", {
      roleArn: "",
      dataPrivacy: {
        "ChildDirected": false
      },
      idleSessionTtlInSeconds: 60,
      name: "bot-name"
    })

  }
}
