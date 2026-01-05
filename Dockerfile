# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including devDependencies for build)
# We need devDependencies (like vite) to build the client
RUN cd client && npm install && cd ../server && npm install --production

# Copy application files
COPY . .

# Build client (NODE_ENV will be set by vite build automatically)
RUN npm run build

# Now set NODE_ENV to production for runtime
ENV NODE_ENV=production

# Verify build output exists and show contents
RUN echo "=== Build Output Verification ===" && \
    ls -la client/dist/ && \
    echo "=== index.html (full content) ===" && \
    cat client/dist/index.html && \
    echo "=== Assets ===" && \
    ls -la client/dist/assets/ || echo "Assets directory not found" && \
    echo "=== Checking for script tags in index.html ===" && \
    grep -i "script" client/dist/index.html || echo "No script tags found!"

# Expose port (Railway will set PORT env variable)
EXPOSE 8080

# Start server
CMD ["npm", "start"]

