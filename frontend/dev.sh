#!/bin/bash

IMAGE="frontend"

# Build only if the image doesn't exist
if ! sudo docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "Building image..."
    sudo docker build -f Dockerfile.dev -t "$IMAGE" . || exit 1
else
    echo "Using existing image '$IMAGE'"
fi

# Remove old container if it's still around
sudo docker rm -f frontend-dev >/dev/null 2>&1 || true

sudo docker run -d --rm \
    --name frontend-dev \
    -p 5173:5173 \
    "$IMAGE"

until curl -fs http://localhost:5173 >/dev/null 2>&1; do
    sleep 1
done

firefox --new-window http://localhost:5173 &