FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server source
COPY . /app

# If a `dist` folder exists at project root, copy it into public (enable single-host deployments)
# (When using docker-compose, mount project root or copy built frontend into server/public before building.)
RUN if [ -d "/app/../dist" ]; then mkdir -p /app/public && cp -R /app/../dist/* /app/public/ || true; fi

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
