#!/bin/bash
if [[ $(uname -m) == 'arm64' ]]; then
  image="ghcr.io/eventstore/eventstore:21.10.5-alpha-arm64v8"
else
  image="eventstore/eventstore:21.10.5-buster-slim"
fi

EVENTSTORE_IMAGE=$image docker-compose down -v