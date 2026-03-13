import type { APIGatewayProxyEvent } from 'aws-lambda';

export function getUserId(event: APIGatewayProxyEvent): string {
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims?.sub) {
    throw new Error('No user ID in request context');
  }
  return claims.sub as string;
}
