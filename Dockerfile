# CREATE A BASE IMAGE

FROM oven/bun as base

WORKDIR /app


# CREATE A IMAGE TO DOWNLOAD DEPENDENCIES

FROM base AS dependencies

COPY package.json bun.lockb .
RUN bun install --frozen-lockfile --production


# CREATE THE FINAL RELEASE IMAGE

FROM base AS release

COPY --from=dependencies /app/node_modules node_modules
COPY package.json server.js ./
COPY src/ ./src
RUN mkdir database

ENTRYPOINT [ "bun", "run", "start" ]
