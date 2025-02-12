#!/bin/bash
if [ $# -eq 0 ]; then
        echo "No image version found"
        echo "Usage: " $0 " {image version}"
        echo "example: " $0 " 1.0"
        exit 1
else
    npm run build:prod
    docker build -t registry.gitlab.com/anawathd/ai-chat-frontend:$1 .
    docker push registry.gitlab.com/anawathd/ai-chat-frontend:$1
fi