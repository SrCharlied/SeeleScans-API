import { mangaService } from '../services/manga.service';
import { validateBody, validateQuery, validateParams } from '../utils/validate';
import {
  MangaCreateSchema,
  MangaUpdateSchema,
  MangaListQuerySchema,
  IdParamSchema,
} from '../validation/manga.schema';
import { notFound } from '../utils/errors';

type Ctx = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  set: { status?: number | string };
};

export const mangaController = {
  async list({ query, set }: Ctx) {
    const q = validateQuery(MangaListQuerySchema, query);
    set.status = 200;
    return mangaService.list(q.page, q.limit, q.q, q.sort, q.order);
  },

  async getById({ params, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const manga = await mangaService.getById(id);
    if (!manga) throw notFound('Manga not found');
    set.status = 200;
    return manga;
  },

  async create({ body, set }: Ctx) {
    const data = validateBody(MangaCreateSchema, body);
    const created = await mangaService.create(data);
    set.status = 201;
    return created;
  },

  async update({ params, body, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const data = validateBody(MangaUpdateSchema, body);
    const updated = await mangaService.update(id, data);
    set.status = 200;
    return updated;
  },

  async remove({ params, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const ok = await mangaService.remove(id);
    if (!ok) throw notFound('Manga not found');
    set.status = 204;
    return null;
  },
};
