#!/bin/bash

# Recurring Scheduler - Development Setup Script
# This script helps you set up the development environment

echo "🚀 Setting up Recurring Scheduler Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if ! npx semver -r ">=18.0.0" $NODE_VERSION &> /dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "📄 Created backend/.env from example"
    echo "⚠️  Please update backend/.env with your database credentials"
else
    echo "📄 backend/.env already exists"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "📄 Created frontend/.env.local from example"
else
    echo "📄 frontend/.env.local already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your PostgreSQL database URL"
echo "2. Make sure your database has the required tables (see README.md)"
echo "3. Start the development servers:"
echo "   npm run dev (starts both frontend and backend)"
echo "   OR"
echo "   npm run dev:backend (backend only - port 5000)"
echo "   npm run dev:frontend (frontend only - port 3000)"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "Happy coding! 🎯"