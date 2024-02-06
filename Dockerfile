FROM node:18 as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY . .
RUN npm ci
RUN npm run build

# Release stage
FROM oven/bun:1 AS release
USER bun

ENV NODE_ENV=production
# Need for running migrations
COPY --from=builder --chown=bun:bun /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=bun:bun /home/node/.output ./
COPY --from=builder --chown=bun:bun /home/node/entrypoint.sh ./
COPY --from=builder --chown=bun:bun /home/node/bun.lockb ./
COPY --from=builder --chown=bun:bun /home/node/migrations ./migrations/

# run the app
EXPOSE 3000/tcp
ENTRYPOINT ["./entrypoint.sh"]
