import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, queryItems } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const habitId = event.pathParameters?.habitId;
    if (!habitId) return badRequest('habitId is required');

    const from = event.queryStringParameters?.from;
    const to = event.queryStringParameters?.to;

    let keyCondition = 'PK = :pk AND begins_with(SK, :prefix)';
    const expressionValues: Record<string, unknown> = {
      ':pk': keys.user(userId),
      ':prefix': `COMPLETION#${habitId}#`,
    };

    if (from && to) {
      keyCondition = 'PK = :pk AND SK BETWEEN :from AND :to';
      expressionValues[':from'] = keys.completion(habitId, from);
      expressionValues[':to'] = keys.completion(habitId, to);
      delete expressionValues[':prefix'];
    }

    const items = await queryItems({
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
    });
    return ok(items);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
