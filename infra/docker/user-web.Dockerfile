FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/user-web/package.json ./apps/user-web/
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
COPY apps/user-web ./apps/user-web
COPY tsconfig.base.json ./
RUN pnpm --filter @kolos/shared-types build
RUN pnpm --filter @kolos/http-client build
RUN pnpm --filter @kolos/user-web build

FROM nginx:alpine AS runner
COPY --from=build /app/apps/user-web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
