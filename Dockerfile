# Base image
FROM node:16-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD [ "node", "dist/index.js" ]