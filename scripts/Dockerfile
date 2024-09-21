FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /scripts
WORKDIR /scripts

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile \
    && pnpm run build

FROM base
COPY --from=prod-deps /scripts/node_modules /scripts/node_modules
COPY --from=build /scripts/dist /scripts/dist

EXPOSE 6060
CMD [ "pnpm", "start" ]