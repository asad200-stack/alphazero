# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm run install-all

# Copy application files
COPY . .

# Build client
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]

