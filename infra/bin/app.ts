import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductivityAppStack } from '../lib/productivity-app-stack';

const app = new cdk.App();
new ProductivityAppStack(app, 'ProductivityAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Productivity App - Habits, Journal, and more',
});
