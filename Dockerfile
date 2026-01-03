# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files first
COPY . .

# Install root dependencies
RUN npm ci --omit=dev

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Build client
RUN npm run build

# Back to root
WORKDIR /app

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]



