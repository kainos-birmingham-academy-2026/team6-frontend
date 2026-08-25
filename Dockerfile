FROM node:24-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

FROM node:24-bookworm-slim AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV API_BASE_URL=http://host.docker.internal:3000
ENV SESSION_SECRET=team6-frontend-session-secret

RUN groupadd --system app && useradd --system --gid app --create-home --home-dir /home/app app

COPY --chown=app:app package*.json ./
COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules

COPY --from=build --chown=app:app /app/dist ./dist

USER app

EXPOSE 3001

CMD ["npm", "start"]