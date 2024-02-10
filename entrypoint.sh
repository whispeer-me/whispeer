#!/bin/sh
# Run database migrations
node ./node_modules/db-migrate/bin/db-migrate up

# Start the application
exec npm start
