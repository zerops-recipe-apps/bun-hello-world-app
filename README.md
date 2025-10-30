<!-- #ZEROPS_REMOVE_START# -->
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
<!-- #ZEROPS_REMOVE_END# -->

> [!TIP]
> One-click deployments use [this repository](https://github.com/zerops-recipe-apps/go-hello-world-app) as the deployment source.
> Feel free to explore further by using this repository as a template, or follow the guide below to integrate a similar setup into Zerops.
> For more advanced examples, check out all of our [Go recipes](https://app.zerops.io/recipes?lf=go).

### 1. Adding `zerops.yaml`
The main application configuration file you place at the root of your repository, it tells Zerops how to build, deploy and run your application.

```yaml
COPY
```

<!-- #ZEROPS_REMOVE_START# -->
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

Futher things to think about when running more complex, highly available Bun production apps on Zerops:
- containers are volatile - use Zerops object storage to store your files
- use Zerops Redis (KeyDB) for caching, storing sessions and pub/sub messaging
- use more advanced logging lib, such as [winston](https://github.com/winstonjs/winston)

<br/>
<br/>

Need help setting your project up? Join [Zerops Discord community](https://discord.com/invite/WDvCZ54).
<!-- #ZEROPS_REMOVE_END# -->
