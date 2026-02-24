import { Client } from "pg";

const client = new Client({
  host: Bun.env.DB_HOST!,
  port: parseInt(Bun.env.DB_PORT ?? "5432"),
  user: Bun.env.DB_USER!,
  password: Bun.env.DB_PASS!,
  database: Bun.env.DB_NAME!,
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS greetings (
    id INTEGER PRIMARY KEY,
    message TEXT NOT NULL
  )
`);

await client.query(`
  INSERT INTO greetings (id, message) VALUES (1, 'Hello from Zerops!')
  ON CONFLICT (id) DO NOTHING
`);

console.log("Migration complete");
await client.end();
