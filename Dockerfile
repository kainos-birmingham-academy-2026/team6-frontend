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

COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV API_BASE_URL=http://host.docker.internal:3000
ENV SESSION_SECRET=team6-frontend-session-secret

COPY package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["npm", "start"]