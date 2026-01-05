# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set NODE_ENV to production early
ENV NODE_ENV=production

# Copy package files first (for better caching)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm run install-all

# Copy application files
COPY . .

# Build client (NODE_ENV is already set to production)
RUN npm run build

# Verify build output exists
RUN ls -la client/dist/ || echo "Build output not found!"

# Expose port (Railway will set PORT env variable)
EXPOSE 8080

# Start server
CMD ["npm", "start"]

