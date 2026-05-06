import { pool, query } from '../config/db';
import type { Manga, MangaWithTags } from '../models/manga.model';
import { badRequest, notFound } from '../utils/errors';

export interface MangaListResult {
  data: Manga[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MangaCreateData {
  slug: string;
  title: string;
  synopsis?: string;
  cover_url?: string;
  author?: string;
  artist?: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  year?: number;
  tags?: string[];
}

export interface MangaUpdateData {
  slug?: string;
  title?: string;
  synopsis?: string;
  cover_url?: string;
  author?: string;
  artist?: string;
  status?: 'ongoing' | 'completed' | 'hiatus';
  year?: number;
  tags?: string[];
}

const VALID_SORT = ['title', 'year', 'created_at', 'updated_at'] as const;
const UPDATABLE_COLUMNS = ['slug', 'title', 'synopsis', 'cover_url', 'author', 'artist', 'status', 'year'] as const;

export const mangaService = {
  async list(
    page: number = 1,
    limit: number = 10,
    q?: string,
    sort: string = 'created_at',
    order: string = 'desc',
  ): Promise<MangaListResult> {
    const params: unknown[] = [];
    let paramIndex = 1;
    let whereClause = '';

    if (q && q.trim() !== '') {
      whereClause = `WHERE m.title ILIKE $${paramIndex}`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    const sortCol = (VALID_SORT as readonly string[]).includes(sort) ? sort : 'created_at';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';
    const nullsClause = sortCol === 'year' ? ' NULLS LAST' : '';
    const orderByClause = `ORDER BY m.${sortCol} ${sortDir}${nullsClause}`;

    const offset = (page - 1) * limit;

    const result = await query<Manga & { total_count: string; rating_avg: string; rating_count: string }>(
      `SELECT
         m.*,
         COUNT(*) OVER() AS total_count,
         COALESCE((SELECT ROUND(AVG(value)::numeric, 2) FROM ratings WHERE manga_id = m.id), 0) AS rating_avg,
         COALESCE((SELECT COUNT(*) FROM ratings WHERE manga_id = m.id), 0) AS rating_count
       FROM mangas m
       ${whereClause}
       ${orderByClause}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const firstRow = result.rows[0];
    const total = firstRow ? parseInt(String(firstRow.total_count), 10) : 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const data = result.rows.map(({ total_count, rating_avg, rating_count, ...rest }) => ({
      ...(rest as Manga),
      rating_avg: parseFloat(String(rating_avg ?? 0)),
      rating_count: parseInt(String(rating_count ?? 0), 10),
    }));

    return { data, meta: { page, limit, total, totalPages } };
  },

  async getById(id: number): Promise<MangaWithTags | null> {
    const result = await query<MangaWithTags & { rating_avg: string; rating_count: string }>(
      `SELECT m.*,
              COALESCE(
                json_agg(t.*) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
              ) AS tags,
              COALESCE((SELECT ROUND(AVG(value)::numeric, 2) FROM ratings WHERE manga_id = m.id), 0) AS rating_avg,
              COALESCE((SELECT COUNT(*) FROM ratings WHERE manga_id = m.id), 0) AS rating_count
       FROM mangas m
       LEFT JOIN manga_tags mt ON m.id = mt.manga_id
       LEFT JOIN tags t ON mt.tag_id = t.id
       WHERE m.id = $1
       GROUP BY m.id`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    const { rating_avg, rating_count, ...rest } = row;
    return {
      ...(rest as MangaWithTags),
      rating_avg: parseFloat(String(rating_avg ?? 0)),
      rating_count: parseInt(String(rating_count ?? 0), 10),
    };
  },

  async create(data: MangaCreateData): Promise<MangaWithTags> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inserted = await client.query<{ id: number }>(
        `INSERT INTO mangas (slug, title, synopsis, cover_url, author, artist, status, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [data.slug, data.title, data.synopsis, data.cover_url, data.author, data.artist, data.status, data.year],
      );
      const newId = inserted.rows[0]!.id;

      if (data.tags && data.tags.length > 0) {
        const tagRes = await client.query<{ id: number }>(
          'SELECT id FROM tags WHERE slug = ANY($1)',
          [data.tags],
        );
        if (tagRes.rows.length !== data.tags.length) {
          throw badRequest('One or more tags do not exist');
        }
        for (const row of tagRes.rows) {
          await client.query(
            'INSERT INTO manga_tags (manga_id, tag_id) VALUES ($1, $2)',
            [newId, row.id],
          );
        }
      }

      await client.query('COMMIT');

      const created = await this.getById(newId);
      if (!created) throw new Error('Manga vanished after create');
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id: number, data: MangaUpdateData): Promise<MangaWithTags> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const exists = await client.query('SELECT id FROM mangas WHERE id = $1', [id]);
      if (exists.rows.length === 0) {
        throw notFound('Manga not found');
      }

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      for (const key of UPDATABLE_COLUMNS) {
        const val = data[key];
        if (val !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(val);
          paramIndex++;
        }
      }

      if (updates.length > 0) {
        await client.query(
          `UPDATE mangas SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          [...values, id],
        );
      }

      if (data.tags !== undefined) {
        await client.query('DELETE FROM manga_tags WHERE manga_id = $1', [id]);
        if (data.tags.length > 0) {
          const tagRes = await client.query<{ id: number }>(
            'SELECT id FROM tags WHERE slug = ANY($1)',
            [data.tags],
          );
          if (tagRes.rows.length !== data.tags.length) {
            throw badRequest('One or more tags do not exist');
          }
          for (const row of tagRes.rows) {
            await client.query(
              'INSERT INTO manga_tags (manga_id, tag_id) VALUES ($1, $2)',
              [id, row.id],
            );
          }
        }
      }

      await client.query('COMMIT');

      const updated = await this.getById(id);
      if (!updated) throw new Error('Manga vanished after update');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async remove(id: number): Promise<boolean> {
    const result = await query('DELETE FROM mangas WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
