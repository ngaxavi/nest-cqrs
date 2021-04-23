## Description

This is an application that demonstrates how to use Nest.js, Event Store and Mongo to create a RESTful API microservice.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# event-store
docker run --name eventstore-node -d -p 2113:2113 -p 1113:1113 eventstore/eventstore:latest --insecure \
  --run-projections=All \
  --enable-external-tcp \
  --enable-atom-pub-over-http

# Mongodb
docker run --name orders-db -d -p 27017:27017 mongo


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
