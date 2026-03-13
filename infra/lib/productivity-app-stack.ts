import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseConstruct } from './constructs/database-construct';
import { AuthConstruct } from './constructs/auth-construct';
import { ApiConstruct } from './constructs/api-construct';
import { HostingConstruct } from './constructs/hosting-construct';

export class ProductivityAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new DatabaseConstruct(this, 'Database');
    const auth = new AuthConstruct(this, 'Auth');
    const api = new ApiConstruct(this, 'Api', {
      table: database.table,
      userPool: auth.userPool,
    });
    const hosting = new HostingConstruct(this, 'Hosting', {
      apiUrl: api.apiUrl,
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: auth.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: auth.userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.apiUrl });
    new cdk.CfnOutput(this, 'CloudFrontUrl', { value: hosting.distributionUrl });
    new cdk.CfnOutput(this, 'BucketName', { value: hosting.bucketName });
  }
}
