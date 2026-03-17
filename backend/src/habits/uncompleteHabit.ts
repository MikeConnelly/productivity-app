import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getUserId } from '../shared/auth.js';
import { keys, deleteItem, queryItems, updateItem } from '../shared/dynamo.js';
import { ok, badRequest, internalError } from '../shared/response.js';
import { subDays, format, parseISO } from 'date-fns';

async function recalcStreak(userId: string, habitId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const completions = await queryItems({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': keys.user(userId),
      ':prefix': `COMPLETION#${habitId}#`,
    },
    ScanIndexForward: false,
  });

  const dates = new Set(completions.map((c) => (c as { date: string }).date));

  // Calculate current streak from today backwards
  let currentStreak = 0;
  let checkDate = new Date();
  while (dates.has(format(checkDate, 'yyyy-MM-dd'))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Calculate longest streak
  const sortedDates = Array.from(dates).sort();
  let longestStreak = 0;
  let streak = 0;
  let prev: Date | null = null;
  for (const d of sortedDates) {
    const curr = parseISO(d);
    if (prev && Math.abs(curr.getTime() - subDays(prev, -1).getTime()) < 1000 * 60 * 60 * 24) {
      streak++;
    } else {
      streak = 1;
    }
    if (streak > longestStreak) longestStreak = streak;
    prev = curr;
  }

  return { currentStreak, longestStreak };
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const habitId = event.pathParameters?.habitId;
    const date = event.pathParameters?.date;
    if (!habitId || !date) return badRequest('habitId and date are required');
    await deleteItem(keys.user(userId), keys.completion(habitId, date));

    const { currentStreak, longestStreak } = await recalcStreak(userId, habitId);
    await updateItem({
      Key: { PK: keys.user(userId), SK: keys.habit(habitId) },
      UpdateExpression: 'SET currentStreak = :cs, longestStreak = :ls, updatedAt = :ua',
      ExpressionAttributeValues: {
        ':cs': currentStreak,
        ':ls': longestStreak,
        ':ua': new Date().toISOString(),
      },
    });

    return ok({ currentStreak, longestStreak });
  } catch (err) {
    console.error(err);
    return internalError();
  }
};
