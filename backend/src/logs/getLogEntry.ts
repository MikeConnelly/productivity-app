import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, getItem } from '../shared/dynamo.js';
import { ok, notFound, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const logId = event.pathParameters?.logId;
    const date = event.pathParameters?.date;
    if (!logId) return badRequest('logId is required');
    if (!date) return badRequest('date is required');

    const item = await getItem(keys.user(userId), keys.logEntry(logId, date));
    if (!item) return notFound('Log entry not found');
    return ok(item);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
