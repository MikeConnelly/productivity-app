import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, deleteItem } from '../shared/dynamo.js';
import { noContent, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const logId = event.pathParameters?.logId;
    const date = event.pathParameters?.date;
    if (!logId) return badRequest('logId is required');
    if (!date) return badRequest('date is required');
    await deleteItem(keys.user(userId), keys.logEntry(logId, date));
    return noContent();
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
