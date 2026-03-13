import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, updateItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const logId = event.pathParameters?.logId;
    if (!logId) return badRequest('logId is required');

    const body = JSON.parse(event.body ?? '{}');
    const updates: string[] = [];
    const values: Record<string, unknown> = {};
    const names: Record<string, string> = {};

    for (const field of ['name', 'color', 'icon', 'active'] as const) {
      if (body[field] !== undefined) {
        updates.push(`#${field} = :${field}`);
        values[`:${field}`] = body[field];
        names[`#${field}`] = field;
      }
    }

    if (updates.length === 0) return badRequest('No fields to update');

    updates.push('#updatedAt = :updatedAt');
    values[':updatedAt'] = new Date().toISOString();
    names['#updatedAt'] = 'updatedAt';

    const result = await updateItem({
      Key: { PK: keys.user(userId), SK: keys.log(logId) },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
      ReturnValues: 'ALL_NEW',
    });
    return ok(result);
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
