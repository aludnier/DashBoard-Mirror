# Build context is the repo root (see docker-compose.yml): with npm workspaces
# the only package-lock.json lives there, and npm ci needs it.

# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/
RUN npm ci --workspace client
COPY client/ ./client/
RUN npm run build --workspace client

# Serve stage
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
