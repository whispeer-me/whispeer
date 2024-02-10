FROM node:18-alpine as builder

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build

FROM node:18-alpine as prod

WORKDIR /app

COPY --from=builder /app/.output /app/.output

# Needed for scritp commands
COPY --from=builder /app/package.json /app/


# Needed for db migration `node-pg-migrate`
COPY --from=builder /app/node_modules /app/node_modules

# Need migrations folder
COPY --from=builder /app/migrations /app/migrations

# Need entrypoint
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh

ENV PORT=$PORT
EXPOSE $PORT

ENV NODE_ENV=production

ENTRYPOINT ["./entrypoint.sh"]

# # syntax = docker/dockerfile:1

# FROM node:18.19.0 as base

# ARG PORT=3000

# ENV NODE_ENV=production

# WORKDIR /src

# FROM base as builder

# COPY package.json package-lock.json ./
# RUN npm install --production=false

# COPY . .

# RUN npm run build
# # RUN npm prune

# RUN ls -la

# # Run
# FROM base

# ENV PORT=$PORT

# COPY --from=builder /src/.output /src/
# COPY --from=builder /src/node_modules /src/node_modules
# COPY --from=builder /src/entrypoint.sh /src/entrypoint.sh
# COPY --from=builder /src/package.json /src/package.json
# COPY --from=builder /src/migrations /src/migrations

# EXPOSE $PORT

# ENTRYPOINT ["./entrypoint.sh"]
