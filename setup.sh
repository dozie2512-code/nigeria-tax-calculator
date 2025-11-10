#!/bin/bash

echo "==================================="
echo "Nigeria Accounting Application Setup"
echo "==================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "✓ Docker is running"

# Check if docker compose is available
if ! docker compose version > /dev/null 2>&1; then
  echo "Error: docker compose is not available."
  exit 1
fi

echo "✓ Docker Compose is available"

# Build and start services
echo ""
echo "Building and starting services..."
echo "This may take a few minutes on first run..."
docker compose up --build -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service status:"
docker compose ps

# Wait for database to be ready
echo ""
echo "Waiting for database to initialize..."
sleep 5

# Run database migrations and seed
echo ""
echo "Running database setup..."
docker compose exec backend npx sequelize-cli db:seed:all

echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  MinIO Console: http://localhost:9001"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop services:"
echo "  docker compose down"
echo ""
