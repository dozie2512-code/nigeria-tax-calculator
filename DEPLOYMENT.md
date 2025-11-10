# Deployment Instructions

## Quick Start with Docker Compose

```bash
# Start all services
docker-compose up --build

# In another terminal, run migrations and seeds
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MinIO Console: http://localhost:9001

## Demo Login
- Email: admin@demo.test
- Password: Password123!

See README.md for complete documentation.
