FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable
COPY . /autoscan
WORKDIR /autoscan
RUN apt-get update -y && apt-get install -y openssl && apt-get clean

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile \
    && pnpm run build

FROM base
COPY --from=prod-deps /autoscan/node_modules /autoscan/node_modules
COPY --from=build /autoscan/build /autoscan

EXPOSE 6060
CMD [ "pnpm", "start" ]