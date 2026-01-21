# Nigeria Tax Calculator

A comprehensive web-based tax calculator and accounting system for Nigerian businesses.

## Features

- Multi-user, multi-business accounting
- Transaction tracking (income, expenses, inventory)
- Tax calculations (VAT, WHT, PAYE, PIT, CGT, CIT)
- Asset management with depreciation
- Financial reports and summaries
- Firebase Authentication integration
- Secure file upload for receipts

## Security Features

- Input sanitization to prevent XSS attacks
- File upload validation (types: JPG, PNG, PDF; max size: 5MB)
- Environment-based configuration for sensitive data
- Secure password hashing using SHA-256
- Firebase Authentication for user management

## Setup

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in Authentication → Sign-in method
3. Copy your Firebase configuration values
4. Configure your Firebase credentials:

**Option A: Environment Variables (Recommended for production)**
```javascript
// In your hosting platform (Netlify, Vercel, etc.)
window.ENV = {
  FIREBASE_API_KEY: 'your-api-key',
  FIREBASE_AUTH_DOMAIN: 'your-project-id.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'your-project-id',
  FIREBASE_STORAGE_BUCKET: 'your-project-id.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id',
  FIREBASE_APP_ID: 'your-app-id',
  FIREBASE_MEASUREMENT_ID: 'your-measurement-id'
};
```

**Option B: Direct Configuration (For development)**
Edit `config.js` and replace the placeholder values with your actual Firebase credentials.

### 2. File Structure

```
/
├── index.html           # Main HTML file
├── styles.css          # All CSS styles
├── main.js             # Application logic
├── config.js           # Firebase configuration
├── plans-config.js     # Pricing plans configuration
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### 3. Local Development

1. Clone the repository
2. Configure Firebase credentials in `config.js` or use environment variables
3. Run a local web server:
   ```bash
   python3 -m http.server 8080
   ```
4. Open http://localhost:8080 in your browser

### 4. Deployment

#### Netlify
1. Connect your repository to Netlify
2. Set build command: (none needed - static site)
3. Set publish directory: `/`
4. Add environment variables in Netlify dashboard

#### Vercel
1. Connect your repository to Vercel
2. No build configuration needed
3. Add environment variables in Vercel dashboard

#### Firebase Hosting
```bash
cd functions
npm install
firebase deploy
```

## Security Best Practices

1. **Never commit credentials**: Keep `config.js` with placeholder values in the repository
2. **Use environment variables**: Configure actual credentials via your hosting platform
3. **Enable Firebase App Check**: Additional layer of security for Firebase services
4. **Set Firebase Security Rules**: Restrict database and storage access appropriately
5. **Restrict API keys**: Configure API key restrictions in Firebase Console

## File Upload Validation

The application validates file uploads for receipts:
- **Allowed types**: JPG, JPEG, PNG, PDF
- **Maximum size**: 5MB
- Invalid files are rejected with a user-friendly error message

## Accessibility

The application includes accessibility features:
- Proper `for` attributes on form labels
- Enhanced focus styling for keyboard navigation
- Screen reader support
- Semantic HTML structure

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## License

Proprietary - All rights reserved

## Support

For support and questions, contact: [support contact information]
