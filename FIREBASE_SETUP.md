# Firebase Setup Guide for Nigeria Tax Calculator

This guide will help you set up Firebase Authentication for the Nigeria Tax Calculator application.

## Prerequisites

- A Google account
- Access to the [Firebase Console](https://console.firebase.google.com/)
- Basic understanding of Firebase Authentication

## Step-by-Step Setup

### 1. Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `nigeria-tax-calculator` (or your preferred name)
4. Click **"Continue"**
5. (Optional) Enable Google Analytics
   - Choose to enable or disable Google Analytics
   - If enabled, select or create an Analytics account
6. Click **"Create project"**
7. Wait for the project to be created (this may take a minute)
8. Click **"Continue"** when done

### 2. Enable Email/Password Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"** if this is your first time
3. Click on the **"Sign-in method"** tab
4. Find **"Email/Password"** in the list of providers
5. Click on **"Email/Password"**
6. Toggle the **"Enable"** switch to ON
7. Click **"Save"**

**Note:** Do NOT enable "Email link (passwordless sign-in)" unless specifically needed.

### 3. Register Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `Nigeria Tax Calculator Web`
5. (Optional) Check "Also set up Firebase Hosting" if you plan to use Firebase Hosting
6. Click **"Register app"**
7. You'll see a `firebaseConfig` object - **COPY THIS** (you'll need it in step 5)
8. Click **"Continue to console"**

The config object will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:...",
  measurementId: "G-..."
};
```

### 4. Configure Authorized Domains

1. Still in **Authentication**, click on the **"Settings"** tab
2. Scroll to **"Authorized domains"**
3. By default, `localhost` and your Firebase project domains are authorized
4. Add your deployment domain (e.g., `your-app.netlify.app`)
5. Click **"Add domain"** and enter your domain
6. Click **"Add"**

**Important:** Users will only be able to sign in from authorized domains.

### 5. Update the Application Code

1. Open `index.html` in your code editor
2. Find the `firebaseConfig` object (around line 250)
3. Replace the entire `firebaseConfig` object with the one you copied in Step 3
4. Ensure `FIREBASE_ENABLED` is set to `true` (should be by default)
5. Save the file

Example update:
```javascript
// Before:
var firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER.firebaseapp.com",
  // ... other placeholder values
};

// After (with your actual values):
var firebaseConfig = {
  apiKey: "AIzaSyBk7X2mR9vN4pL5wQ8tY6jK3fH1nE9sC2D",
  authDomain: "nigeria-tax-calc-2024.firebaseapp.com",
  projectId: "nigeria-tax-calc-2024",
  storageBucket: "nigeria-tax-calc-2024.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl012",
  measurementId: "G-NTCPROD2024"
};
```

### 6. Test the Authentication

1. Deploy or run your application locally
2. Open the application in your browser
3. Try to sign up with a test email and password
4. Check Firebase Console → Authentication → Users
5. You should see your test user listed
6. Try logging in with the same credentials
7. Verify that logout works correctly

### 7. Configure Security Rules (Important!)

Since this is a client-side app, you need to configure Firestore and Storage security rules if you plan to use those services:

#### Firestore Rules (if using Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Storage Rules (if using Cloud Storage):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can upload/read their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### "Firebase not configured" error
- Check that `FIREBASE_ENABLED` is set to `true`
- Verify that all `firebaseConfig` values are correctly set
- Check browser console for specific error messages

### "auth/unauthorized-domain" error
- Add your domain to **Authorized domains** in Firebase Console
- Make sure you're not using an IP address (use localhost for local testing)

### "auth/api-key-not-valid" error
- Double-check that you copied the API key correctly
- Ensure there are no extra spaces or quotes
- Verify the API key in Firebase Console → Project Settings

### Users can't sign up
- Verify Email/Password authentication is enabled
- Check Firebase Console → Authentication → Users for error logs
- Review browser console for specific error messages

### "auth/network-request-failed" error
- Check your internet connection
- Verify Firebase CDN URLs are accessible
- Check for browser extensions blocking requests

## Security Best Practices

1. **API Keys are Safe in Client Code**
   - Firebase API keys are designed to be public
   - They identify your project, not secure it
   - Real security comes from Authentication + Security Rules

2. **Never Disable Authentication**
   - Always require authentication in Security Rules
   - Don't allow unrestricted read/write access
   - Review Security Rules regularly

3. **Monitor Your Usage**
   - Check Firebase Console regularly
   - Set up budget alerts
   - Monitor Authentication logs for suspicious activity

4. **Consider App Check** (for production)
   - Adds additional security against abuse
   - Protects against unauthorized clients
   - See [Firebase App Check documentation](https://firebase.google.com/docs/app-check)

5. **Keep Dependencies Updated**
   - Update Firebase SDK versions periodically
   - Check for security advisories
   - Test thoroughly after updates

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Quotas and Limits](https://firebase.google.com/docs/auth/limits)
- [Firebase Pricing](https://firebase.google.com/pricing)

## Support

For issues specific to this application:
- Check the application's README.md
- Review the inline code comments in index.html
- Contact the repository maintainer

For Firebase-specific issues:
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase tag](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community Slack](https://firebase.community/)

---

Last Updated: December 14, 2024
