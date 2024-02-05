FROM node:18 as builder

ARG APP_VERSION=latest
ENV NODE_ENV build

# USER node
WORKDIR /home/node

COPY . .
RUN npm ci
RUN npm run build

# Release stage
FROM oven/bun:1 AS release

ENV NODE_ENV=production
# Need for running migrations
COPY --from=builder /home/node/node_modules/ ./node_modules/
COPY --from=builder /home/node/.output ./
COPY --from=builder /home/node/entrypoint.sh ./
COPY --from=builder /home/node/bun.lockb ./
COPY --from=builder /home/node/migrations ./migrations/

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["./entrypoint.sh"]
