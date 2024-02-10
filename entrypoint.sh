#!/bin/sh
# Run database migrations
node ./node_modules/node-pg-migrate/bin/node-pg-migrate up

# Start the application
node .output/server/index.mjs
