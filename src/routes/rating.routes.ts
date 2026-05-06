import { Elysia } from 'elysia';
import { ratingController } from '../controllers/rating.controller';

const ratingRoutes = new Elysia()
  .get('/manga/:id/rating', ratingController.get)
  .post('/manga/:id/rating', ratingController.create)
  .delete('/manga/:id/rating', ratingController.remove);

export default ratingRoutes;
