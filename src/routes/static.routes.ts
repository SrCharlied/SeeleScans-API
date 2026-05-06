import { Elysia } from 'elysia';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COVER_DIR } from '../config/storage';
import { badRequest, notFound } from '../utils/errors';

const SAFE_FILENAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

const staticRoutes = new Elysia()
  .get('/uploads/covers/:filename', ({ params }) => {
    const filename = (params as { filename: string }).filename;
    if (!filename || !SAFE_FILENAME.test(filename) || filename.includes('..')) {
      throw badRequest('Invalid filename.');
    }
    const path = join(COVER_DIR, filename);
    if (!existsSync(path)) {
      throw notFound('File not found.');
    }
    const file = Bun.file(path);
    return new Response(file, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
      },
    });
  });

export default staticRoutes;
