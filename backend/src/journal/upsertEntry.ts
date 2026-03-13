import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, putItem, getItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const date = event.pathParameters?.date;
    if (!date) return badRequest('date is required');

    const body = JSON.parse(event.body ?? '{}');
    const { content } = body;
    if (content === undefined) return badRequest('content is required');

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const now = new Date().toISOString();

    // Check if existing
    const existing = await getItem(keys.user(userId), keys.journal(date));

    const entry = {
      PK: keys.user(userId),
      SK: keys.journal(date),
      userId,
      date,
      content,
      wordCount,
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
