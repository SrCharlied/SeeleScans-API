import { query } from '../config/db';
import type { Chapter, Page } from '../models/manga.model';

export const chapterService = {
  async listByMangaId(mangaId: number): Promise<Chapter[]> {
    const result = await query<Chapter>(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY number',
      [mangaId],
    );
    return result.rows;
  },

  async getById(id: number): Promise<Chapter | null> {
    const result = await query<Chapter>(
      'SELECT * FROM chapters WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  },

  async listPagesByChapterId(chapterId: number): Promise<Page[]> {
    const result = await query<Page>(
      'SELECT * FROM pages WHERE chapter_id = $1 ORDER BY page_number',
      [chapterId],
    );
    return result.rows;
  },
};
