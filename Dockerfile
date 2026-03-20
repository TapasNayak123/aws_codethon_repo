# Base image
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app/dist .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]