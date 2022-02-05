FROM node:16 as builder
WORKDIR /build
COPY package.json tsconfig.json ./
RUN npm i
COPY . .
RUN npm run build && rm -r src/

FROM node:16-alpine
RUN apk update && apk upgrade && apk add libcurl
USER node
WORKDIR /bot
COPY --from=builder --chown=node:node /build/ .
RUN npm prune --production
CMD node dist/main.js
