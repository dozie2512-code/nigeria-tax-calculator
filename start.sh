#!/bin/bash

echo "🧮 Nigeria Tax Calculator - Starting Application"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://www.docker.com/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    echo "Please install Docker Compose"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting services with Docker Compose..."
echo ""

# Start Docker Compose
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for services
sleep 10

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend:      http://localhost:3000"
echo "   Backend API:   http://localhost:5000"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "📖 To view logs:"
echo "   docker compose logs -f"
echo ""
echo "⚠️  To run database migrations:"
echo "   docker compose exec backend npm run migrate"
echo ""
echo "📦 To seed demo data:"
echo "   docker compose exec backend npm run seed"
echo ""
echo "🛑 To stop services:"
echo "   docker compose down"
echo ""
echo "Happy accounting! 🎉"
