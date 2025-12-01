# Bun Hello World Recipe App
Simple Bun API with single endpoint that reads from and writes to a PostgreSQL database. Used within [Bun Hello World recipe](https://app.zerops.io/recipes/bun-hello-world) for [Zerops](https://zerops.io) platform.

⬇️ **Full recipe page and deploy with one-click**

![bun](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-bun.svg)

<br />

## Deploy on Zerops
You can either click the deploy button to deploy directly on Zerops, or manually copy the [import yaml](https://github.com/zeropsio/recipe-bun/blob/main/zerops-project-import.yml) to the import dialog in the Zerops app.

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/green/deploy-button.svg)](https://app.zerops.io/recipe/bun)

<br/>

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

> [!TIP]
> One-click deployments use [this repository](https://github.com/zerops-recipe-apps/go-hello-world-app) as the deployment source.
> Feel free to explore further by using this repository as a template, or follow the guide below to integrate a similar setup into Zerops.
> For more advanced examples, check out all of our [Go recipes](https://app.zerops.io/recipes?lf=go).

### 1. Adding `zerops.yaml`
The main application configuration file you place at the root of your repository, it tells Zerops how to build, deploy and run your application.

```yaml
# This example app uses two setups:
# 'prod' for building, deploying, and running the app
# in production or staging environments.
# 'dev' for deploying the source code into a development
# environment with the required toolset.
zerops:
  - setup: prod
    build:
      # The build requires Bun to be installed.
      # Use the lightweight Alpine Linux build container
      # for faster builds and a smaller footprint.
      # You can switch to 'ubuntu' OS for its richer
      # base toolset, more accessible online knowledge,
      # and easier-to-debug environment.
      os: alpine
      base: bun@1.2
      # Build the app by running these commands,
      # with 'bun run build' defined in 'package.json'.
      buildCommands:
        - bun install
        - bun run build
      # Deploy the 'dist' folder containing the built app.
      # 'package.json' is not required but can be helpful,
      # as it allows running commands defined in it.
      deployFiles:
        - dist/
        - package.json
      # Cache 'node_modules' for faster incremental builds.
      cache:
        - node_modules
    run:
      # Run the built app in a lightweight Alpine container
      # with Bun v1.2 installed. Bun is required because
      # JavaScript is an interpreted language that needs
      # an interpreter to execute the code.
      os: alpine
      base: bun@1.2
      # Expose the app's containers on port 3000.
      # Enable 'httpSupport' to allow HTTPS access via
      # custom domains or Zerops subdomain.
      ports:
        - port: 3000
          httpSupport: true
      # Set environment variables. Note that we're referencing
      # the generated database environment variables (such as 'dbName').
      envVariables:
        NODE_ENV: production
        DB_HOST: ${db_hostname}
        DB_NAME: ${db_dbName}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      # Start the app using the command defined in 'package.json'.
      start: bun run start:prod

  - setup: dev
    build:
      base: bun@1.2
      # For the 'dev' setup, deploy all source code
      # to the runtime container, as that is all we care about.
      deployFiles: .
    run:
      # Use Ubuntu for the runtime container, which serves
      # as the development environment, providing a richer
      # base toolset than Alpine.
      os: ubuntu
      # Bun is needed to run and test the app.
      base: bun@1.2
      # Also expose the container on port 3000
      # so the app can be tested externally, typically
      # via the Zerops subdomain.
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        # Set the 'NODE_ENV' environment variable to 'development'.
        # The app needs the same database connection environment
        # variables as the 'prod' setup.
        NODE_ENV: development
        DB_HOST: ${db_hostname}
        DB_NAME: ${db_dbName}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      # No 'start' command is specified, as you'll typically
      # run and test the app manually inside the container.
```

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->

## Recipe features
- Bun app running on a load balanced **Zerops Bun** service
- Zerops **PostgreSQL 16** service as database
- Healthcheck setup example
- Utilization of Zerops' built-in **environment variables** system
- Utilization of Zerops' built-in **log management**

<br/>

## Production vs. development
Base of the recipe is ready for production, the difference comes down to:

- Use highly available version of the PostgreSQL database (change `mode` from `NON_HA` to `HA` in recipe YAML, `db` service section)
- Use at least two containers for the Node.js service to achieve high reliability and resilience (add `minContainers: 2` in recipe YAML, `api` service section)

Further things to think about when running more complex, highly available Bun production apps on Zerops:
- containers are volatile - use Zerops object storage to store your files
- use Zerops Redis (KeyDB) for caching, storing sessions and pub/sub messaging
- use more advanced logging lib, such as [winston](https://github.com/winstonjs/winston)

<br/>
<br/>

Need help setting your project up? Join [Zerops Discord community](https://discord.com/invite/WDvCZ54).
