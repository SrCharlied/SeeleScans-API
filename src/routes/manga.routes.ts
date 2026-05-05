import { Elysia } from 'elysia';

const mangaRoutes = new Elysia({ aot: false })
  .group('/manga', (app) => {
    return app;
  });

export default mangaRoutes;