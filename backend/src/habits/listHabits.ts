import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, queryItems } from '../shared/dynamo.js';
import { ok, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const items = await queryItems({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': keys.user(userId),
        ':prefix': 'HABIT#',
      },
    });
    return ok(items);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
