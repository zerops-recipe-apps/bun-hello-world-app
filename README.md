# Bun Hello World Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
A minimal [Bun](https://bun.sh) application with a [PostgreSQL](https://www.postgresql.org/) connection, demonstrating idempotent database migrations and a health check endpoint at `/`.
Used within [Bun Hello World recipe](https://app.zerops.io/recipes/bun-hello-world) for [Zerops](https://zerops.io) platform.
<!-- #ZEROPS_EXTRACT_END:intro# -->

⬇️ **Full recipe page and deploy with one-click**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/bun-hello-world?environment=small-production)

![bun cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-bun.svg)

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yaml`
The main application configuration file you place at the root of your repository, it tells Zerops how to build, deploy and run your application.

```yaml
zerops:
  # Production setup — bundle TypeScript into standalone files, deploy minimal artifacts.
  # bun build --target bun inlines all dependencies: no node_modules at runtime.
  - setup: prod
    build:
      base: bun@1.2
      envVariables:
        # Redirect bun's install cache into the project tree so Zerops can cache it
        # between builds. Default ~/.bun is outside the project and cannot be cached.
        BUN_INSTALL: ./.bun
      buildCommands:
        # --frozen-lockfile: fail if bun.lock would change — reproducible builds
        - bun install --frozen-lockfile
        # Bundle app and migration into standalone files; all pg imports are inlined
        - bun build src/index.ts --outfile dist/index.js --target bun
        - bun build migrate.ts --outfile dist/migrate.js --target bun
      deployFiles:
        # Only bundled artifacts — no node_modules, no source. 156 KB total.
        - dist
      cache:
        - node_modules
        - .bun/install/cache  # Matches BUN_INSTALL path above

    # Readiness check: Zerops verifies each new runtime container responds before the
    # project balancer routes traffic to it — prevents deploying a broken build.
    deploy:
      readinessCheck:
        httpGet:
          port: 3000
          path: /

    run:
      base: bun@1.2
      # initCommands run on every container start, before the start command.
      # zsc execOnce runs migration exactly once per version across all containers —
      # prevents race conditions when scaling to multiple containers.
      # In initCommands (not buildCommands) so migration and code deploy atomically.
      initCommands:
        - zsc execOnce ${appVersionId} -- bun dist/migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: production
        DB_NAME: db
        # Zerops generates connection variables per service using {hostname}_{key} pattern
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      start: bun dist/index.js
      healthCheck:
        httpGet:
          port: 3000
          path: /

  # Development setup — deploy full source so developers can work via SSH immediately.
  # Bun is pre-installed; run 'bun --hot src/index.ts' to start with hot reload.
  - setup: dev
    build:
      base: bun@1.2
      envVariables:
        BUN_INSTALL: ./.bun
      buildCommands:
        # Install all dependencies including devDependencies — no compilation.
        # Developer runs the app themselves via SSH.
        - bun install
      deployFiles:
        # Deploy entire working directory: source, node_modules, and bun's package cache
        - ./
      cache:
        - node_modules
        - .bun/install/cache

    run:
      base: bun@1.2
      initCommands:
        # Migration runs at deploy time — DB is ready when developer SSHs in
        - zsc execOnce ${appVersionId} -- bun migrate.ts
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: development
        DB_NAME: db
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
        # Lets developer use 'bun add' via SSH — reuses the cached packages shipped in ./
        BUN_INSTALL: /var/www/.bun
      # Zerops starts nothing — developer drives via SSH: 'bun --hot src/index.ts'
      start: zsc noop --silent
```
<!-- #ZEROPS_EXTRACT_END:integration-guide# -->

<!-- #ZEROPS_EXTRACT_START:knowledge-base# -->
### Base Image

Includes: Bun, `npm`, `yarn`, `git`, `bunx`.
NOT included: `pnpm`.

### Gotchas

- **`BUN_INSTALL: ./.bun` for build caching** — Zerops can only cache paths inside the project tree. Default `~/.bun` is outside it and gets lost between builds.
- **Use `bunx` instead of `npx`** — `npx` may not resolve correctly in the Bun runtime.
- **`bun build --target bun` only works with pure-JS dependencies** — The prod setup bundles with `bun build` which inlines all imports. This works for pure-JS packages (e.g. `pg`) but silently produces broken bundles for native addons (`mysql2`, `bcrypt`, `sharp`, `canvas`, etc.). The build exits 0 but the bundle fails at runtime or is empty. If your app uses native dependencies, skip bundling: use `deployFiles: [./]` and `start: bun src/index.ts` for both dev and prod setups.
<!-- #ZEROPS_EXTRACT_END:knowledge-base# -->
