#!/usr/bin/env sh

docker build . -t battleship 
docker run --rm -p 8080:3000 -d battleship
