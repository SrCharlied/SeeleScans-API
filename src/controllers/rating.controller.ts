import { ratingService } from '../services/rating.service';
import { validateBody, validateParams, validateQuery } from '../utils/validate';
import {
  IdParamSchema,
  RatingCreateSchema,
  ClientIdQuerySchema,
  ClientIdRequiredSchema,
} from '../validation/manga.schema';

type Ctx = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  set: { status?: number | string };
};

export const ratingController = {
  async get({ params, query, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const q = validateQuery(ClientIdQuerySchema, query);
    set.status = 200;
    return ratingService.getStats(id, q.client_id);
  },

  async create({ params, body, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const data = validateBody(RatingCreateSchema, body);
    const stats = await ratingService.upsert(id, data.client_id, data.value);
    set.status = 201;
    return stats;
  },

  async remove({ params, query, set }: Ctx) {
    const { id } = validateParams(IdParamSchema, params);
    const q = validateQuery(ClientIdRequiredSchema, query);
    const stats = await ratingService.remove(id, q.client_id);
    set.status = 200;
    return stats;
  },
};
