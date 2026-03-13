import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, queryItems } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const date = event.queryStringParameters?.date;
    if (!date) return badRequest('date is required');

    const items = await queryItems({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': keys.user(userId),
        ':prefix': 'LOG_ENTRY#',
        ':date': date,
      },
      FilterExpression: '#date = :date',
      ExpressionAttributeNames: { '#date': 'date' },
    });
    return ok(items);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
