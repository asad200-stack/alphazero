# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm run install-all

# Copy application files
COPY . .

# Build client
RUN npm run build

# Expose port (Railway will set PORT env variable)
EXPOSE 8080

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]

