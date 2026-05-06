import { query } from '../config/db';
import type { Tag } from '../models/manga.model';

export const tagService = {
  async listAll(): Promise<Tag[]> {
    const result = await query<Tag>('SELECT * FROM tags ORDER BY name');
    return result.rows;
  },
};
