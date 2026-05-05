import { Elysia } from 'elysia';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

const corsMiddleware = new Elysia({ name: 'cors' })
  .onRequest(({ request, set }) => {
    Object.assign(set.headers, CORS_HEADERS);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
  });

export default corsMiddleware;