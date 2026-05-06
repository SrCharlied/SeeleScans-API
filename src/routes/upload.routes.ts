import { Elysia } from 'elysia';
import { uploadController } from '../controllers/upload.controller';

const uploadRoutes = new Elysia()
  .post('/upload/cover', uploadController.cover);

export default uploadRoutes;
