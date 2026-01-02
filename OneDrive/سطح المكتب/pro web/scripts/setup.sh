#!/bin/bash

# Multi-Store SaaS Platform Setup Script

echo "🚀 Setting up Multi-Store SaaS Platform..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your DATABASE_URL and JWT_SECRET"
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

# Check if DATABASE_URL is set
if grep -q "postgresql://" .env 2>/dev/null; then
    echo "🗄️  Pushing database schema..."
    npm run db:push
    echo "✅ Database schema pushed successfully!"
else
    echo "⚠️  DATABASE_URL not configured. Please set it in .env and run: npm run db:push"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and set your DATABASE_URL and JWT_SECRET"
echo "2. Run: npm run db:push (if you haven't already)"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""

