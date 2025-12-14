# Deployment Guide - Nigeria Tax Calculator

This guide explains how to deploy the Nigeria Tax Calculator application to Netlify.

## Prerequisites

- A Netlify account (free tier works fine)
- A Firebase project (if using Firebase Authentication)
- Git repository connected to Netlify

## Quick Deployment to Netlify

### Option 1: Deploy via Netlify UI

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, etc.)
4. Select the `nigeria-tax-calculator` repository
5. Configure build settings:
   - **Build command**: Leave empty (or use: `echo 'No build required'`)
   - **Publish directory**: `.` (root directory)
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project directory
cd /path/to/nigeria-tax-calculator
netlify deploy --prod
```

## Firebase Configuration

The application uses Firebase Authentication. You have two options:

### Option 1: Use Environment Variables (Recommended for Production)

Set the following environment variables in your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important**: Browser-based applications cannot access `process.env` at runtime. To use environment variables, you need:
1. **Build-time injection**: Use a build script to replace placeholders with actual values
2. **Server-side rendering**: Use SSR to inject variables into HTML
3. **API endpoint**: Fetch config from a backend `/api/config` endpoint

For this static site, the easiest approach is hardcoding credentials (Option 2) with proper Firebase security rules.

### Option 2: Hardcode Credentials (Quick Start - Not Recommended for Production)

The current `index.html` has Firebase credentials hardcoded (lines 159-167). This works for quick deployment but is **not secure** for production environments.

**Security Best Practice**: 
- Never commit real Firebase credentials to public repositories
- Use Firebase security rules to restrict access
- Consider using environment variables or a build script

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → **Email/Password** sign-in method
3. Get your Firebase config from **Project Settings** → **General** → **Your apps**
4. Update the `firebaseConfig` object in `index.html` or set environment variables

### Firebase Security Rules

Set appropriate security rules in Firebase Console:

**Firestore Rules** (if using Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Authentication** is already configured in the app to use email/password.

## External Dependencies

The application uses the following CDN resources:

- **jsPDF** (2.5.1) - `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- **SheetJS** (0.18.5) - `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- **Firebase** (10.7.1) - `https://www.gstatic.com/firebasejs/10.7.1/*`

These are loaded from CDN for better performance and caching. The `netlify.toml` file includes appropriate Content-Security-Policy headers to allow these resources.

### Fallback Strategy (Optional)

For production environments with strict network policies, consider:

1. Download and self-host these libraries
2. Add fallback loading logic:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" 
        onerror="this.onerror=null; this.src='/vendor/jspdf.min.js'"></script>
```

## File Structure

```
nigeria-tax-calculator/
├── index.html              # Main application file
├── auth.html              # Authentication page
├── auth.css               # Authentication styles
├── auth.js                # Authentication logic
├── 404.html               # Error page
├── netlify.toml           # Netlify configuration
├── .gitignore             # Git ignore rules
├── DEPLOYMENT.md          # This file
├── auth/                  # Auth subdirectory
│   ├── index.html
│   └── README.md
└── functions/             # Firebase Cloud Functions (optional)
    ├── index.js
    ├── package.json
    └── .gitignore
```

## Netlify Configuration

The `netlify.toml` file includes:

- ✅ **Publish directory**: Set to `.` (root)
- ✅ **Redirects**: SPA fallback routing to `index.html`
- ✅ **Security headers**: X-Frame-Options, CSP, etc.
- ✅ **Cache headers**: Optimized caching for static assets
- ✅ **Content-Security-Policy**: Allows Firebase and CDN resources

## Troubleshooting

### Issue: "Build failed"

**Solution**: The site is static HTML. Ensure:
- Build command is empty or set to `echo 'No build required'`
- Publish directory is set to `.` (root)

### Issue: "Firebase not initialized"

**Solution**: Check that:
1. Firebase credentials are correct in `index.html`
2. Firebase Authentication is enabled in Firebase Console
3. Email/Password sign-in method is enabled

### Issue: "404 errors on refresh"

**Solution**: The `netlify.toml` redirects configuration handles this. Ensure:
- `netlify.toml` is in the root directory
- The redirect rule `from = "/*"` is present

### Issue: "External scripts blocked"

**Solution**: Check Content-Security-Policy headers in `netlify.toml`. The CSP should allow:
- `https://cdnjs.cloudflare.com`
- `https://www.gstatic.com`
- `https://*.firebaseapp.com`

### Issue: "CORS errors with Firebase"

**Solution**: 
1. Verify your Firebase project's authorized domains
2. Add your Netlify domain to Firebase Console: **Authentication** → **Settings** → **Authorized domains**

## Monitoring and Logs

- **Netlify Logs**: Available in Netlify dashboard under **Deploys** → Select a deploy → **Deploy log**
- **Browser Console**: Check for JavaScript errors
- **Firebase Console**: Monitor authentication events

## Performance Optimization

The deployment is already optimized with:

- ✅ Static HTML (no build step required)
- ✅ CDN-hosted libraries (jsPDF, SheetJS, Firebase)
- ✅ Cache headers for static assets (1 year)
- ✅ Gzip compression (handled by Netlify)

## Next Steps

After successful deployment:

1. ✅ Test authentication flow
2. ✅ Verify all external libraries load correctly
3. ✅ Check browser console for errors
4. ✅ Test on mobile devices
5. ✅ Add your Netlify domain to Firebase authorized domains
6. ✅ Consider setting up custom domain
7. ✅ Review and tighten Firebase security rules

## Support

For issues specific to:
- **Netlify**: [Netlify Documentation](https://docs.netlify.com/)
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **This project**: Open an issue in the GitHub repository

## Security Checklist

- [ ] Firebase credentials secured (environment variables or restricted)
- [ ] Firebase security rules configured
- [ ] Authorized domains added in Firebase Console
- [ ] CSP headers properly configured
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] No sensitive data in client-side code
