#!/bin/bash

LOGFILE="test.log"


sudo docker build --no-cache -f Dockerfile.test -t frontend-test  | tee "$LOGFILE"
sudo docker run --rm frontend-test | tee -a "$LOGFILE"
