import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, updateItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body ?? '{}');
    const { habitIds } = body;
    if (!Array.isArray(habitIds)) return badRequest('habitIds must be an array');

    await Promise.all(
      habitIds.map((habitId: string, i: number) =>
        updateItem({
          Key: { PK: keys.user(userId), SK: keys.habit(habitId) },
          UpdateExpression: 'SET #pos = :pos',
          ExpressionAttributeNames: { '#pos': 'position' },
          ExpressionAttributeValues: { ':pos': i },
        })
      )
    );

    return ok({ success: true });
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
