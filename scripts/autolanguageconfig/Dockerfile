FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /autolanguageconfig
WORKDIR /autolanguageconfig

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /autolanguageconfig/node_modules /autolanguageconfig/node_modules
COPY --from=build /autolanguageconfig/dist /autolanguageconfig/dist
EXPOSE 6060
CMD [ "pnpm", "start" ]