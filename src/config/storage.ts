import { resolve } from 'node:path';

const PORT = process.env.PORT ?? '3000';

export const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;

export const UPLOADS_DIR = resolve(process.cwd(), 'uploads');
export const COVER_DIR = resolve(UPLOADS_DIR, 'covers');

export const MAX_COVER_SIZE = 1 * 1024 * 1024;

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

export const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
