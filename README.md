# Nigeria Tax Calculator - Multi-User Accounting Application MVP

A comprehensive multi-user, multi-business accounting application with Nigerian tax compliance features.

## Features

### Core Functionality
- **Multi-User Access**: Role-based permissions (Admin, Manager, Accountant, Viewer)
- **Multi-Business Support**: Each user can manage businesses with specific roles
- **JWT Authentication**: Secure login and registration system
- **User Invitation**: Admins can invite users to their business

### Accounting Features
- **Chart of Accounts**: Customizable account hierarchy with special flags
- **Transaction Management**: Receipts, payments, inventory, and fixed asset transactions
- **Inventory Management**: Weighted-average costing with opening balances
- **Fixed Assets**: Purchase, disposal, depreciation, and capital allowance tracking
- **Contact Management**: Track customers, suppliers, and employees

### Tax Compliance
- **VAT Calculation**: 7.5% default rate, inclusive/exclusive pricing
- **WHT Calculation**: Gross and net calculation modes
- **PAYE**: Monthly and annual calculations with statutory deductions
- **CIT**: Company Income Tax (0% if turnover <= 50M, else 25%)
- **PIT**: Personal Income Tax for sole proprietors using PAYE bands
- **Capital Allowance**: 2/3 rule based on non-taxable income ratio
- **Chargeable Gains/Losses**: Separate tracking for chargeable assets

### Reports
- Accounting Profit Report
- VAT Computations
- WHT Payable/Receivable
- PAYE Breakdown (per contact)
- CIT Computation
- PIT Computation
- Bank Reconciliation
- Excel and PDF export capabilities

### Additional Features
- **File Uploads**: MinIO S3-compatible storage for receipts
- **Bank Reconciliation**: CSV upload with auto-matching
- **Automatic Depreciation**: Monthly cron job for depreciation
- **Manual Depreciation Trigger**: On-demand depreciation calculation

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (via Sequelize ORM)
- JWT for authentication
- MinIO for file storage
- node-cron for scheduled tasks
- ExcelJS and PDFKit for exports

### Frontend
- React 18
- Vite (build tool)
- Axios for API calls
- React Router for navigation

### Infrastructure
- Docker Compose for local development
- PostgreSQL database
- MinIO object storage
- Containerized backend and frontend

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dozie2512-code/nigeria-tax-calculator.git
cd nigeria-tax-calculator
```

2. **Copy environment variables**
```bash
cp .env.example .env
```

3. **Start with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- Backend API on http://localhost:4000
- Frontend on http://localhost:3000
- PostgreSQL on port 5432
- MinIO on http://localhost:9000 (console: http://localhost:9001)

4. **Run database migrations and seeders** (in backend container)
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Seeded Demo Credentials

The application comes with pre-seeded demo data:

**Demo Users** (Password for all: `Password123!`):
- Admin: `admin@demo.test` (Admin role)
- Manager: `manager@demo.test` (Manager role)
- Accountant: `accountant@demo.test` (Accountant role)
- Viewer: `viewer@demo.test` (Viewer role)

**Demo Business**: Demo Trading Company Ltd

**Demo Data Includes**:
- Sample chart of accounts
- 3 inventory items with opening balances
- 4 fixed assets (including 1 chargeable asset and 1 disposed asset)
- 3 contacts (customer, supplier, employee)

### Manual Setup (Without Docker)

#### Backend Setup
```bash
cd backend
npm install

# Set environment variables
export DB_USER=accounting
export DB_PASSWORD=accounting123
export DB_NAME=accounting_db
export DB_HOST=localhost
export JWT_SECRET=your-secret-key

# Run migrations and seeders
npm run migrate
npm run seed

# Start server
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Usage

### Login
1. Navigate to http://localhost:3000
2. Use demo credentials: `admin@demo.test` / `Password123!`
3. Access the dashboard

### Creating Transactions
1. Go to **Transactions** page
2. Select transaction type (receipt, payment, inventory, fixed asset)
3. Fill in details
4. Submit - VAT, WHT, and PAYE are automatically calculated

### Inventory Management
1. Go to **Inventory** page
2. Add new inventory items
3. Process purchases (calculates weighted-average cost automatically)
4. Process sales (uses current weighted-average cost for COGS)

### Fixed Assets
1. Go to **Fixed Assets** page
2. Add assets with depreciation and capital allowance rates
3. Mark assets as FIXED or CHARGEABLE
4. Trigger monthly depreciation manually or wait for cron job
5. Disposal creates gain/loss transactions

### Reports
1. Go to **Reports** page
2. Select report type and date range
3. Generate report
4. Export to Excel or PDF

