@echo off
echo Stopping docker container pm-container...
docker stop pm-container >nul 2>&1
docker rm pm-container >nul 2>&1
echo Done.
