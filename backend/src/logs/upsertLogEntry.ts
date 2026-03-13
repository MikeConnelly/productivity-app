import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, putItem, getItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const logId = event.pathParameters?.logId;
    const date = event.pathParameters?.date;
    if (!logId) return badRequest('logId is required');
    if (!date) return badRequest('date is required');

    const body = JSON.parse(event.body ?? '{}');
    const { content } = body;
    if (content === undefined) return badRequest('content is required');

    const now = new Date().toISOString();
    const existing = await getItem(keys.user(userId), keys.logEntry(logId, date));

    const entry = {
      PK: keys.user(userId),
      SK: keys.logEntry(logId, date),
      logId,
      userId,
      date,
      content,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await putItem(entry);
    return ok(entry);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
