#!/bin/bash
if [[ $(uname -m) == 'arm64' ]]; then
  image="ghcr.io/eventstore/eventstore:22.10.1-alpha-arm64v8"
else
  image="eventstore/eventstore:22.10.1-buster-slim"
fi

EVENTSTORE_IMAGE=$image docker-compose up -d


