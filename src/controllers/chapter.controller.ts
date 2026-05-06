import { chapterService } from '../services/chapter.service';
import { validateParams } from '../utils/validate';
import { IdParamSchema } from '../validation/manga.schema';
import { notFound } from '../utils/errors';

type Ctx = {
  params?: unknown;
  set: { status?: number | string };
};

export const chapterController = {
  async listByMangaId({ params, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    set.status = 200;
    return chapterService.listByMangaId(id);
  },

  async getById({ params, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const chapter = await chapterService.getById(id);
    if (!chapter) throw notFound('Chapter not found');
    set.status = 200;
    return chapter;
  },

  async listPagesByChapterId({ params, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    set.status = 200;
    return chapterService.listPagesByChapterId(id);
  },
};
