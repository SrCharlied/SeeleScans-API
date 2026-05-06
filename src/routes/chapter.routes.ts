import { Elysia } from 'elysia';
import { chapterController } from '../controllers/chapter.controller';

const chapterRoutes = new Elysia()
  .get('/manga/:id/chapters', chapterController.listByMangaId)
  .get('/chapters/:id', chapterController.getById)
  .get('/chapters/:id/pages', chapterController.listPagesByChapterId);

export default chapterRoutes;
