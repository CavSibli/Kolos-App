# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS deps
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/user-web/package.json ./apps/user-web/
RUN pnpm install --frozen-lockfile

FROM deps AS build
# Même origine en prod (Caddy proxy /v1 → api) : cookies JWT OK
ARG VITE_API_BASE_URL=/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY apps/user-web ./apps/user-web
COPY tsconfig.base.json ./
RUN pnpm --filter @kolos/shared-types build \
  && pnpm --filter @kolos/http-client build \
  && pnpm --filter @kolos/user-web build

FROM nginx:1.27-alpine AS runner
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/user-web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
