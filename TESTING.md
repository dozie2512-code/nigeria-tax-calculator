# Testing Guide

## Pre-requisites
- Docker and Docker Compose installed
- Git installed
- Minimum 4GB RAM available
- Ports 3000, 3001, 5432, 9000, 9001 available

## Quick Start Testing

### 1. Clone and Setup
```bash
git clone https://github.com/dozie2512-code/nigeria-tax-calculator.git
cd nigeria-tax-calculator
./setup.sh
```

Or manually:
```bash
docker compose up --build -d
sleep 15
docker compose exec backend npx sequelize-cli db:seed:all
```

### 2. Verify Services

Check all services are running:
```bash
docker compose ps
```

Expected output:
- postgres: healthy
- minio: healthy  
- backend: running
- frontend: running

### 3. Test Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 4. Test Authentication

Register a new user:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Login with seeded admin:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the returned token for subsequent requests.

### 5. Test Business Creation

```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3001/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Company Ltd",
    "businessType": "Company",
    "address": "123 Test Street",
    "email": "test@company.com"
  }'
```

### 6. Test Chart of Accounts

Get accounts for the seeded business:
```bash
BUSINESS_ID="660e8400-e29b-41d4-a716-446655440001"

curl -X GET "http://localhost:3001/api/businesses/$BUSINESS_ID/accounts" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Test Tax Computation

```bash
curl -X GET "http://localhost:3001/api/businesses/$BUSINESS_ID/tax/compute?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Test Depreciation Run

```bash
curl -X POST http://localhost:3001/api/depreciation/run \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Test Frontend

Open browser and navigate to:
```
http://localhost:3000
```

Login with:
- Email: admin@example.com
- Password: admin123

## Unit Tests

Run backend unit tests:
```bash
cd backend
npm test
```

Expected: 19 tests pass, 100% coverage on tax calculations.

## Integration Testing Scenarios

### Scenario 1: Create Business and Chart of Accounts
1. Login as admin
2. Create a new business
3. Create chart of accounts (Asset, Revenue, Expense accounts)
4. Verify accounts are created

### Scenario 2: Post Transactions
1. Create a receipt transaction with VAT
2. Create a payment transaction with WHT
3. Verify VAT and WHT calculations are correct
4. Verify account balances update

### Scenario 3: Fixed Asset Lifecycle
1. Create a fixed asset flagged as CHARGEABLE
2. Wait for monthly depreciation (or trigger manually)
3. Dispose the asset
4. Verify chargeable gain/loss is calculated
5. Verify chargeable loss is carried forward in settings

### Scenario 4: Inventory Management
1. Create an inventory item
2. Purchase inventory (increases stock)
3. Verify weighted-average cost calculation
4. Sell inventory (decreases stock)
5. Verify COGS calculation

### Scenario 5: Tax Computation
1. Post various transactions (revenue, expenses, purchases)
2. Create fixed assets and run depreciation
3. Mark some expenses as disallowable
4. Run tax computation for a period
5. Verify:
   - Accounting profit calculation
   - Taxable profit with adjustments
   - Capital allowance 10% rule application
   - CIT calculation based on turnover
   - VAT net (collected - paid)
   - WHT net (receivable - payable)

### Scenario 6: PAYE Calculation
1. Create an employee contact with salary details
2. Set statutory deductions (NHF, pension, etc.)
3. Compute PAYE
4. Verify rent relief (20% of rent paid)
5. Verify PAYE bands application

### Scenario 7: User Invitation
1. Login as Admin
2. Invite a new user with Manager role
3. New user logs in
4. Verify Manager can create transactions
5. Verify Manager cannot manage users

### Scenario 8: File Upload
1. Upload a receipt file
2. Attach file URL to a transaction
3. Verify file is stored in MinIO
4. Verify file can be accessed

## Performance Testing

### Load Test Transaction Creation
```bash
# Create 100 transactions
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/businesses/$BUSINESS_ID/transactions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "accountId": "990e8400-e29b-41d4-a716-446655440006",
      "type": "receipt",
      "date": "2024-01-01",
      "description": "Test transaction '$i'",
      "amount": 1000,
      "vatRate": 7.5,
      "vatInclusive": false
    }'
done
```

### Benchmark Depreciation Job
```bash
time curl -X POST http://localhost:3001/api/depreciation/run \
  -H "Authorization: Bearer $TOKEN"
```

## Security Testing

### Test Authentication
- Access protected endpoint without token (expect 401)
- Access with invalid token (expect 401)
- Access with expired token (expect 401)

### Test Authorization
- Login as Viewer
- Try to create transaction (expect 403)
- Try to delete account (expect 403)

### Test Multi-tenancy
- Create two businesses
- Verify user can only access their own business data
- Try to access another user's business (expect 403)

## Database Verification

Access database directly:
```bash
docker compose exec postgres psql -U accounting_user -d accounting_db
```

Check data:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM businesses;
SELECT COUNT(*) FROM chart_accounts;
SELECT COUNT(*) FROM fixed_assets;
SELECT * FROM business_settings;
```

## Logs and Debugging

View all logs:
```bash
docker compose logs -f
```

View specific service logs:
```bash
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f minio
```

## Cleanup

Stop services:
```bash
docker compose down
```

Remove volumes (clean slate):
```bash
docker compose down -v
```

## Known Issues / Limitations (MVP)

1. No pagination on list endpoints
2. No rate limiting
3. Bank reconciliation CSV upload not implemented
4. Report exports (Excel/PDF) not implemented
5. No email notifications for user invitations
6. No password reset functionality
7. Frontend UI is minimal (auth only)
8. No API versioning
9. No request validation middleware (Joi not fully integrated)
10. No comprehensive error logging/monitoring

## Success Criteria

The MVP is considered successful if:
- ✓ All services start and run healthily
- ✓ Authentication works (register, login, invite)
- ✓ Admin can create businesses
- ✓ Users can create chart of accounts
- ✓ Transactions can be posted with VAT/WHT calculations
- ✓ Fixed assets can be created and disposed
- ✓ Chargeable gain/loss is calculated correctly
- ✓ Depreciation runs automatically (cron) and manually
- ✓ Inventory weighted-average costing works
- ✓ Tax computations are accurate (verified by unit tests)
- ✓ Capital allowance 10% rule applies correctly
- ✓ PAYE calculations use correct bands and reliefs
- ✓ CIT is 0% for turnover ≤50M, 25% otherwise
- ✓ Role-based access control works
- ✓ Multi-tenant isolation is enforced
- ✓ Files can be uploaded to MinIO

## Next Steps for Production

1. Add input validation using Joi on all endpoints
2. Implement pagination and filtering
3. Add rate limiting and request throttling
4. Implement Excel and PDF report exports
5. Add bank reconciliation CSV parsing
6. Build complete frontend UI
7. Add email service for notifications
8. Implement password reset flow
9. Add comprehensive audit trail
10. Set up monitoring and alerting
11. Add API versioning
12. Implement FIFO/LIFO costing methods
13. Add OCR for receipt scanning
14. Integrate SSO (OAuth2)
15. Create mobile application
16. Add multi-currency support
17. Implement advanced analytics dashboard
18. Add automated backup solutions
19. Set up CI/CD pipeline
20. Security audit and penetration testing
