#!/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)

. ${SCRIPT_DIR}/.env

sudo -u pi /usr/bin/node /usr/bin/forever start -a -d /home/pi/src/dictateServer/server.js

