import { Elysia } from 'elysia';
import corsMiddleware from './middlewares/cors';
import mangaRoutes from './routes/manga.routes';
import chapterRoutes from './routes/chapter.routes';
import tagRoutes from './routes/tag.routes';
import docsRoutes from './routes/docs.routes';
import uploadRoutes from './routes/upload.routes';
import staticRoutes from './routes/static.routes';
import ratingRoutes from './routes/rating.routes';
import { pool } from './config/db';
import { AppError } from './utils/errors';

const app = new Elysia()
  .use(corsMiddleware)
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { error: error.message };
    }
    console.error('[unhandled]', error);
    set.status = 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    return { error: message };
  })
  .use(mangaRoutes)
  .use(chapterRoutes)
  .use(tagRoutes)
  .use(ratingRoutes)
  .use(uploadRoutes)
  .use(staticRoutes)
  .use(docsRoutes)
  .get('/', () => ({
    name: 'SeeleScans API',
    version: '1.0.0',
  }))
  .get('/health', async ({ set }) => {
    try {
      await pool.query('SELECT 1');
      return { ok: true, db: 'up' };
    } catch (err) {
      console.error('[health] DB check failed:', err);
      set.status = 500;
      return { ok: false, db: 'down' };
    }
  })
  .listen(Number(process.env.PORT ?? 3000));

console.log(
  `Manga API running at http://${app.server?.hostname}:${app.server?.port}`,
);
