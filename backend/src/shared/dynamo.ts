import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
  type GetCommandInput,
  type PutCommandInput,
  type DeleteCommandInput,
  type QueryCommandInput,
  type UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = process.env.TABLE_NAME!;

export const keys = {
  user: (userId: string) => `USER#${userId}`,
  habit: (habitId: string) => `HABIT#${habitId}`,
  completion: (habitId: string, date: string) => `COMPLETION#${habitId}#${date}`,
  journal: (date: string) => `JOURNAL#${date}`,
  log: (logId: string) => `LOG#${logId}`,
  logEntry: (logId: string, date: string) => `LOG_ENTRY#${logId}#${date}`,
};

export async function getItem(pk: string, sk: string) {
  const params: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };
  const result = await db.send(new GetCommand(params));
  return result.Item;
}

export async function putItem(item: Record<string, unknown>) {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: item,
  };
  await db.send(new PutCommand(params));
}

export async function deleteItem(pk: string, sk: string) {
  const params: DeleteCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };
  await db.send(new DeleteCommand(params));
}

export async function queryItems(params: Omit<QueryCommandInput, 'TableName'>) {
  const result = await db.send(new QueryCommand({ ...params, TableName: TABLE_NAME }));
  return result.Items ?? [];
}

export async function updateItem(params: Omit<UpdateCommandInput, 'TableName'>) {
  const result = await db.send(new UpdateCommand({ ...params, TableName: TABLE_NAME }));
  return result.Attributes;
}
