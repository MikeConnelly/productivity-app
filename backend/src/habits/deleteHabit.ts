import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, deleteItem } from '../shared/dynamo.js';
import { noContent, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const habitId = event.pathParameters?.habitId;
    if (!habitId) return badRequest('habitId is required');
    await deleteItem(keys.user(userId), keys.habit(habitId));
    return noContent();
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
