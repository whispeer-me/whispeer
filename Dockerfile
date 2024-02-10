FROM node:18-alpine as builder

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build

FROM node:18-alpine as prod

USER node

WORKDIR /app

COPY --from=builder --chown=node:node /app/.output /app/.output

# Needed for db migration `node-pg-migrate`
COPY --from=builder --chown=node:node /app/node_modules /app/node_modules

# Need migrations folder
COPY --from=builder --chown=node:node /app/migrations /app/migrations

# Need entrypoint
COPY --from=builder --chown=node:node /app/entrypoint.sh /app/entrypoint.sh

ENV PORT=$PORT
EXPOSE $PORT

ENV NODE_ENV=production

ENTRYPOINT ["./entrypoint.sh"]
