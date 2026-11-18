FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --chown=node:node src ./src
COPY --chown=node:node db ./db

# UID 1000 is the unprivileged "node" user in the official image.
USER 1000:1000
EXPOSE 3000

# Run node directly so it receives SIGTERM and server.js can shut down cleanly.
CMD ["node", "src/server.js"]
