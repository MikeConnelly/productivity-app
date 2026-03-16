import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ApiConstructProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
}

export class ApiConstruct extends Construct {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { table, userPool } = props;

    const commonEnv = { TABLE_NAME: table.tableName };

    const makeHandler = (name: string, handlerPath: string) => {
      const fn = new lambda.Function(this, name, {
        functionName: `productivity-app-${name}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, `../../../backend/dist/${handlerPath}`)),
        environment: commonEnv,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        logRetention: logs.RetentionDays.TWO_WEEKS,
        architecture: lambda.Architecture.ARM_64,
      });
      table.grantReadWriteData(fn);
      return fn;
    };

    const handlers = {
      listHabits: makeHandler('listHabits', 'habits/listHabits'),
      createHabit: makeHandler('createHabit', 'habits/createHabit'),
      updateHabit: makeHandler('updateHabit', 'habits/updateHabit'),
      deleteHabit: makeHandler('deleteHabit', 'habits/deleteHabit'),
      completeHabit: makeHandler('completeHabit', 'habits/completeHabit'),
      uncompleteHabit: makeHandler('uncompleteHabit', 'habits/uncompleteHabit'),
      getHabitHistory: makeHandler('getHabitHistory', 'habits/getHabitHistory'),
      getDayCompletions: makeHandler('getDayCompletions', 'habits/getDayCompletions'),
      getCompletionsRange: makeHandler('getCompletionsRange', 'habits/getCompletionsRange'),
      listLogs: makeHandler('listLogs', 'logs/listLogs'),
      createLog: makeHandler('createLog', 'logs/createLog'),
      updateLog: makeHandler('updateLog', 'logs/updateLog'),
      deleteLog: makeHandler('deleteLog', 'logs/deleteLog'),
      upsertLogEntry: makeHandler('upsertLogEntry', 'logs/upsertLogEntry'),
      getLogEntry: makeHandler('getLogEntry', 'logs/getLogEntry'),
      deleteLogEntry: makeHandler('deleteLogEntry', 'logs/deleteLogEntry'),
      getLogHistory: makeHandler('getLogHistory', 'logs/getLogHistory'),
      getDayLogEntries: makeHandler('getDayLogEntries', 'logs/getDayLogEntries'),
      getLogEntriesRange: makeHandler('getLogEntriesRange', 'logs/getLogEntriesRange'),
    };

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'productivity-app-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
      authorizerName: 'CognitoAuthorizer',
    });

    const authOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // /habits
    const habitsResource = api.root.addResource('habits');
    habitsResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.listHabits), authOptions);
    habitsResource.addMethod('POST', new apigateway.LambdaIntegration(handlers.createHabit), authOptions);

    // /habits/{habitId}
    const habitResource = habitsResource.addResource('{habitId}');
    habitResource.addMethod('PUT', new apigateway.LambdaIntegration(handlers.updateHabit), authOptions);
    habitResource.addMethod('DELETE', new apigateway.LambdaIntegration(handlers.deleteHabit), authOptions);

    // /habits/{habitId}/completions
    const completionsResource = habitResource.addResource('completions');
    completionsResource.addMethod('POST', new apigateway.LambdaIntegration(handlers.completeHabit), authOptions);

    // /habits/{habitId}/completions/{date}
    const completionByDateResource = completionsResource.addResource('{date}');
    completionByDateResource.addMethod('DELETE', new apigateway.LambdaIntegration(handlers.uncompleteHabit), authOptions);

    // /habits/{habitId}/history
    const historyResource = habitResource.addResource('history');
    historyResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.getHabitHistory), authOptions);

    // /completions
    const completionsRoot = api.root.addResource('completions');
    completionsRoot.addMethod('GET', new apigateway.LambdaIntegration(handlers.getDayCompletions), authOptions);

    // /completions/range
    const completionsRangeResource = completionsRoot.addResource('range');
    completionsRangeResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.getCompletionsRange), authOptions);

    // /logs
    const logsResource = api.root.addResource('logs');
    logsResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.listLogs), authOptions);
    logsResource.addMethod('POST', new apigateway.LambdaIntegration(handlers.createLog), authOptions);

    // /logs/{logId}
    const logResource = logsResource.addResource('{logId}');
    logResource.addMethod('PUT', new apigateway.LambdaIntegration(handlers.updateLog), authOptions);
    logResource.addMethod('DELETE', new apigateway.LambdaIntegration(handlers.deleteLog), authOptions);

    // /logs/{logId}/entries
    const logEntriesResource = logResource.addResource('entries');
    logEntriesResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.getLogHistory), authOptions);

    // /logs/{logId}/entries/{date}
    const logEntryByDate = logEntriesResource.addResource('{date}');
    logEntryByDate.addMethod('GET', new apigateway.LambdaIntegration(handlers.getLogEntry), authOptions);
    logEntryByDate.addMethod('PUT', new apigateway.LambdaIntegration(handlers.upsertLogEntry), authOptions);
    logEntryByDate.addMethod('DELETE', new apigateway.LambdaIntegration(handlers.deleteLogEntry), authOptions);

    // /log-entries
    const logEntriesRoot = api.root.addResource('log-entries');
    logEntriesRoot.addMethod('GET', new apigateway.LambdaIntegration(handlers.getDayLogEntries), authOptions);

    // /log-entries/range
    const logEntriesRangeResource = logEntriesRoot.addResource('range');
    logEntriesRangeResource.addMethod('GET', new apigateway.LambdaIntegration(handlers.getLogEntriesRange), authOptions);

    this.apiUrl = api.url;
  }
}
