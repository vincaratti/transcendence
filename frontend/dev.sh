#!/bin/bash

IMAGE="frontend"
sudo docker rm -f frontend-dev
sudo docker image rm frontend
sudo docker build -f Dockerfile.dev -t "$IMAGE" . || exit 1

sudo docker rm -f frontend-dev >/dev/null 2>&1 || true

sudo docker run -d --rm \
    --name frontend-dev \
    -p 5173:5173 \
    "$IMAGE"

until curl -fs http://localhost:5173 >/dev/null 2>&1; do
    sleep 1
done

firefox --new-window http://localhost:5173 &