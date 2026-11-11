## Description

This is an application that demonstrates how to use Nest.js, Event Store and Mongo to create a RESTful API microservice.

## Prerequisite

The following tools must be installed on your computer:

- Node.js 20.19 or newer
- npm 10 or newer
- Docker
- Docker-Compose

The project uses an npm `overrides` entry to force `uuid` to a patched version.
This is required because `@eventstore/db-client` currently depends on the
vulnerable `uuid@8` range, and `npm audit` reports GHSA-w5hq-g745-h8pq without
that override.

## Installation

Use the committed lockfile for reproducible development and CI installs:

```bash
$ npm ci
```

## Running the app in development

To handle different image of eventstore based on the architecture `arm64` and `x86_64` run the script
`run-dev-env.sh`.

```bash
# start event-store and mongodb
$ chmod +x run-dev-env.sh
$ ./run-dev-env.sh

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Clean up Environment

```bash
$ chmod +x cleanup-dev-env.sh
$ ./cleanup-dev-env.sh
```

## Production security configuration

Production startup fails closed unless all of the following variables are set:

```bash
API_KEY=<long-random-service-key>
CORS_ORIGINS=https://allowed-client.example
EVENT_STORE_URI=esdb://eventstore.example:2113?tls=true
EVENT_STORE_CREDENTIALS_USERNAME=<least-privileged-service-user>
EVENT_STORE_CREDENTIALS_PASSWORD=<secret>
```

All HTTP requests to `/api/orders` must supply the configured key in `x-api-key`.
This is a **service-level perimeter**, not per-user or per-tenant authorization.
Before exposing this service to multiple users or tenants, add an identity provider,
order ownership data, and authorization checks for every read and mutation.

Development Compose ports are intentionally bound to `127.0.0.1`; do not treat its
insecure EventStore settings as production-safe configuration.

## Release and image publishing

Merges to `main` run semantic-release. The release workflow uses the `xnrobot`
service-account identity supplied through GitHub Actions secrets; credentials and
identity values are never stored in the repository.

A published GitHub release triggers the production image workflow, which logs in to
GHCR and builds `ghcr.io/ngaxavi/order-service` with the `prod` Skaffold profile.
The repository requires pull requests for changes to `main`, so release automation
creates releases and tags but does not commit generated changelog files back to the
protected branch.

Required GitHub Actions secrets:

- `GH_TOKEN`: an `xnrobot` token permitted to create repository releases and tags.
- `GIT_USERNAME` and `GIT_EMAIL`: the `xnrobot` Git author identity used by
  semantic-release.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

[MIT licensed](LICENSE).
