import type { APIGatewayProxyHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getUserId } from '../shared/auth.js';
import { keys, putItem } from '../shared/dynamo.js';
import { TABLE_NAME } from '../shared/dynamo.js';
import { created, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body ?? '{}');
    const { name, color, icon } = body;
    if (!name) return badRequest('name is required');

    const habitId = randomUUID();
    const now = new Date().toISOString();
    const habit = {
      PK: keys.user(userId),
      SK: keys.habit(habitId),
      habitId,
      userId,
      name,
      color: color ?? '#6366f1',
      icon: icon ?? '⭐',
      active: true,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(habit);
    return created(habit);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
