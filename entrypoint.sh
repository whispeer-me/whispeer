#!/bin/sh
# Stop on any error: never start the app if the migrations failed.
set -e

# Run database migrations
node ./node_modules/node-pg-migrate/bin/node-pg-migrate up

# Start the application (exec: node replaces the shell and receives signals)
exec node .output/server/index.mjs
