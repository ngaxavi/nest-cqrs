## Description

This is an application that demonstrates how to use Nest.js, Event Store and Mongo to create a RESTful API microservice.

## Prerequisite
The following tools must be installed on your computer:
* Docker
* Docker-Compose

## Installation

```bash
$ npm install
```

## Running the app in development

```bash
# start  event-store and mongodb
docker-compose up -d

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

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
