FROM fedora:latest

RUN dnf -y update && dnf -y install nodejs libcurl-devel make g++ && dnf clean all

WORKDIR /bot

COPY . .

RUN npm i && npm run build && rm -r src/ && npm prune --production && dnf remove -y libcurl-devel make g++

CMD node dist/main.js
