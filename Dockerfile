#FROM node:20-alpine AS base
#
## Install pnpm
#RUN npm install -g pnpm
#
#FROM base AS deps
#WORKDIR /app
#
## Copy package files and pnpm lock file
#COPY package.json pnpm-lock.yaml ./
#RUN pnpm install --frozen-lockfile
#
#FROM base AS builder
#WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
#COPY . .
#RUN pnpm build
#
#FROM base AS runner
#WORKDIR /app
#
#RUN addgroup -g 1001 -S nodejs && \
#    adduser -S nextjs -u 1001
#
## Copy necessary files
#COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
#COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
#COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
#COPY --from=builder --chown=nextjs:nodejs /app/public ./public
#
## run using the nextjs user, not root
#USER nextjs
#
#EXPOSE 3000
#CMD ["pnpm", "start"]


FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

############################
# Add build-time ARG support
############################
ARG GROQ_API_KEY
ENV GROQ_API_KEY=${GROQ_API_KEY}

FROM base AS deps
WORKDIR /app

# Copy package files and pnpm lock file
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Ensure build-time env is available here also
ARG GROQ_API_KEY
ENV GROQ_API_KEY=${GROQ_API_KEY}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
CMD ["pnpm", "start"]

