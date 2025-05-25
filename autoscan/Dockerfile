FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable
COPY . /autoscan
WORKDIR /autoscan

ARG FFMPEG_STATIC_URL=https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl xz-utils ca-certificates; \
    curl -fsSL "$FFMPEG_STATIC_URL" -o /tmp/ffmpeg.tar.xz; \
    tar -C /tmp -xJf /tmp/ffmpeg.tar.xz; \
    mv /tmp/ffmpeg-*/ffmpeg /tmp/ffmpeg-*/ffprobe /usr/local/bin/; \
    chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe; \
    rm -rf /tmp/ffmpeg*; \
    apt-get purge -y --auto-remove curl xz-utils; \
    rm -rf /var/lib/apt/lists/*

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