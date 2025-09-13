FROM denoland/deno:alpine

WORKDIR /server

COPY . .

EXPOSE 2137

CMD ["deno", "run", "--allow-net", "--allow-read", "server.ts"]