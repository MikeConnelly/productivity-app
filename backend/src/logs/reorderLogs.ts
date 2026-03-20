import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, updateItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body ?? '{}');
    const { logIds } = body;
    if (!Array.isArray(logIds)) return badRequest('logIds must be an array');

    await Promise.all(
      logIds.map((logId: string, i: number) =>
        updateItem({
          Key: { PK: keys.user(userId), SK: keys.log(logId) },
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
