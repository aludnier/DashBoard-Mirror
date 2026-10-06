# Build context is the repo root (see docker-compose.yml): with npm workspaces
# the only package-lock.json lives there, and npm ci needs it.

# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm ci --workspace frontend
COPY frontend/ ./frontend/
RUN npm run build --workspace frontend

# Serve stage
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
