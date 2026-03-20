import type { APIGatewayProxyHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getUserId } from '../shared/auth.js';
import { keys, putItem } from '../shared/dynamo.js';
import { created, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body ?? '{}');
    const { name, color, icon } = body;
    if (!name) return badRequest('name is required');

    const logId = randomUUID();
    const now = new Date().toISOString();
    const log = {
      PK: keys.user(userId),
      SK: keys.log(logId),
      logId,
      userId,
      name,
      color: color ?? '#6366f1',
      icon: icon ?? '📋',
      active: true,
      position: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    await putItem(log);
    return created(log);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
