# Nigeria Tax Calculator - Accounting Application MVP

A multi-user, multi-business accounting application with comprehensive tax calculation features for Nigerian businesses.

## Features

### Core Accounting
- **Multi-business Support**: Users can manage multiple businesses with role-based access (Admin, Manager, Accountant, Viewer)
- **Chart of Accounts**: Manage accounts with flags for disallowable expenses, non-taxable income, revenue, rent, and disposal accounts
- **Transactions**: Record receipts, payments, inventory purchases/sales, and fixed asset transactions
- **Contacts**: Manage customers, suppliers, and employees with statutory deduction tracking

### Inventory Management
- **Weighted Average Costing**: Automatic COGS calculation using weighted-average method
- **Purchase & Sale Tracking**: Record inventory purchases and sales
- **Opening Balance Support**: Set opening balances for existing inventory

### Fixed Assets
- **Asset Purchase & Disposal**: Track fixed asset lifecycle
- **Depreciation**: Monthly straight-line depreciation calculation
- **Capital Allowance**: Calculate capital allowances per Nigerian tax rules
- **Chargeable Assets**: Flag assets as "chargeable" for separate gain/loss treatment

### Tax Calculations

#### VAT (Value Added Tax)
- Track VAT collected and VAT paid
- Support for inclusive/exclusive pricing
- Configurable VAT rate (default 7.5%)

#### WHT (Withholding Tax)
- Track WHT payable and receivable
- Support for gross and net calculation modes
- Configurable WHT rate

#### PAYE (Pay As You Earn)
- Employee salary taxation with progressive bands:
  - First ₦800,000: Free
  - Next ₦2,200,000: 15%
  - Next ₦9,000,000: 18%
  - Next ₦13,000,000: 21%
  - Next ₦25,000,000: 23%
  - Above ₦50,000,000: 25%
- Statutory deductions: Rent relief (20%), mortgage interest, life assurance, NHF, pensions

#### CIT (Company Income Tax)
- 0% for turnover ≤ ₦50,000,000
- 25% for turnover > ₦50,000,000
- Accounts for:
  - Accounting profit calculation
  - Add-backs: Depreciation, disallowable expenses, chargeable gains
  - Deductions: Non-taxable income, loss relief b/f, capital allowance
  - Capital allowance rules: 100% if non-taxable income < 10% of revenue, otherwise 2/3
  - WHT receivable offset
  - Unrelieved capital allowance carry forward (1/3)

#### PIT (Personal Income Tax)
- For sole proprietors
- Uses same progressive bands as PAYE applied to business taxable profit

#### Chargeable Gains/Losses
- Separate tracking for assets flagged as "chargeable"
- Excluded from accounting profit
- Chargeable losses carried forward separately

### Reports
- Accounting Profit Report
- VAT Computation Report
- WHT Payable/Receivable Report
- PAYE Breakdown by Employee
- CIT Computation
- PIT Computation (for sole proprietors)
- Bank Reconciliation Report

### Bank Reconciliation
- Upload bank statements (CSV)
- Automatic matching by date and amount
- Manual match/unmatch functionality

### File Management
- Upload receipts and invoices
- Link files to transactions
- MinIO S3-compatible storage

## Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Storage**: MinIO (S3-compatible)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**: Backend API, Frontend SPA, PostgreSQL, MinIO

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dozie2512-code/nigeria-tax-calculator.git
   cd nigeria-tax-calculator
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if needed to customize configuration (optional for development).

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL on port 5432
   - MinIO on ports 9000 (API) and 9001 (Console)
   - Backend API on port 5000
   - Frontend on port 3000

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MinIO Console: http://localhost:9001

### First Time Setup

1. Navigate to http://localhost:3000
2. Click "Register" to create a new account
3. Fill in:
   - Your personal information (first name, last name, email, password)
   - Business name
   - Business type (Company or Sole Proprietor)
4. Click "Register"
5. You'll be automatically logged in to your new business

### Default Admin User (via Seeder)
If you run database seeders:
```bash
docker-compose exec backend npm run seed
```

Admin credentials:
- Email: admin@example.com
- Password: password123

## Project Structure

