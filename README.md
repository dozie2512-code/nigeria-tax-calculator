# Nigeria Tax Calculator (Taxmax)

A comprehensive web-based accounting and tax management system for Nigerian businesses, supporting multiple entity types, tax calculations, and Firebase authentication.

## Project Structure

```
nigeria-tax-calculator/
├── index.html          # Main HTML file (790 lines - refactored)
├── styles.css          # Application styles (825 lines)
├── firebase-auth.js    # Firebase authentication module (259 lines)
├── app.js             # Main application logic (5,763 lines)
├── auth/              # Authentication related files
├── functions/         # Backend functions
└── README.md          # This file
```

## Recent Refactoring (January 2026)

The application was recently refactored to follow modern web development best practices:

### Separation of Concerns
- **CSS Extraction**: All styles moved from inline `<style>` blocks to `styles.css`
- **JavaScript Modularization**: 
  - Firebase authentication logic → `firebase-auth.js`
  - Main application logic → `app.js`
- **HTML Cleanup**: Reduced from 6,931 lines to 790 lines (88% reduction)

### Accessibility Improvements
- Added ARIA labels to all interactive elements
- Implemented proper ARIA roles (`role="tab"`, `role="navigation"`, etc.)
- Added `aria-selected`, `aria-controls`, and `aria-labelledby` attributes
- Included `aria-live="polite"` for dynamic content updates
- Added `aria-required` to form fields

### Semantic HTML
- Replaced generic `<div>` elements with semantic HTML5 tags:
  - `<header role="banner">` for page header
  - `<nav role="navigation">` for navigation controls
  - `<main role="main">` for main content
  - `<section role="tabpanel">` for tab panels
  - `<footer role="contentinfo">` for footer
- Added proper `for` attributes to all `<label>` elements

### Performance Optimization
- External CSS file enables browser caching
- Modular JavaScript allows for better code splitting
- Reduced initial HTML file size for faster page load

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Firebase project with Email/Password authentication enabled

### Configuration
1. Update Firebase credentials in `firebase-auth.js`:
   ```javascript
   var firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     // ... other config
   };
   ```

2. Enable Email/Password authentication in Firebase Console:
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider

### Running Locally
Simply serve the files using any HTTP server:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080/index.html`

## Features

### Multi-Entity Support
- Individual
- Enterprise (formerly Sole Proprietor)
- Company

### Tax Calculations
- VAT (Value Added Tax)
- WHT (Withholding Tax)
- PAYE (Pay As You Earn)
- PIT (Personal Income Tax)
- CIT (Company Income Tax)
- CGT (Capital Gains Tax)

### Accounting Features
- Multi-user, multi-business management
- Transaction ledger with comprehensive filtering
- Inventory tracking
- Asset management with depreciation
- Account categorization
- Receipt attachments
- Audit trail

### Authentication
- Firebase-based email/password authentication
- Secure user management
- Password reset functionality
- Session management

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Data Storage
Application data is stored in browser's localStorage under the key `ntc_full_accounting_v2`.

## License
[Add your license information here]

## Contributing
[Add contribution guidelines here]

## Support
For issues and support, please contact [add contact information].
