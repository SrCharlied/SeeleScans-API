import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'manga_db',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('error', (err: Error) => {
  console.error('[db] idle client error:', err);
});

export interface QueryFunction {
  <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export const query: QueryFunction = async <T extends QueryResultRow>(
  text: string,
  params?: unknown[]
) => {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
};

export { pool };
