export type MangaStatus = 'ongoing' | 'completed' | 'hiatus';

export interface Manga {
  id: number;
  slug: string;
  title: string;
  synopsis: string | null;
  cover_url: string | null;
  author: string | null;
  artist: string | null;
  status: MangaStatus;
  year: number | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  manga_id: number;
  number: string;
  title: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Page {
  id: number;
  chapter_id: number;
  page_number: number;
  image_url: string;
}

export interface Tag {
  id: number;
  slug: string;
  name: string;
}

export interface MangaWithTags extends Manga {
  tags: Tag[];
}