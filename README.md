## Description

This is an application that demonstrates how to use Nest.js, Event Store and Mongo to create a RESTful API microservice.

## Prerequisite

The following tools must be installed on your computer:

- Node.js 20.11 or newer
- npm 10 or newer
- Docker
- Docker-Compose

The project uses an npm `overrides` entry to force `uuid` to a patched version.
This is required because `@eventstore/db-client` currently depends on the
vulnerable `uuid@8` range, and `npm audit` reports GHSA-w5hq-g745-h8pq without
that override.

## Installation

```bash
$ npm install
```

## Running the app in development

To handle different image of eventstore based on the architecture `arm64` and `x86_64` run the script
`run-dev-env.sh`.

```bash
# start event-store and mongodb
$ chmod +x run-dev-env.sh
$ ./run-dev-sh

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

## Test (Coming soon)

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
