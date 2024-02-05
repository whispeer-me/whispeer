#!/bin/sh

# Run database migrations
bun run migrate

# Start the application, assuming the build output is correctly pointed by the Dockerfile ENTRYPOINT
# This might be redundant if the ENTRYPOINT in Dockerfile directly starts the app
exec bun run start