```
.
├── backend/                # Node.js Express API
│   ├── config/            # Database and app configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication and authorization
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── seeders/           # Database seeders
│   ├── migrations/        # Database migrations
│   └── server.js          # Entry point
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   └── services/     # API service layer
│   └── index.html
├── docker-compose.yml     # Docker services configuration
├── .env.example           # Environment variables template
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and business
- `POST /api/auth/login` - Login
- `POST /api/auth/invite` - Invite user to business (admin only)
- `GET /api/auth/me` - Get current user

### Businesses
- `GET /api/businesses` - Get user's businesses
- `POST /api/businesses` - Create business
- `GET /api/businesses/:id` - Get business details
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Chart of Accounts
- `GET /api/chart-accounts?businessId=xxx` - List accounts
- `POST /api/chart-accounts` - Create account
- `PUT /api/chart-accounts/:id` - Update account
- `DELETE /api/chart-accounts/:id` - Delete account

### Transactions
- `GET /api/transactions?businessId=xxx` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Inventory
- `GET /api/inventory/items?businessId=xxx` - List items
- `POST /api/inventory/items` - Create item
- `POST /api/inventory/purchase` - Record purchase
- `POST /api/inventory/sale` - Record sale
- `GET /api/inventory/transactions?businessId=xxx` - List inventory transactions

### Fixed Assets
- `GET /api/fixed-assets?businessId=xxx` - List assets
- `POST /api/fixed-assets` - Create asset
- `POST /api/fixed-assets/:id/dispose` - Dispose asset
- `POST /api/fixed-assets/calculate-depreciation` - Run monthly depreciation

### Contacts
- `GET /api/contacts?businessId=xxx` - List contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact

### Reports
- `GET /api/reports/accounting-profit?businessId=xxx&startDate=&endDate=` - Accounting profit
- `GET /api/reports/vat?businessId=xxx&startDate=&endDate=` - VAT report
- `GET /api/reports/wht?businessId=xxx&startDate=&endDate=` - WHT report
- `GET /api/reports/paye?businessId=xxx&startDate=&endDate=` - PAYE report
- `GET /api/reports/cit?businessId=xxx&startDate=&endDate=` - CIT computation
- `GET /api/reports/pit?businessId=xxx&startDate=&endDate=` - PIT computation

### Settings
- `GET /api/settings?businessId=xxx` - Get business settings
- `PUT /api/settings?businessId=xxx` - Update settings

### Files
- `POST /api/files` - Upload file (multipart/form-data)

### Bank Reconciliation
- `POST /api/bank-reconciliation/upload` - Upload bank statement CSV
- `GET /api/bank-reconciliation/statements?businessId=xxx` - List statements
- `POST /api/bank-reconciliation/match` - Match transaction
- `POST /api/bank-reconciliation/unmatch/:id` - Unmatch transaction
- `GET /api/bank-reconciliation/report?businessId=xxx` - Reconciliation report

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
docker-compose exec backend npm run migrate
```

### Database Seeders
```bash
docker-compose exec backend npm run seed
```

## User Roles & Permissions

- **Admin**: Full access - manage users, settings, all transactions
- **Manager**: Manage transactions, reports, but not settings or users
- **Accountant**: Create and edit transactions, view reports
- **Viewer**: Read-only access to transactions and reports

## Tax Calculation Notes

### Accounting Profit Formula
```
Accounting Profit = Revenue - COGS - Depreciation - Expenses + Disposal Profit/Loss (Fixed Assets Only)
```

### Taxable Profit Formula (CIT)
```
Taxable Profit = Accounting Profit
               + Depreciation (add back)
               + Disallowable Expenses
               + Chargeable Gains
               - Non-Taxable Income
               - Loss Relief B/F
               - Capital Allowance Deduction
```

### Capital Allowance Rules
- If Non-Taxable Income < 10% of Revenue: Deduct 100% of total capital allowance
- Otherwise: Deduct 2/3 of total capital allowance
- Unrelieved 1/3 carried forward to next period
- Total Capital Allowance = Capital Allowance B/F + Capital Allowance for Year

### Chargeable Assets
- Gains/losses from disposal of "chargeable" assets are tracked separately
- NOT included in accounting profit
- Chargeable losses are carried forward separately (not used to reduce taxable profit)
- Chargeable gains are added to taxable profit for CIT

## Future Enhancements

- [ ] Export reports to Excel (XLSX) and PDF
- [ ] Advanced inventory costing methods (FIFO, LIFO)
- [ ] Automated bank reconciliation improvements
- [ ] OCR for receipt scanning
- [ ] Multi-currency support
- [ ] Audit trail
- [ ] Advanced reporting dashboards
- [ ] Mobile app
- [ ] Integration with accounting software

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## License

MIT License
