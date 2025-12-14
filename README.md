# Nigeria Tax Calculator

A comprehensive web-based application for managing accounting, inventory, assets, and tax computations for businesses in Nigeria. Supports Individual, Enterprise, and Company entity types with full tax compliance features.

## Features

### Accounting & Financial Management
- Double-entry accounting system
- Chart of accounts management
- Transaction recording (Income, Expense, Assets, Inventory)
- Profit & Loss statements
- Balance Sheet
- Asset depreciation tracking (straight-line)
- Inventory management (weighted average costing)
- Contact management (Customers, Vendors, Employees, Sole Traders)

### Tax Compliance
- **VAT (Value Added Tax)** - Track input and output VAT
- **WHT (Withholding Tax)** - Payable and receivable tracking
- **PAYE (Pay As You Earn)** - Employee tax withholding
- **PIT (Personal Income Tax)** - Individual and Enterprise calculations
- **CIT (Company Income Tax)** - Company tax computations with turnover thresholds
- **CGT (Capital Gains Tax)** - Chargeable asset disposal tracking

### Reporting
- VAT Report
- WHT Payable/Receivable Reports
- PAYE Report
- Inventory Report
- Assets Report (Fixed Assets Schedule)
- PIT Computations (Individual & Enterprise)
- CGT Report
- Company Accounts (P&L, Balance Sheet, CIT)
- Audit Trail
- Receipts Folder

### Export Capabilities
- JSON export/import for data backup
- CSV export for reports
- PDF export for reports
- XLSX (Excel) export for reports

### Security & Authentication
- **Firebase Authentication** - Secure email/password authentication
- Local prototype authentication for development
- User role management (User/Admin)
- Permission controls (View/Edit/Delete)
- Audit trail for all operations

## Authentication

This application uses **Firebase Authentication** as the primary authentication method. For detailed authentication setup, configuration, and usage, see [AUTHENTICATION.md](./AUTHENTICATION.md).

### Quick Start

1. **Firebase Authentication** (Production):
   - Sign up with email and password
   - Password reset via email
   - Secure session management

2. **Local Authentication** (Development):
   - Demo account: username `demo`, password `demo123`
   - Credentials stored in localStorage
   - For testing purposes only

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Firebase Authentication and CDN resources)
- (Optional) Firebase account for production deployment

### Installation

This is a client-side application with no build step required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dozie2512-code/nigeria-tax-calculator.git
   cd nigeria-tax-calculator
   ```

2. **Configure Firebase Authentication** (for production):
   - Follow the setup guide in [AUTHENTICATION.md](./AUTHENTICATION.md)
   - Update Firebase configuration in `index.html`

3. **Open the application:**
   - For local testing: Open `index.html` in a web browser
   - For production: Deploy to a web server (Netlify, Vercel, Firebase Hosting, etc.)

### Quick Development Setup

1. Open `index.html` in a browser
2. Set `FIREBASE_ENABLED = false` in `index.html` (line 211) for local testing
3. Use demo account or create a test account
4. Start using the application

## Configuration

### Firebase Configuration

Edit `index.html` to configure Firebase:

```javascript
// Enable or disable Firebase Authentication
var FIREBASE_ENABLED = true;

// Firebase project credentials
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Environment-Specific Configuration

For production deployments, use environment variables or build-time injection to avoid hardcoding credentials. See [AUTHENTICATION.md](./AUTHENTICATION.md) for details.

## Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: (none - static site)
3. Set publish directory: `/` (root)
4. Configure environment variables for Firebase (see AUTHENTICATION.md)
5. Deploy

### Vercel Deployment

1. Import project from GitHub
2. Framework preset: Other
3. Root directory: `/`
4. No build command needed
5. Configure environment variables
6. Deploy

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Usage

### Creating Your First Business

1. Sign in or create an account
2. Click "+ Business" to add a business
3. Select entity type:
   - **Individual**: For sole proprietors and personal tax
   - **Enterprise**: For partnerships and small businesses
   - **Company**: For incorporated companies
4. Configure tax settings (VAT, WHT, PAYE rates)
5. Set up Chart of Accounts

### Recording Transactions

1. Select your business from the dropdown
2. Choose transaction type:
   - **Income**: Revenue from sales or services
   - **Expense**: Operating costs
   - **Inventory Purchase/Sale**: Stock transactions
   - **Asset Purchase/Disposal**: Fixed assets
3. Fill in transaction details
4. Attach receipts (optional)
5. Click "Add" to record

### Generating Reports

1. Click "Reports" tab
2. Select report type
3. View report in browser
4. Export to CSV, PDF, or XLSX as needed

### Tax Computations

The application automatically computes:
- VAT on income and expenses (inclusive/exclusive)
- WHT deductions (gross/net basis)
- PAYE for salaries
- PIT for individuals and sole proprietors
- CIT for companies (with turnover threshold rules)
- CGT for asset disposals

## Data Storage

### Local Storage
All data is stored in the browser's localStorage under the key `ntc_full_accounting_v2`. This includes:
- User accounts
- Businesses
- Transactions
- Inventory
- Assets
- Contacts
- Audit trail

