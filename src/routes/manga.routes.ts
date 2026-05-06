import { Elysia } from 'elysia';
import { mangaController } from '../controllers/manga.controller';

const mangaRoutes = new Elysia()
  .group('/manga', (app) =>
    app
      .get('/', mangaController.list)
      .get('/:id', mangaController.getById)
      .post('/', mangaController.create)
      .put('/:id', mangaController.update)
      .delete('/:id', mangaController.remove),
  );

export default mangaRoutes;
