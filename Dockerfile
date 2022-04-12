FROM fedora:latest

RUN dnf -y update && dnf -y install nodejs && dnf clean all

WORKDIR /bot

COPY package.json tsconfig.json ./

RUN npm i

COPY . .

RUN npm run build && rm -r src/ && npm prune --production

CMD node dist/main.js
