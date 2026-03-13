const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

function respond(statusCode: number, body?: unknown) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : '',
  };
}

export const ok = (body: unknown) => respond(200, body);
export const created = (body: unknown) => respond(201, body);
export const noContent = () => respond(204);
export const badRequest = (message: string) => respond(400, { message });
export const notFound = (message = 'Not found') => respond(404, { message });
export const internalError = (message = 'Internal server error') => respond(500, { message });
