FROM node:22-alpine

WORKDIR /dc

COPY bociak.js package.json .

RUN npm install


CMD ["node", "bociak.js"]