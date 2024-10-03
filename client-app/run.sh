#!/bin/sh

CONTAINER_ALREADY_STARTED="_started"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    npx prisma migrate deploy
    npx prisma db seed
else
    echo "-- Not first container startup --"
fi

pnpm start