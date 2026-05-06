# SeeleScans API

Backend de SeeleScans. Stack: ElysiaJS + Bun + PostgreSQL.

## Levantar el stack

```bash
docker compose up --build
```

Esto levanta dos servicios:

- `manga-api` — API en `http://localhost:3000`
- `manga-db` — Postgres 15 en `localhost:5432` (DB `manga_db`, user `postgres`, pass `1234`)

El init script `docker/init.sql` corre solo la primera vez (cuando el volumen `postgres_data` está vacío). Para reinicializar: `docker compose down -v && docker compose up --build`.

## Endpoints

| Método | Path      | Descripción                                                  |
| ------ | --------- | ------------------------------------------------------------ |
| GET    | `/`       | Metadata de la API (`name`, `version`)                       |
| GET    | `/health` | Healthcheck — `200 { ok: true, db: "up" }` o `500` si DB cae |
| GET    | `/manga`  | List mangas con paginación y búsqueda                        |
| GET    | `/manga/:id` | Obtener un manga específico                                 |
| POST   | `/manga`  | Crear un nuevo manga                                          |
| PUT    | `/manga/:id` | Actualizar un manga existente                              |
| DELETE | `/maga/:id` | Borrar un manga                                            |
| GET    | `/chapters/:id` | Obtener un capítulo específico                           |
| GET    | `/chapters/:id/pages` | Listar páginas de un capítulo                 |
| GET    | `/tags`   | Listar todos los tags                                        |

## Estructura

```
src/
├── index.ts                ← entry point Elysia
├── config/db.ts            ← pool de pg
├── middlewares/cors.ts     ← CORS manual
├── routes/                 ← definición de rutas
├── controllers/              ← handlers
├── services/               ← lógica de negocio
├── models/                 ← tipos
├── validation/              ← esquemas de validación
└── utils/                 ← funciones auxiliares
```

## Modelos

Los modelos reflejan el schema de la base de datos definido en `docker/init.sql`, que incluye las tablas:

- mangas
- chapters
- pages
- tags
- manga_tags

## Validación

La API usa Zod para validar los datos de entrada. Los esquemas de validación están definidos en `src/validation/manga.schema.ts`.

## CORS

CORS (Cross-Origin Resource Sharing) es el mecanismo que permite a un navegador hacer peticiones entre orígenes distintos. Configuramos el servidor para responder con `Access-Control-Allow-Origin: *` y manejar el preflight `OPTIONS` con `204`, habilitando que el cliente vanilla (servido por Caddy en otro puerto) consuma esta API durante desarrollo. Implementación manual en `src/middlewares/cors.ts`.

## Variables de entorno

Ver `.env.example`. Para correr fuera de Docker, ajustar `DB_HOST=localhost`.

## Documentación de la API

La documentación de la API está disponible en `/docs` y la especificación OpenAPI en `/openapi.yaml`.