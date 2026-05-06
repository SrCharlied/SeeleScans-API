import { query } from '../config/db';
import type { RatingStats } from '../models/manga.model';
import { notFound } from '../utils/errors';

interface StatsRow {
  avg: string | null;
  count: string;
  d1: string;
  d2: string;
  d3: string;
  d4: string;
  d5: string;
  mine: number | null;
}

async function ensureMangaExists(mangaId: number): Promise<void> {
  const res = await query<{ id: number }>('SELECT id FROM mangas WHERE id = $1', [mangaId]);
  if (res.rows.length === 0) throw notFound('Manga not found');
}

async function fetchStats(mangaId: number, clientId?: string): Promise<RatingStats> {
  const res = await query<StatsRow>(
    `SELECT
       COALESCE(ROUND(AVG(value)::numeric, 2), 0) AS avg,
       COUNT(*)                                   AS count,
       COUNT(*) FILTER (WHERE value = 1)          AS d1,
       COUNT(*) FILTER (WHERE value = 2)          AS d2,
       COUNT(*) FILTER (WHERE value = 3)          AS d3,
       COUNT(*) FILTER (WHERE value = 4)          AS d4,
       COUNT(*) FILTER (WHERE value = 5)          AS d5,
       (SELECT value FROM ratings WHERE manga_id = $1 AND client_id = $2) AS mine
     FROM ratings
     WHERE manga_id = $1`,
    [mangaId, clientId || null],
  );

  const row = res.rows[0];
  if (!row) {
    return {
      avg: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      mine: null,
    };
  }

  return {
    avg: parseFloat(String(row.avg ?? 0)),
    count: parseInt(String(row.count), 10),
    distribution: {
      1: parseInt(String(row.d1), 10),
      2: parseInt(String(row.d2), 10),
      3: parseInt(String(row.d3), 10),
      4: parseInt(String(row.d4), 10),
      5: parseInt(String(row.d5), 10),
    },
    mine: row.mine === null || row.mine === undefined ? null : Number(row.mine),
  };
}

export const ratingService = {
  async getStats(mangaId: number, clientId?: string): Promise<RatingStats> {
    await ensureMangaExists(mangaId);
    return fetchStats(mangaId, clientId);
  },

  async upsert(mangaId: number, clientId: string, value: number): Promise<RatingStats> {
    await ensureMangaExists(mangaId);
    await query(
      `INSERT INTO ratings (manga_id, client_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (manga_id, client_id)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [mangaId, clientId, value],
    );
    return fetchStats(mangaId, clientId);
  },

  async remove(mangaId: number, clientId: string): Promise<RatingStats> {
    await ensureMangaExists(mangaId);
    await query('DELETE FROM ratings WHERE manga_id = $1 AND client_id = $2', [mangaId, clientId]);
    return fetchStats(mangaId, clientId);
  },
};
