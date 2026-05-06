# SeeleScans API

Backend de SeeleScans. Stack: **ElysiaJS + Bun + PostgreSQL**.

API REST para un lector de mangas. Expone CRUD sobre `/manga` con paginación, búsqueda y ordenamiento, más endpoints de solo lectura para capítulos, páginas y tags. La especificación OpenAPI 3.0 está escrita a mano en `docs/openapi.yaml` y se sirve junto a una UI Swagger en `/docs`.

## Levantar el stack

```bash
docker compose up --build
```

Esto levanta dos servicios:

- `manga-api` — API en `http://localhost:3000`
- `manga-db` — Postgres 15 en `localhost:5432` (DB `manga_db`, user `postgres`, pass `1234`)

El init script `docker/init.sql` corre solo la primera vez (cuando el volumen `postgres_data` está vacío). Para reinicializar y volver a sembrar:

```bash
docker compose down -v && docker compose up --build
```

## Documentación de la API

- **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **OpenAPI YAML:** [http://localhost:3000/openapi.yaml](http://localhost:3000/openapi.yaml) (también disponible en `docs/openapi.yaml`)

La spec se escribe a mano (no se autogenera). Si modificás endpoints, actualizá `docs/openapi.yaml` en el mismo PR. Para validar la spec sin levantar el stack, pegar el contenido en [editor.swagger.io](https://editor.swagger.io/).

## Endpoints

### Meta

| Método | Path            | Códigos    | Descripción                                       |
| ------ | --------------- | ---------- | ------------------------------------------------- |
| GET    | `/`             | 200        | Nombre y versión de la API                        |
| GET    | `/health`       | 200 / 500  | Healthcheck — verifica conectividad con Postgres  |
| GET    | `/openapi.yaml` | 200        | OpenAPI 3.0 spec (YAML)                           |
| GET    | `/docs`         | 200        | Swagger UI                                        |

### Manga (CRUD)

| Método | Path           | Códigos              | Descripción                                |
| ------ | -------------- | -------------------- | ------------------------------------------ |
| GET    | `/manga`       | 200 / 400            | Listado paginado con búsqueda y orden      |
| GET    | `/manga/:id`   | 200 / 400 / 404      | Detalle de un manga (incluye sus tags)     |
| POST   | `/manga`       | 201 / 400            | Crear manga                                |
| PUT    | `/manga/:id`   | 200 / 400 / 404      | Update parcial (al menos un campo)         |
| DELETE | `/manga/:id`   | 204 / 404            | Borrar manga (cascade a chapters/pages)    |

### Chapter / Page / Tag (read-only)

| Método | Path                       | Códigos       | Descripción                          |
| ------ | -------------------------- | ------------- | ------------------------------------ |
| GET    | `/manga/:id/chapters`      | 200 / 400     | Capítulos de un manga (orden por nº) |
| GET    | `/chapters/:id`            | 200 / 400 / 404 | Detalle de un capítulo             |
| GET    | `/chapters/:id/pages`      | 200 / 400     | Páginas de un capítulo               |
| GET    | `/tags`                    | 200           | Listado de todos los tags            |

### Uploads

| Método | Path                              | Códigos        | Descripción                                                  |
| ------ | --------------------------------- | -------------- | ------------------------------------------------------------ |
| POST   | `/upload/cover`                   | 201 / 400      | Subir imagen de portada (`multipart/form-data`, campo `file`) |
| GET    | `/uploads/covers/:filename`       | 200 / 400 / 404 | Servir una portada previamente subida                       |

**Reglas de upload:**
- Tipos aceptados: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: **1 MiB** (1 048 576 bytes)
- Se guardan en `uploads/covers/<uuid>.<ext>` (volume montado en docker, persiste entre rebuilds)
- Respuesta 201: `{ url: "http://localhost:3000/uploads/covers/<uuid>.<ext>", filename: "<uuid>.<ext>" }`

**Ejemplo:**
```bash
curl -X POST -F "file=@cover.jpg" http://localhost:3000/upload/cover
# → { "url": "http://localhost:3000/uploads/covers/abc-123.jpg", "filename": "abc-123.jpg" }
```

Después usás esa URL en el `cover_url` de un POST/PUT a `/manga`.

### Query params de `GET /manga`

| Param   | Tipo    | Default       | Validación                                              |
| ------- | ------- | ------------- | ------------------------------------------------------- |
| `page`  | int     | `1`           | ≥ 1                                                     |
| `limit` | int     | `10`          | 1–100                                                   |
| `q`     | string  | —             | Búsqueda case-insensitive contra `mangas.title`         |
| `sort`  | enum    | `created_at`  | `title` \| `year` \| `created_at` \| `updated_at`       |
| `order` | enum    | `desc`        | `asc` \| `desc`                                         |

Ejemplo combinado:

```
GET /manga?page=1&limit=10&q=berserk&sort=title&order=asc
```

Respuesta:

```json
{
  "data": [ /* Manga[] */ ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### Body de `POST /manga`

```json
{
  "slug": "berserk",
  "title": "Berserk",
  "synopsis": "...",
  "cover_url": "https://...",
  "author": "Kentaro Miura",
  "artist": "Kentaro Miura",
  "status": "hiatus",
  "year": 1989,
  "tags": ["accion", "fantasia"]
}
```

Requeridos: `slug` (regex `^[a-z0-9-]+$`), `title`, `status` (`ongoing` \| `completed` \| `hiatus`). Opcionales: el resto. `tags` es un array de slugs existentes en la tabla `tags`.

### Body de `PUT /manga/:id`

Mismos campos que `POST` pero todos opcionales. Debe enviarse al menos uno. Si se manda `tags`, reemplaza el set entero (no es merge).

### Forma de errores

Todas las respuestas de error usan el mismo shape:

```json
{ "error": "title: Required" }
```

| Código | Cuándo                                                          |
| ------ | --------------------------------------------------------------- |
| 400    | Validación zod falla (body, query o path inválidos)             |
| 404    | Recurso no existe (`/manga/:id`, `/chapters/:id`)               |
| 500    | Error inesperado (DB caída, bug)                                |

## Estructura del código

```
SeeleScans-API/
├── docs/
│   └── openapi.yaml            ← spec OpenAPI 3.0 manual
├── docker/
│   └── init.sql                ← schema + seed inicial (5 tablas)
├── uploads/                    ← volume montado; covers subidas
│   └── covers/<uuid>.<ext>
├── src/
│   ├── index.ts                ← entry point + onError global
│   ├── config/
│   │   ├── db.ts               ← pool de pg + helper query<T>()
│   │   └── storage.ts          ← paths, mime types y límites para uploads
│   ├── middlewares/cors.ts     ← CORS manual (preflight + headers)
│   ├── routes/                 ← endpoints (manga, chapter, tag, upload, static, docs)
│   ├── controllers/            ← validan input → invocan service
│   ├── services/               ← queries SQL + I/O de archivos (transacciones reales)
│   ├── models/                 ← tipos TS espejo del schema
│   ├── validation/             ← schemas zod
│   └── utils/
│       ├── errors.ts           ← AppError + helpers (badRequest, notFound)
│       └── validate.ts         ← wrappers zod → AppError 400
├── docker-compose.yml
├── Dockerfile
└── package.json
```

Capas: **route → controller → service → db**. El controller valida con zod y convierte resultados; el service contiene SQL y transacciones; el `onError` global en `index.ts` mapea cualquier `AppError` lanzado en cualquier capa al status code y body correspondientes.

## Modelos

Los modelos en `src/models/manga.model.ts` reflejan el schema de `docker/init.sql`:

| Tabla        | Tipo TS         | Notas                                          |
| ------------ | --------------- | ---------------------------------------------- |
| `mangas`     | `Manga`         | `+ MangaWithTags` cuando incluye tags          |
| `chapters`   | `Chapter`       | `number` es `string` (NUMERIC sin perder precisión) |
| `pages`      | `Page`          |                                                |
| `tags`       | `Tag`           |                                                |
| `manga_tags` | (junction M:N)  | Sin tipo propio; modelado como `Manga.tags[]`  |

Hay un trigger `set_manga_updated_at` que actualiza `mangas.updated_at` automáticamente en cada UPDATE.

## Validación

Validación con **zod** en `src/validation/manga.schema.ts`. Schemas:

- `MangaCreateSchema` — body de POST
- `MangaUpdateSchema` — body de PUT (refine: al menos un campo)
- `MangaListQuerySchema` — query params de GET `/manga` (con coerciones de string a number)
- `IdParamSchema` — `:id` numérico positivo

Los wrappers en `src/utils/validate.ts` (`validateBody`, `validateQuery`, `validateParams`) parsean con zod y, en error, lanzan `badRequest()` que el handler global mapea a 400 con `{ "error": "<path>: <mensaje>" }`.

## CORS

**CORS** (Cross-Origin Resource Sharing) es el mecanismo que permite a un navegador hacer peticiones entre orígenes distintos. Configuramos el servidor para responder con `Access-Control-Allow-Origin: *` y manejar el preflight `OPTIONS` con `204`, habilitando que el cliente vanilla (servido por Caddy en otro puerto) consuma esta API durante desarrollo.

Implementación manual en `src/middlewares/cors.ts` con `onRequest` (corre antes del router para que las preflight a rutas no registradas también respondan correctamente).

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable      | Default       | Notas                                                        |
| ------------- | ------------- | ------------------------------------------------------------ |
| `PORT`        | `3000`        |                                                              |
| `DB_HOST`     | `db`          | `db` dentro de docker compose; `localhost` si corrés fuera   |
| `DB_PORT`     | `5432`        |                                                              |
| `DB_USER`     | `postgres`    |                                                              |
| `DB_PASSWORD` | `1234`        | Solo desarrollo                                              |
| `DB_NAME`     | `manga_db`    |                                                              |
| `JWT_SECRET`  | `change_me`   | Reservado para fase futura; no se usa todavía                |

## Desarrollo

```bash
# Typecheck
bunx tsc --noEmit

# Logs en vivo
docker compose logs -f api

# Conectarse a la DB
docker exec -it manga-db psql -U postgres -d manga_db

# Reset completo (borra el volumen, re-corre init.sql)
docker compose down -v && docker compose up --build
```

## Smoke tests

```bash
# Listado paginado
curl "http://localhost:3000/manga?page=1&limit=2"

# Búsqueda
curl "http://localhost:3000/manga?q=naruto"

# Sort
curl "http://localhost:3000/manga?sort=title&order=asc"

# Detalle
curl http://localhost:3000/manga/1

# Crear
curl -X POST -H "Content-Type: application/json" \
  -d '{"slug":"berserk","title":"Berserk","status":"hiatus"}' \
  http://localhost:3000/manga

# Update parcial
curl -X PUT -H "Content-Type: application/json" \
  -d '{"title":"One Piece (updated)"}' \
  http://localhost:3000/manga/1

# Delete
curl -X DELETE http://localhost:3000/manga/9

# Healthcheck
curl http://localhost:3000/health
```
