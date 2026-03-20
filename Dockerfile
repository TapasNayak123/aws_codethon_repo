# Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=0 /app/dist .
CMD ["npm", "start"]