### Data Backup
Use "Export JSON" to download a complete backup of your data. Use "Import JSON" to restore from a backup.

**Important:** 
- Data is stored locally in your browser
- Clear browser data = data loss (use Export/Import regularly)
- For multi-device access, consider implementing Firestore sync

## Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Authentication**: Firebase Authentication (compat SDK v10.7.1)
- **PDF Export**: jsPDF v2.5.1
- **Excel Export**: SheetJS v0.18.5
- **Payment Processing**: Stripe via Firebase Cloud Functions
- **Storage**: Browser localStorage

### File Structure
```
nigeria-tax-calculator/
├── index.html              # Main application (all-in-one file)
├── auth.js                 # Local authentication fallback
├── functions/              # Firebase Cloud Functions
│   ├── index.js           # Stripe payment processing
│   ├── package.json       # Function dependencies
│   └── README.md          # Function documentation
├── AUTHENTICATION.md       # Authentication documentation
└── README.md              # This file
```

### Authentication Architecture

The application uses a dual authentication system:

1. **Primary: Firebase Authentication**
   - Secure email/password authentication
   - Password reset functionality
   - Session management
   - Production-ready

2. **Fallback: Local Prototype Authentication**
   - localStorage-based
   - For development/testing only
   - Activated when Firebase is disabled

See [AUTHENTICATION.md](./AUTHENTICATION.md) for complete details.

## Security Considerations

### Client-Side Security
- ✅ Firebase Authentication for secure user management
- ✅ Password hashing managed by Firebase
- ✅ Session tokens automatically handled
- ✅ HTTPS recommended for all deployments
- ✅ Content Security Policy (CSP) headers via `netlify.toml`

### Data Protection
- ⚠️ Data stored in browser localStorage (client-side only)
- ⚠️ No server-side data persistence by default
- ⚠️ Receipts stored as base64 in localStorage (size limits apply)
- ✅ Regular backups recommended (Export JSON feature)

### Best Practices
1. Use Firebase Authentication in production
2. Deploy over HTTPS
3. Configure Firebase security rules
4. Export data regularly
5. Don't share Firebase credentials publicly
6. Use environment variables for sensitive config

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- localStorage API
- ES6 JavaScript support
- Crypto API (for SHA-256 hashing)
- FileReader API (for file attachments)
- Fetch API (for Firebase/CDN requests)

## Limitations

### Current Limitations
- Single-user browser-based storage (no multi-device sync)
- localStorage size limits (~5-10MB depending on browser)
- No real-time collaboration
- No server-side data backup
- Receipt storage limited by localStorage size

### Future Enhancements
- Firestore integration for cloud data sync
- Multi-user collaboration
- Real-time updates
- Server-side data backup
- Mobile app version
- Advanced reporting and analytics

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with clear description

### Code Style
- Use meaningful variable names
- Comment complex logic
- Follow existing code structure
- Test authentication changes carefully

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Password reset flow
- [ ] Sign out
- [ ] Demo account login

**Business Operations:**
- [ ] Create business
- [ ] Edit business
- [ ] Delete business
- [ ] Manage chart of accounts
- [ ] Manage contacts

**Transactions:**
- [ ] Record income
- [ ] Record expense
- [ ] Record inventory purchase/sale
- [ ] Record asset purchase/disposal
- [ ] Attach receipts

**Reports:**
- [ ] Generate VAT report
- [ ] Generate WHT reports
- [ ] Generate PAYE report
- [ ] Generate PIT computation
- [ ] Generate CIT computation
- [ ] Generate CGT report
- [ ] Export reports (CSV, PDF, XLSX)

**Data Management:**
- [ ] Export JSON
- [ ] Import JSON
- [ ] Search transactions
- [ ] View audit trail

## Troubleshooting

### Common Issues

**Issue: Can't log in**
- Check Firebase configuration in `index.html`
- Verify Firebase Authentication is enabled in Firebase Console
- Check browser console for errors
- See [AUTHENTICATION.md](./AUTHENTICATION.md) troubleshooting section

**Issue: Data not saving**
- Check if localStorage is enabled in browser
- Check localStorage size limits
- Check browser console for errors

**Issue: Export not working**
- Ensure browser allows file downloads
- Check if data exists
- Try different export format

**Issue: Firebase not loading**
- Check internet connection
- Verify CDN access (firebasejs.com, gstatic.com)
- Check browser console for CORS errors

## License

This project is provided as-is for use by authorized users. See LICENSE file for details.

## Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact: salesrepng@gmail.com

## Acknowledgments

- Firebase for authentication and cloud functions
- jsPDF for PDF generation
- SheetJS for Excel export
- Stripe for payment processing

## Version History

### Current Version
- Firebase Authentication integration
- Local authentication fallback
- Comprehensive tax computations
- Full reporting suite
- Export functionality (JSON, CSV, PDF, XLSX)

## Related Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete authentication guide
- [functions/README.md](./functions/README.md) - Firebase Cloud Functions guide
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Stripe Integration Docs](https://stripe.com/docs)

---

**Note:** This is a tax calculation tool. Always consult with a qualified tax professional for official tax advice and filing.
