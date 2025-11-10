# Nigeria Tax Calculator - Multi-Business Accounting Application

A comprehensive multi-user, multi-business accounting application built with React, Node.js/Express, PostgreSQL, and Docker.

## Features

### Core Functionality
- **Multi-tenant Architecture**: Each user can manage multiple businesses with role-based access control
- **User Roles**: Admin, Manager, Accountant, Viewer with different permission levels
- **Authentication**: JWT-based authentication with user invitation system
- **Chart of Accounts**: Customizable accounts with tax-specific flags (disallowable, non-taxable, revenue, rent)
- **Transaction Management**: Receipt, payment, inventory, and fixed asset transactions
- **Inventory Costing**: Weighted-average costing method (default)
- **Fixed Asset Management**: Purchase, disposal, depreciation, and capital allowance tracking
- **Chargeable Assets**: Separate tracking for chargeable gains/losses vs fixed asset profit/loss

### Tax Computations
- **VAT**: Configurable rate (default 7.5%), supports inclusive/exclusive pricing
- **WHT**: Withholding tax with gross/net calculation modes
- **PAYE**: Nigerian PAYE bands with statutory deductions (NHF, pension, life assurance, mortgage interest, rent relief)
- **CIT**: Company Income Tax (0% for turnover ≤ ₦50M, 25% otherwise)
- **PIT**: Personal Income Tax for sole proprietors
- **Capital Allowance**: Computed with 10% non-taxable income rule
- **Loss Relief**: Carry forward of losses and unrelieved capital allowances

### Automation
- **Monthly Depreciation**: Automatic cron job runs on 1st of each month
- **Manual Trigger**: API endpoint to manually trigger depreciation calculations
- **Bank Reconciliation**: CSV upload with auto-matching by date/amount

### Reports & Exports
- Accounting profit report
- VAT computations by transaction
- WHT payable/receivable reports
- PAYE breakdown per employee/contact
- CIT and PIT computation reports
- Bank reconciliation report
- Export to Excel (xlsx) and PDF

### File Management
- Receipt uploads to MinIO S3-compatible storage
- File attachments on transactions

## Technology Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible)
- **Containerization**: Docker, Docker Compose
- **Cron Jobs**: node-cron for automated tasks

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/dozie2512-code/nigeria-tax-calculator.git
   cd nigeria-tax-calculator
   ```

2. **Run setup script**
   ```bash
   ./setup.sh
   ```
   
   Or manually:
   ```bash
   docker compose up --build -d
   sleep 15
   docker compose exec backend npx sequelize-cli db:seed:all
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MinIO Console: http://localhost:9001

4. **Login with seeded credentials**
   - **Admin**: admin@example.com / admin123
   - **Manager**: manager@example.com / manager123
   - **Accountant**: accountant@example.com / accountant123
   - **Viewer**: viewer@example.com / viewer123

5. **Run tests**
   ```bash
   cd backend
   npm test
   ```
   
For detailed testing scenarios, see [TESTING.md](TESTING.md).

For API documentation, see [API_DOCS.md](API_DOCS.md).

### Development Setup

#### Backend Only
```bash
cd backend
npm install
npm run dev
```

#### Frontend Only
```bash
cd frontend
npm install
npm start
```

#### Database Migrations
```bash
cd backend
npm run migrate
```

#### Database Seeding
```bash
cd backend
npm run seed
```

## API Endpoints

See [API_DOCS.md](API_DOCS.md) for complete API documentation.

### Key Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/invite` - Invite user to business (Admin only)
- `GET /auth/profile` - Get current user profile
- `POST /api/depreciation/run` - Manually trigger monthly depreciation
- `GET /health` - API health check

For business, transactions, tax computations, and more, see the full API documentation.

## Project Structure

```
nigeria-tax-calculator/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth and validation middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Tax calculations and helpers
│   │   ├── tests/           # Unit tests
│   │   └── index.js         # Server entry point
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Database seeders
│   ├── config/              # Database configuration
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   ├── utils/           # Frontend utilities
│   │   ├── App.js           # Main App component
│   │   └── index.js         # React entry point
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema

### Core Models
- **User**: User accounts
- **Business**: Business entities
- **BusinessUser**: Many-to-many relationship with roles
- **ChartAccount**: Chart of accounts with tax flags
- **Transaction**: All financial transactions
- **Contact**: Customers, suppliers, employees
- **InventoryItem**: Inventory items with costing
- **InventoryTransaction**: Inventory movements
- **FixedAsset**: Fixed assets with depreciation tracking
- **BankTransaction**: Bank statement entries
- **Reconciliation**: Bank reconciliation matches
- **BusinessSettings**: Business-specific settings and tax rates

## Tax Computation Logic

### Accounting Profit
```
Accounting Profit = Revenue - COGS - Depreciation - Expenses + Fixed Asset Profit/Loss
```
Note: Excludes chargeable gains/losses

### Taxable Profit
```
Taxable Profit = Accounting Profit 
                 + Depreciation 
                 + Disallowable Expenses 
                 + Chargeable Gains 
                 - Non-Taxable Income 
                 - Loss Relief B/F 
                 - Capital Allowance
```

### Capital Allowance 10% Rule
- If non-taxable income < 10% of total revenue: Allow 100% of capital allowance
- Otherwise: Allow only 2/3 of capital allowance, carry forward 1/3

### CIT Computation
- Turnover ≤ ₦50,000,000: 0% CIT
- Turnover > ₦50,000,000: 25% CIT
- WHT receivable deducted only when CIT is computed

### PAYE Bands (2024)
- ₦0 - ₦300,000: 7%
- ₦300,000 - ₦600,000: 11%
- ₦600,000 - ₦1,100,000: 15%
- ₦1,100,000 - ₦1,600,000: 19%
- ₦1,600,000 - ₦3,200,000: 21%
- Above ₦3,200,000: 24%

## Testing

### Run Unit Tests
```bash
cd backend
npm test
```

### Test Coverage
```bash
cd backend
npm test -- --coverage
```

## Future Enhancements

This MVP provides the foundation for:
- **FIFO/LIFO Costing**: Alternative inventory costing methods
- **OCR Integration**: Automatic receipt data extraction
- **SSO Integration**: Single sign-on support
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Dashboard with charts and insights
- **Audit Trail**: Comprehensive audit logging
- **Multi-currency**: Support for multiple currencies
- **API Documentation**: Swagger/OpenAPI documentation

## Acceptance Criteria

✅ Docker Compose setup with PostgreSQL and MinIO
✅ Backend with Sequelize models and JWT authentication
✅ Frontend with React and routing
✅ Multi-tenant architecture with role-based access
✅ Chart of accounts with tax flags
✅ Transaction posting (receipts, payments, inventory, fixed assets)
✅ Fixed asset depreciation with cron job
✅ Chargeable asset tracking with gain/loss computation
✅ Tax computations (VAT, WHT, PAYE, CIT, PIT)
✅ Capital allowance with 10% rule
✅ Weighted-average inventory costing
✅ Database seeding with sample data
✅ Admin can create businesses and invite users
✅ README with setup instructions and seeded credentials

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
