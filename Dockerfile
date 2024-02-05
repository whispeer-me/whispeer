FROM node as builder

ARG APP_VERSION=latest
ENV NODE_ENV build

# USER node
WORKDIR /home/node

COPY package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build \
    && npm prune --production \
    && npm install node-pg-migrate # Ensure node-pg-migrate is installed

FROM node

ENV NODE_ENV production

WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/entrypoint.sh ./
COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/src ./
COPY --from=builder --chown=node:node /home/node/migrations ./migrations/

USER node
ENTRYPOINT ["./entrypoint.sh"]
