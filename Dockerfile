# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output using the same layout as the local production starter
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy production startup and runtime validation scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start-production.js ./scripts/start-production.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/load-env.js ./scripts/load-env.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/validate-runtime-env.js ./scripts/validate-runtime-env.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/apply-runtime-base-path.js ./scripts/apply-runtime-base-path.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/runtime-base-path.js ./scripts/runtime-base-path.js

# Copy public directory
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy content directory (default seed data; overridden by volume mount at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "./scripts/start-production.js"]
