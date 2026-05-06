import { Elysia } from 'elysia';
import { tagController } from '../controllers/tag.controller';

const tagRoutes = new Elysia()
  .get('/tags', tagController.listAll);

export default tagRoutes;
