import { uploadService } from '../services/upload.service';
import { badRequest } from '../utils/errors';

type Ctx = {
  body?: unknown;
  set: { status?: number | string };
};

function pickFile(body: unknown): File | null {
  if (!body || typeof body !== 'object') return null;
  const obj = body as Record<string, unknown>;
  const candidate = obj.file ?? obj.cover ?? obj.image;
  if (candidate && typeof candidate === 'object' && 'arrayBuffer' in candidate) {
    return candidate as File;
  }
  return null;
}

export const uploadController = {
  async cover({ body, set }: Ctx) {
    const file = pickFile(body);
    if (!file) {
      throw badRequest('Use multipart/form-data with field "file".');
    }
    const result = await uploadService.saveCover(file);
    set.status = 201;
    return result;
  },
};
