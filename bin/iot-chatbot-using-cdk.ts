#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IotChatbotUsingCdkStack } from '../lib/iot-chatbot-using-cdk-stack';
import { DataFlowStack } from '../lib/data-flow';
import { environments } from './environments';

const env = environments['dev'];

const app = new cdk.App();
new IotChatbotUsingCdkStack(app, 'IotChatbotUsingCdkStack', { env });

const dataFlowStack = new DataFlowStack(app, 'DataFlowStack', { env });

cdk.Tags.of(dataFlowStack).add('proyecto', env.project);
