import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

Bun.serve({
  port: 3000,

  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method !== 'GET' || pathname !== '/') {
      return new Response('Not Found', { status: 404 });
    }

    let client;
    try {
      client = await pool.connect();
      const { rows } = await client.query<{ message: string }>(
        'SELECT message FROM greetings LIMIT 1'
      );
      return Response.json({
        type: 'bun',
        greeting: rows[0].message,
        status: { database: 'OK' },
      });
    } catch (err) {
      return Response.json(
        {
          type: 'bun',
          greeting: null,
          status: { database: `ERROR: ${(err as Error).message}` },
        },
        { status: 503 }
      );
    } finally {
      client?.release();
    }
  },
});

console.log('Server running on port 3000');
