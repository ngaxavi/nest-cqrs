#!/bin/bash
if [[ $(uname -m) == 'arm64' ]]; then
  image="ghcr.io/eventstore/eventstore:23.10.0-alpha-arm64v8"
else
  image="eventstore/eventstore:23.10.0-jammy"
fi

EVENTSTORE_IMAGE=$image docker-compose down -v
