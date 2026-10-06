# Build stage
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace backend

COPY backend/ ./backend/
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace backend --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts

WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "dist/main.js"]
