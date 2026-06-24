#!/bin/bash
echo "Stopping docker container pm-container..."
docker stop pm-container >/dev/null 2>&1
docker rm pm-container >/dev/null 2>&1
echo "Done."
