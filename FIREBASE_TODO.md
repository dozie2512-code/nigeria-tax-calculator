# Firebase Configuration TODO

This file tracks the Firebase setup status for the Nigeria Tax Calculator project.

## Current Status: ⚠️ Configuration Incomplete

The Firebase integration has been prepared but requires manual setup to complete.

## What's Done ✅

- [x] Firebase SDK integrated in `index.html`
- [x] Authentication functions implemented
- [x] Configuration structure prepared
- [x] Comprehensive setup documentation created (`FIREBASE_SETUP.md`)
- [x] Testing tool created (`test-firebase-config.html`)
- [x] Fallback to local authentication implemented

## What's Needed ❌

- [ ] **Create Firebase Project** (requires Google account)
- [ ] **Enable Email/Password Authentication** in Firebase Console
- [ ] **Obtain Firebase Credentials** from project settings
- [ ] **Update `index.html`** with real credentials (line ~250)
- [ ] **Test Authentication** using `test-firebase-config.html`
- [ ] **Configure Security Rules** (if using Firestore/Storage)
- [ ] **Add Authorized Domains** for your deployment URL

## Quick Start Guide

### 1. Create Firebase Project (15 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "nigeria-tax-calculator" (or your preference)
4. Complete the project creation wizard

**Note:** You need a Google account. If you don't have one, create one first.

### 2. Enable Authentication (5 minutes)

1. In your Firebase project, click "Authentication"
2. Click "Get started" 
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

### 3. Get Your Configuration (5 minutes)

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the Web icon (`</>`)
4. Register app as "Nigeria Tax Calculator Web"
5. Copy the `firebaseConfig` object

### 4. Update the Code (2 minutes)

1. Open `index.html` in a text editor
2. Find the `firebaseConfig` object (around line 250)
3. Replace the placeholder values with your copied config
4. Save the file

**Example:**
```javascript
// BEFORE:
var firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  // ... other placeholders
};

// AFTER (with your real values):
var firebaseConfig = {
  apiKey: "AIzaSyBk7X2mR9vN4pL5wQ8tY6jK...",
  authDomain: "nigeria-tax-calc-2024.firebaseapp.com",
  projectId: "nigeria-tax-calc-2024",
  storageBucket: "nigeria-tax-calc-2024.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123...",
  measurementId: "G-MEASUREMENT123"
};
```

### 5. Test It (5 minutes)

1. Open `test-firebase-config.html` in your browser
2. Follow the on-screen tests
3. Try signing up with a test account
4. Verify all tests pass
5. Delete the test account from Firebase Console

### 6. Add Your Domain (2 minutes)

If deploying to a custom domain:

1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Enter your deployment URL (e.g., `myapp.netlify.app`)
5. Click "Add"

**Note:** `localhost` is already authorized by default for local testing.

## Troubleshooting

### "Firebase not configured" Error

**Cause:** Placeholder values still in `firebaseConfig`

**Solution:** 
1. Check `index.html` for placeholder text like "YOUR_FIREBASE_API_KEY_HERE"
2. Replace all placeholders with real values from Firebase Console
3. Save and refresh

### "auth/operation-not-allowed" Error

**Cause:** Email/Password authentication not enabled

**Solution:**
1. Go to Firebase Console → Authentication
2. Click "Sign-in method" tab
3. Enable "Email/Password"
4. Save changes

### "auth/unauthorized-domain" Error

**Cause:** Your deployment domain is not authorized

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"
3. Redeploy if necessary

### Can't Access Firebase Console

**Cause:** No Google account or account doesn't have access

**Solution:**
1. Create a Google account if needed
2. Or ask the project owner to:
   - Create the Firebase project
   - Share the credentials with you
   - Add you as a project member in IAM

## Additional Resources

- **Detailed Setup Guide:** See `FIREBASE_SETUP.md` for complete step-by-step instructions
- **Firebase Documentation:** https://firebase.google.com/docs/auth
- **Test Tool:** Open `test-firebase-config.html` in your browser to verify configuration
- **Support:** Email the repo owner or create a GitHub issue

## After Setup is Complete

Once Firebase is configured and working:

1. ✅ Mark this issue as complete
2. ✅ Delete or archive this `FIREBASE_TODO.md` file
3. ✅ Update the PROJECT INFORMATION comments in `index.html`
4. ✅ Consider deleting `test-firebase-config.html` (testing tool)
5. ✅ Configure Firestore/Storage security rules if using those services
6. ✅ Set up monitoring and alerts in Firebase Console
7. ✅ Review and update authentication emails/templates

## Security Checklist

Before going to production:

- [ ] Email/Password authentication is enabled
- [ ] Authorized domains are configured correctly
- [ ] Security rules are properly configured (if using Firestore/Storage)
- [ ] Test accounts are deleted from Firebase Console
- [ ] `test-firebase-config.html` is deleted from deployment
- [ ] Consider enabling App Check for additional security
- [ ] Set up Firebase usage alerts
- [ ] Review Firebase security best practices

---

**Last Updated:** December 14, 2025

**Status:** Awaiting Firebase project creation and credential update

**Contact:** Repository maintainer or create an issue on GitHub
