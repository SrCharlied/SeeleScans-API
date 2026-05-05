import { Elysia } from 'elysia';
import corsMiddleware from './middlewares/cors';
import mangaRoutes from './routes/manga.routes';
import { pool } from './config/db';

const app = new Elysia()
  .use(corsMiddleware)
  .use(mangaRoutes)
  .get('/', () => {
    return {
      name: "SeeleScans API",
      version: "0.1.0"
    };
  })
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
  `Manga API running at http://${app.server?.hostname}:${app.server?.port}`
);