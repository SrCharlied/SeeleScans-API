import { Elysia } from 'elysia';

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? '*';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  ...(ALLOWED_ORIGIN !== '*' ? { Vary: 'Origin' } : {}),
};

const corsMiddleware = new Elysia({ name: 'cors' })
  .onRequest(({ request, set }) => {
    Object.assign(set.headers, CORS_HEADERS);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
  });

export default corsMiddleware;