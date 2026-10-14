# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Prisma needs openssl at runtime too
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=base /app/dist              ./dist
COPY --from=base /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma  ./node_modules/@prisma
COPY --from=base /app/prisma            ./prisma

EXPOSE 3001

# Push schema + start (no migration history files needed for dev)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
