FROM node:22-alpine

WORKDIR /dc

COPY deploy.js bociak.js package.json .

RUN npm install

RUN node deploy.js

CMD ["node", "bociak.js"]