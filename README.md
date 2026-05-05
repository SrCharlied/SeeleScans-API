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

## Estructura

```
src/
├── index.ts                ← entry point Elysia
├── config/db.ts            ← pool de pg
├── middlewares/cors.ts     ← CORS manual
├── routes/                 ← definición de rutas
├── controllers/            ← handlers
├── services/               ← lógica de negocio
└── models/                 ← tipos
```

## CORS

CORS (Cross-Origin Resource Sharing) es el mecanismo que permite a un navegador hacer peticiones entre orígenes distintos. Configuramos el servidor para responder con `Access-Control-Allow-Origin: *` y manejar el preflight `OPTIONS` con `204`, habilitando que el cliente vanilla (servido por Caddy en otro puerto) consuma esta API durante desarrollo. Implementación manual en `src/middlewares/cors.ts`.

## Variables de entorno

Ver `.env.example`. Para correr fuera de Docker, ajustar `DB_HOST=localhost`.