### Settings
1. Go to **Settings** page
2. Update business information
3. Configure tax rates
4. Set brought-forward amounts
5. Enable/disable tax features

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user and business
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/invite` - Invite user to business (Admin only)

### Business Endpoints
- `GET /api/businesses` - Get user's businesses
- `GET /api/businesses/:id/settings` - Get business settings
- `PUT /api/businesses/:id/settings` - Update business settings

### Transaction Endpoints
- `GET /api/businesses/:id/transactions` - List transactions
- `POST /api/businesses/:id/transactions` - Create transaction
- `GET /api/businesses/:id/transactions/:txnId` - Get transaction
- `PUT /api/businesses/:id/transactions/:txnId` - Update transaction
- `DELETE /api/businesses/:id/transactions/:txnId` - Delete transaction

### Inventory Endpoints
- `GET /api/businesses/:id/inventory` - List inventory items
- `POST /api/businesses/:id/inventory` - Create inventory item
- `POST /api/businesses/:id/inventory/:itemId/purchase` - Process purchase
- `POST /api/businesses/:id/inventory/:itemId/sale` - Process sale
- `POST /api/businesses/:id/inventory/:itemId/opening-balance` - Set opening balance

### Fixed Asset Endpoints
- `GET /api/businesses/:id/fixed-assets` - List fixed assets
- `POST /api/businesses/:id/fixed-assets` - Create fixed asset
- `GET /api/businesses/:id/fixed-assets/:assetId` - Get asset details
- `PUT /api/businesses/:id/fixed-assets/:assetId` - Update asset
- `POST /api/businesses/:id/fixed-assets/:assetId/dispose` - Dispose asset
- `POST /api/businesses/:id/fixed-assets/depreciation/run` - Trigger depreciation

### Report Endpoints
- `GET /api/businesses/:id/reports/accounting-profit` - Accounting profit report
- `GET /api/businesses/:id/reports/cit` - CIT computation
- `GET /api/businesses/:id/reports/pit` - PIT computation
- `GET /api/businesses/:id/reports/vat` - VAT report
- `GET /api/businesses/:id/reports/wht` - WHT report
- `GET /api/businesses/:id/reports/paye` - PAYE report
- `GET /api/businesses/:id/reports/:type/export/excel` - Export to Excel
- `GET /api/businesses/:id/reports/:type/export/pdf` - Export to PDF

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Tests include:
- PAYE calculations
- VAT calculations
- WHT calculations (gross and net modes)
- Inventory weighted-average costing
- Depreciation calculations
- Capital allowance calculations

## Business Rules

### Inventory Costing
- **Weighted-Average**: Default method
- Recalculated on each purchase
- Opening balances supported
- To extend to FIFO/LIFO, modify `services/inventory.js`

### Depreciation
- **Straight-line method**: Monthly depreciation
- Based on per-asset depreciation rate and purchase date
- Automatic monthly via cron (1st of each month at midnight)
- Manual trigger available

### Capital Allowance
- Total = Capital for year + Capital B/F
- If non-taxable income < 10% of total revenue: allow 100%
- Otherwise: allow 2/3, carry forward 1/3

### Taxable Profit Calculation
```
Taxable Profit = Accounting Profit
               + Depreciation
               + Disallowable Expenses
               + Chargeable Gains
               - Non-Taxable Income
               - Loss Relief B/F
               - Allowed Capital Allowance
```

### CIT
- Rate: 0% if turnover <= ₦50,000,000
- Otherwise: 25% (configurable)
- WHT receivable deducted when CIT computed
- WHT carried forward if no CIT liability

### PIT
- Applies to sole proprietors
- Uses same taxable profit formula as CIT
- PAYE bands applied to taxable profit

### PAYE Bands (2023)
- First ₦300,000: 7%
- Next ₦300,000: 11%
- Next ₦500,000: 15%
- Next ₦500,000: 19%
- Next ₦1,600,000: 21%
- Above ₦3,200,000: 24%

### Chargeable Assets
- Gains/losses excluded from accounting profit
- Tracked separately
- Chargeable losses carried forward

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── migrations/      # Database migrations
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── seeders/         # Database seeders
│   │   ├── services/        # Business logic
│   │   ├── tests/           # Unit tests
│   │   ├── utils/           # Utilities
│   │   └── index.js         # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Contributing

This is an MVP implementation. Future enhancements could include:
- OCR for receipt scanning
- More advanced bank reconciliation
- Multiple inventory costing methods (FIFO, LIFO)
- Audit trail
- Multi-currency support
- More detailed reporting
- User profile management
- Email notifications
- Real-time updates

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
