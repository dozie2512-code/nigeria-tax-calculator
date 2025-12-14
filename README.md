# Nigeria Tax Calculator

A comprehensive web-based accounting and tax calculation system for Nigerian businesses and individuals. This application helps track income, expenses, inventory, assets, and automatically computes VAT, WHT, PAYE, PIT, CIT, and CGT.

## Features

### Core Functionality
- 📊 **Complete Accounting System**: Track income, expenses, assets, and inventory
- 💰 **Tax Calculations**: Automatic computation of VAT, WHT, PAYE, PIT, CIT, and CGT
- 📈 **Financial Reports**: Generate P&L statements, balance sheets, and tax reports
- 📄 **Export Capabilities**: Export to PDF, Excel (XLSX), and CSV formats
- 🔐 **Authentication**: Firebase-based authentication with local fallback
- 💼 **Multi-Business Support**: Manage multiple businesses and users

### Tax Features
- **VAT (Value Added Tax)**: Track input and output VAT with exclusive/inclusive options
- **WHT (Withholding Tax)**: Calculate WHT on transactions with configurable rates
- **PAYE (Pay As You Earn)**: Employee tax calculations with statutory deductions
- **PIT (Personal Income Tax)**: Individual and enterprise tax computations
- **CIT (Company Income Tax)**: Corporate tax with adjustments and loss carry-forward
- **CGT (Capital Gains Tax)**: Track chargeable assets and disposals

### Advanced Features
- 📦 Inventory management with weighted average costing
- 🏢 Fixed assets schedule with depreciation and capital allowances
- 📝 Audit trail for all transactions
- 📎 Receipt attachment support
- 🎯 Account-level and transaction-level adjustments
- 👥 Contact management with statutory deductions

## Quick Start

### Option 1: Use the Live Demo

Simply open `index.html` in a modern web browser. The application works entirely client-side with no server required.

### Option 2: Deploy to Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Fork or clone this repository
2. Connect to Netlify
3. Configure Firebase (optional)
4. Deploy!

## Project Structure

```
nigeria-tax-calculator/
├── index.html              # Main application (full-featured)
├── auth.html              # Standalone authentication page
├── auth.css               # Authentication styles
├── auth.js                # Authentication logic
├── 404.html               # Error page for deployment
├── netlify.toml           # Netlify configuration
├── _redirects             # Netlify redirects (SPA routing)
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── DEPLOYMENT.md          # Deployment guide
├── auth/                  # Auth subdirectory
│   ├── index.html
│   └── README.md
└── functions/             # Firebase Cloud Functions (optional)
    ├── index.js
    ├── package.json
    └── .gitignore
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES5+), HTML5, CSS3
- **Authentication**: Firebase Authentication (with local fallback)
- **Storage**: Browser localStorage
- **Libraries**:
  - jsPDF - PDF generation
  - SheetJS (xlsx) - Excel export
  - Firebase SDK - Authentication

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Configuration

### Firebase Setup (Optional)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Update `firebaseConfig` in `index.html` with your credentials
4. Add your deployment domain to Firebase authorized domains

To disable Firebase and use local authentication:
- Set `FIREBASE_ENABLED = false` in `index.html`

### Tax Rates

Default tax rates can be configured per business:
- VAT: 7.5% (configurable)
- WHT: 5% (configurable)
- PIT: Progressive bands according to Nigerian tax law
- CIT: Based on turnover threshold (₦50M or ₦100M)

## Usage

### Getting Started

1. **Sign Up**: Create an account on the pre-login screen
2. **Select Entity Type**: Choose Individual, Enterprise, or Company
3. **Add Transactions**: Start recording income and expenses
4. **Generate Reports**: View VAT, WHT, PAYE, and other tax reports

### Key Workflows

#### Recording Transactions
1. Select date and action type (Income, Expense, etc.)
2. Choose account (or create new)
3. Enter amount and description
4. Configure VAT/WHT options if applicable
5. Attach receipt (optional)
6. Click "Add"

#### Managing Inventory
1. Select "Inventory Purchase" or "Inventory Sale"
2. Choose or create inventory item
3. Enter quantity and unit price
4. System automatically tracks COGS using weighted average

#### Managing Assets
1. Select "Asset Purchase"
2. Enter asset details (name, cost, useful life)
3. Set depreciation rate and capital allowance percentage
4. System automatically computes depreciation and tax adjustments

#### Generating Reports
1. Click "Reports" tab
2. Select report type (VAT, PAYE, PIT, etc.)
3. Export to PDF, Excel, or CSV if needed

## Data Storage

- **All data is stored locally** in your browser's localStorage
- No server-side database required
- Data persists between sessions
- Use Export/Import features to backup data

## Security

- Passwords are hashed using SHA-256 (client-side)
- Firebase Authentication available for cloud-based auth
- All data stored locally in browser
- HTTPS recommended for deployment
- CSP headers configured in netlify.toml

## Limitations

- Client-side only (no server-side processing)
- Data stored in browser localStorage (use export for backups)
- No real-time collaboration features
- Limited to single-device use unless using Firebase sync

## Deployment

### Netlify (Recommended)

The project includes full Netlify configuration:
- `netlify.toml` - Build and header configuration
- `_redirects` - SPA routing fallback
- `404.html` - Custom error page

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

### Other Hosting Options

Any static hosting service will work:
- GitHub Pages
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront
- Traditional web hosting

Simply upload all files to the hosting service's root directory.

## Development

### Local Development

1. Clone the repository
2. Open `index.html` in a browser
3. No build step required

### Making Changes

- Edit `index.html` for main application logic
- Modify styles in `<style>` tags or extract to separate CSS
- Test in multiple browsers

### Testing

- Manual testing in browser
- Check browser console for errors
- Test authentication flows
- Verify tax calculations against known values
- Test export functionality

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review browser console for error messages

## License

[Add your license information here]

## Acknowledgments

- Nigerian tax law reference materials
- Firebase for authentication infrastructure
- Netlify for hosting platform
- Open source libraries: jsPDF, SheetJS

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Full accounting and tax calculation features
- Firebase authentication integration
- Export to PDF/Excel/CSV
- Netlify deployment configuration

## Roadmap

Future enhancements may include:
- Multi-user collaboration
- Cloud data sync
- Mobile app
- Advanced reporting
- API integrations
- Automated tax filing

---

**Built with ❤️ for Nigerian businesses and tax professionals**
