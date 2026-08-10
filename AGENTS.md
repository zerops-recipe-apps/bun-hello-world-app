# bun-hello-world-app

Minimal Bun + TypeScript app with PostgreSQL, idempotent migrations, and a health-check endpoint at `/` — baseline Bun recipe on Zerops.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `bun@1.2`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `bun --hot src/index.ts`
- In-container rebuild without deploy: `bun build src/index.ts --outfile dist/index.js --target bun`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- `bun build --target bun` only works with pure-JS deps; native addons (mysql2, bcrypt, sharp) produce broken bundles silently — for those, switch prod to `deployFiles: [./]` + `start: bun src/index.ts`.
- `BUN_INSTALL: ./.bun` redirects Bun's install cache into the project tree so Zerops can cache it between builds.
- Migration runs via `zsc execOnce ${appVersionId}` in `initCommands`, so only one container per deploy version executes it.
