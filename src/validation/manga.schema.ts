import { z } from 'zod';

export const MangaCreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  synopsis: z.string().optional(),
  cover_url: z.string().url().optional(),
  author: z.string().optional(),
  artist: z.string().optional(),
  status: z.enum(['ongoing', 'completed', 'hiatus']),
  year: z.number().int().min(1900).max(2100).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const MangaUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  synopsis: z.string().optional(),
  cover_url: z.string().url().optional(),
  author: z.string().optional(),
  artist: z.string().optional(),
  status: z.enum(['ongoing', 'completed', 'hiatus']).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  tags: z.array(z.string().min(1)).optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});

export const MangaListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  sort: z.enum(['title', 'year', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});