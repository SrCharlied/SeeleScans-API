-- Create tables
CREATE TABLE mangas (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  synopsis TEXT,
  cover_url TEXT,
  author TEXT,
  artist TEXT,
  status TEXT NOT NULL CHECK (status IN ('ongoing','completed','hiatus')),
  year SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chapters (
  id BIGSERIAL PRIMARY KEY,
  manga_id BIGINT NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
  number NUMERIC(7,2) NOT NULL,
  title TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (manga_id, number)
);

CREATE TABLE pages (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT NOT NULL,
  UNIQUE (chapter_id, page_number)
);

CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE manga_tags (
  manga_id BIGINT NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (manga_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_chapters_manga_id ON chapters(manga_id);
CREATE INDEX idx_manga_tags_tag_id ON manga_tags(tag_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_manga_updated_at
  BEFORE UPDATE ON mangas
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Seed data
-- Tags
INSERT INTO tags (slug, name) VALUES
  ('accion', 'Accion'),
  ('romance', 'Romance'),
  ('fantasia', 'Fantasia'),
  ('vida-cotidiana', 'Vida cotidiana'),
  ('horror', 'Horror'),
  ('ciencia-ficcion', 'Ciencia ficcion'),
  ('comedia', 'Comedia'),
  ('drama', 'Drama');

-- Mangas
INSERT INTO mangas (slug, title, synopsis, cover_url, author, artist, status, year) VALUES
  ('one-piece', 'One Piece', 'Join Monkey D. Luffy and his pirate crew in their quest to find the ultimate treasure, the One Piece.', 'https://example.com/one-piece-cover.jpg', 'Eiichiro Oda', 'Eiichiro Oda', 'ongoing', 1997),
  ('naruto', 'Naruto', 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village leader.', 'https://example.com/naruto-cover.jpg', 'Masashi Kishimoto', 'Masashi Kishimoto', 'completed', 1999),
  ('attack-on-titan', 'Attack on Titan', ' humanity has been devastated by the Titans, who have chased mankind to the walled cities.', 'https://example.com/aot-cover.jpg', 'Hajime Isayama', 'Hajime Isayama', 'completed', 2009),
  ('my-hero-academia', 'My Hero Academia', 'A boy without a Quirk in a world where they are common must train to become a hero.', 'https://example.com/mha-cover.jpg', 'Kohei Horikoshi', 'Kohei Horikoshi', 'ongoing', 2012),
  ('demon-slayer', 'Demon Slayer', 'A boy becomes a demon slayer to avenge his family and cure his sister.', 'https://example.com/ds-cover.jpg', 'Koyoharu Gotouge', 'Koyoharu Gotouge', 'completed', 2016),
  ('spy-x-family', 'Spy x Family', 'A spy, an assassin, and a telepath form an unlikely family.', 'https://example.com/spy-family-cover.jpg', 'Tatsuya Endo', 'Tatsuya Endo', 'ongoing', 2019);

-- Manga tags
INSERT INTO manga_tags (manga_id, tag_id) VALUES
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), (SELECT id FROM tags WHERE slug = 'accion')),
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), (SELECT id FROM tags WHERE slug = 'fantasia')),
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), (SELECT id FROM tags WHERE slug = 'comedia')),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), (SELECT id FROM tags WHERE slug = 'accion')),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), (SELECT id FROM tags WHERE slug = 'comedia')),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), (SELECT id FROM tags WHERE slug = 'drama')),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), (SELECT id FROM tags WHERE slug = 'accion')),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), (SELECT id FROM tags WHERE slug = 'drama')),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), (SELECT id FROM tags WHERE slug = 'horror')),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), (SELECT id FROM tags WHERE slug = 'accion')),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), (SELECT id FROM tags WHERE slug = 'comedia')),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), (SELECT id FROM tags WHERE slug = 'ciencia-ficcion')),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), (SELECT id FROM tags WHERE slug = 'accion')),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), (SELECT id FROM tags WHERE slug = 'fantasia')),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), (SELECT id FROM tags WHERE slug = 'drama')),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), (SELECT id FROM tags WHERE slug = 'comedia')),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), (SELECT id FROM tags WHERE slug = 'vida-cotidiana')),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), (SELECT id FROM tags WHERE slug = 'accion'));

-- Chapters
INSERT INTO chapters (manga_id, number, title, published_at) VALUES
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), 1.00, 'Romance Dawn', '1997-07-22'),
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), 2.00, 'They Call Him "Straw Hat Luffy"', '1997-08-04'),
  ((SELECT id FROM mangas WHERE slug = 'one-piece'), 3.00, 'Enter the Great Swordsman!', '1997-08-18'),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), 1.00, 'The Boy with the Nine-Tailed Fox', '1999-09-21'),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), 2.00, 'Konohamaru!!', '1999-09-28'),
  ((SELECT id FROM mangas WHERE slug = 'naruto'), 3.00, 'The Worst Client', '1999-10-05'),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), 1.00, 'To You, in 2000 Years...', '2009-09-09'),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), 2.00, 'That Day', '2009-09-16'),
  ((SELECT id FROM mangas WHERE slug = 'attack-on-titan'), 3.00, 'A Dim Light in the Darkness', '2009-09-23'),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), 1.00, 'Izuku Midoriya: Origin', '2012-07-12'),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), 2.00, 'What It Takes to Be a Hero', '2012-07-19'),
  ((SELECT id FROM mangas WHERE slug = 'my-hero-academia'), 3.00, 'Roaring Muscles', '2012-07-26'),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), 1.00, 'Cruelty', '2016-02-15'),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), 2.00, 'The Reason for Becoming a Demon Slayer', '2016-02-22'),
  ((SELECT id FROM mangas WHERE slug = 'demon-slayer'), 3.00, 'The Boar Bares Its Fangs', '2016-03-01'),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), 1.00, 'Mission 1', '2019-03-25'),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), 2.00, 'Mission 2', '2019-04-01'),
  ((SELECT id FROM mangas WHERE slug = 'spy-x-family'), 3.00, 'Mission 3', '2019-04-08');

-- Pages (only for chapter 1 of each manga)
INSERT INTO pages (chapter_id, page_number, image_url) VALUES
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'one-piece') AND number = 1.00), 1, 'https://example.com/one-piece-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'one-piece') AND number = 1.00), 2, 'https://example.com/one-piece-ch1-page2.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'one-piece') AND number = 1.00), 3, 'https://example.com/one-piece-ch1-page3.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'naruto') AND number = 1.00), 1, 'https://example.com/naruto-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'naruto') AND number = 1.00), 2, 'https://example.com/naruto-ch1-page2.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'attack-on-titan') AND number = 1.00), 1, 'https://example.com/aot-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'attack-on-titan') AND number = 1.00), 2, 'https://example.com/aot-ch1-page2.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'attack-on-titan') AND number = 1.00), 3, 'https://example.com/aot-ch1-page3.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'my-hero-academia') AND number = 1.00), 1, 'https://example.com/mha-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'my-hero-academia') AND number = 1.00), 2, 'https://example.com/mha-ch1-page2.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'demon-slayer') AND number = 1.00), 1, 'https://example.com/ds-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'demon-slayer') AND number = 1.00), 2, 'https://example.com/ds-ch1-page2.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'spy-x-family') AND number = 1.00), 1, 'https://example.com/spy-family-ch1-page1.jpg'),
  ((SELECT id FROM chapters WHERE manga_id = (SELECT id FROM mangas WHERE slug = 'spy-x-family') AND number = 1.00), 2, 'https://example.com/spy-family-ch1-page2.jpg');
