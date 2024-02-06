#!/bin/sh

# Run database migrations
# `bun run migrate` is not working for some reason
bun ./node_modules/node-pg-migrate/bin/node-pg-migrate up

# Run the server
bun ./server/index.mjs
