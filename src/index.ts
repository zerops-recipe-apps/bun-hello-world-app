import { Client } from "pg";

const dbConfig = {
  host: Bun.env.DB_HOST!,
  port: parseInt(Bun.env.DB_PORT ?? "5432"),
  user: Bun.env.DB_USER!,
  password: Bun.env.DB_PASS!,
  database: Bun.env.DB_NAME!,
};

Bun.serve({
  port: 3000,

  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "GET" && pathname === "/") {
      const client = new Client(dbConfig);
      try {
        await client.connect();
        const result = await client.query(
          "SELECT message FROM greetings LIMIT 1"
        );
        const greeting = result.rows[0]?.message ?? "No greeting found";

        return Response.json({
          type: "bun",
          greeting,
          status: { database: "OK" },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return Response.json(
          {
            type: "bun",
            greeting: null,
            status: { database: `ERROR: ${message}` },
          },
          { status: 503 }
        );
      } finally {
        await client.end().catch(() => {});
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on http://localhost:3000");
