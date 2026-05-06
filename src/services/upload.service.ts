import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import {
  ALLOWED_IMAGE_MIMES,
  COVER_DIR,
  MAX_COVER_SIZE,
  MIME_TO_EXT,
  PUBLIC_BASE_URL,
  type AllowedImageMime,
} from '../config/storage';
import { badRequest } from '../utils/errors';

function isAllowedMime(value: string): value is AllowedImageMime {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(value);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export const uploadService = {
  async saveCover(file: File): Promise<{ url: string; filename: string }> {
    if (!file || typeof file === 'string') {
      throw badRequest('File field "file" is required.');
    }
    if (!file.type || !isAllowedMime(file.type)) {
      throw badRequest(
        `Invalid file type "${file.type || 'unknown'}". Allowed: jpeg, png, webp.`,
      );
    }
    if (file.size > MAX_COVER_SIZE) {
      throw badRequest(
        `File too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_COVER_SIZE)}.`,
      );
    }

    const ext = MIME_TO_EXT[file.type];
    const filename = `${randomUUID()}${ext}`;

    await mkdir(COVER_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(COVER_DIR, filename), buffer);

    const url = `${PUBLIC_BASE_URL}/uploads/covers/${filename}`;
    return { url, filename };
  },
};
