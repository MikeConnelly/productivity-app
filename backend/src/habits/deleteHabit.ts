import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, deleteItem, queryItems, batchDeleteItems } from '../shared/dynamo.js';
import { noContent, badRequest, internalError } from '../shared/response.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const habitId = event.pathParameters?.habitId;
    if (!habitId) return badRequest('habitId is required');

    const pk = keys.user(userId);

    // Delete all completions for this habit
    const completions = await queryItems({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': pk, ':prefix': `COMPLETION#${habitId}#` },
      ProjectionExpression: 'PK, SK',
    });
    if (completions.length > 0) {
      await batchDeleteItems(completions as Array<{ PK: string; SK: string }>);
    }

    await deleteItem(pk, keys.habit(habitId));
    return noContent();
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
