# Authentication Documentation

## Overview

The Nigeria Tax Calculator uses **Firebase Authentication** as the primary authentication method, with a local fallback for development and testing purposes.

## Authentication Architecture

### Primary Method: Firebase Authentication

The application uses Firebase Authentication (Firebase compat SDK v10.7.1) for secure user authentication. Firebase handles:

- User registration with email/password
- User login with email/password
- Password reset via email
- Session management
- Token-based authentication

**Location:** Integrated directly in `index.html` (Firebase Configuration section)

**Features:**
- Secure credential storage (managed by Firebase)
- Password reset functionality via hosted Firebase pages
- Automatic session persistence
- Integration with Firebase security rules

### Fallback Method: Local Prototype Authentication

For development, testing, and offline scenarios, a local authentication system is available in `auth.js`. This system:

- Stores user credentials in localStorage
- Uses SHA-256 hashing for password security
- Provides a simple demo account feature
- Should NOT be used in production

**Location:** `auth.js` (root directory)

**Note:** This is only active when Firebase is disabled or not configured.

## Configuration

### Enabling Firebase Authentication

Firebase Authentication is enabled by default. Configuration is in `index.html`:

```javascript
// Set to true to enable Firebase Authentication
var FIREBASE_ENABLED = true;

// Firebase web config
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

### Setting Up Firebase Authentication

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one

2. **Enable Email/Password Authentication:**
   - Navigate to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Save changes

3. **Add Authorized Domains:**
   - Go to Authentication → Settings → Authorized domains
   - Add your deployment domain (e.g., `yourdomain.com`)
   - For Netlify: Add your Netlify URL (e.g., `your-app.netlify.app`)

4. **Get Your Configuration:**
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Copy the Firebase configuration object
   - Replace the values in `firebaseConfig` in `index.html`

5. **Configure Security Rules:**
   - Set up Firestore security rules to control data access
   - Example rules are provided in the Firebase Console

### For Production: Using Environment Variables

**Important:** For production deployments, avoid hardcoding credentials in `index.html`.

#### Option 1: Build-Time Injection (Recommended)

Use a build script to inject environment variables:

```bash
# Example using sed
sed -i "s/YOUR_API_KEY/${FIREBASE_API_KEY}/g" index.html
sed -i "s/YOUR_AUTH_DOMAIN/${FIREBASE_AUTH_DOMAIN}/g" index.html
# ... repeat for other variables
```

#### Option 2: Netlify Environment Variables

1. Go to Netlify Dashboard → Site settings → Environment variables
2. Add the following variables:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

3. Use a build script or plugin to inject these into your HTML during build

### Disabling Firebase Authentication

To use only local prototype authentication:

```javascript
// In index.html
var FIREBASE_ENABLED = false;
```

## Security Considerations

### Firebase Authentication Security

✅ **Secure:**
- Credentials are managed by Firebase (not stored in browser)
- Passwords are hashed and salted by Firebase servers
- Session tokens are automatically managed
- Password reset uses Firebase hosted pages
- Protected by Firebase security rules

⚠️ **Important:**
- Firebase config in `index.html` is visible to users (this is normal for client-side Firebase)
- Use Firebase security rules to protect your data
- Never expose Firebase Admin SDK credentials in client code
- For sensitive operations, use Firebase Cloud Functions

### Local Prototype Authentication Security

⚠️ **Limited Security:**
- Passwords are hashed with SHA-256 (client-side only)
- Credentials stored in localStorage (accessible to JavaScript)
- No server-side validation
- Suitable for development/testing ONLY

❌ **Do NOT use in production:**
- localStorage can be accessed by any JavaScript on the domain
- SHA-256 alone is not suitable for password hashing in production
- No rate limiting or brute force protection

## API Functions

### Firebase Authentication Functions

These functions are available globally in `index.html`:

#### `isFirebaseAuthEnabled()`
Returns `true` if Firebase Authentication is configured and enabled.

#### `firebaseSignUp(email, password)`
Creates a new user account.
- **Parameters:** email (string), password (string)
- **Returns:** Promise with `{success: boolean, user?: object, error?: string}`

#### `firebaseSignIn(email, password)`
Signs in an existing user.
- **Parameters:** email (string), password (string)
- **Returns:** Promise with `{success: boolean, user?: object, error?: string}`

#### `firebaseSignOut()`
Signs out the current user.
- **Returns:** Promise with `{success: boolean, error?: string}`

#### `firebaseSendPasswordReset(email)`
Sends a password reset email.
- **Parameters:** email (string)
- **Returns:** Promise with `{success: boolean, error?: string}`

#### `getFirebaseCurrentUser()`
Gets the currently authenticated Firebase user.
- **Returns:** Firebase user object or null

#### `mapLocalUserToFirebaseUid(localUserId, firebaseUid)`
Maps a local user ID to a Firebase UID for data synchronization.

### Local Authentication Functions

These functions are in `auth.js`:

#### User Registration
Handled by the signup form in the pre-login overlay.

#### User Login
Handled by the login form in the pre-login overlay.

#### Demo Account
Automatically creates a demo account with username `demo` and password `demo123`.

## User Flow

### Sign Up Flow (Firebase Enabled)

1. User enters name, username, email, and password in signup form
2. Client validates input (password length, email format)
3. Firebase `createUserWithEmailAndPassword()` is called
4. If successful:
   - Firebase user is created
   - User is prompted to select entity type (Individual/Enterprise/Company)
   - Local app state is created and linked to Firebase UID
   - User is redirected to main application
5. If failed:
   - Error message is displayed (email already exists, weak password, etc.)

### Sign In Flow (Firebase Enabled)

1. User enters email/username and password
2. Firebase `signInWithEmailAndPassword()` is called
3. If successful:
   - Firebase session is established
   - Local user data is loaded based on Firebase UID
   - User is redirected to main application
4. If failed:
   - Error message is displayed

### Password Reset Flow

1. User clicks "Forgot Password?" link
2. User enters their email address
3. `firebaseSendPasswordReset()` is called
4. Firebase sends reset email with hosted reset page
5. User follows link in email to reset password on Firebase page
6. User can then log in with new password

### Fallback Flow (Firebase Disabled)

1. Uses localStorage-based authentication
2. Passwords hashed with SHA-256 before storage
3. Simple validation against stored credentials
4. Session managed via localStorage token

## Data Synchronization

### Firebase UID Mapping

When a user signs up or logs in with Firebase, their Firebase UID is mapped to their local user ID:

```javascript
// After Firebase signup/login
mapLocalUserToFirebaseUid(localUserId, firebaseUser.uid);
```

This allows the application to:
- Load the correct user data from localStorage based on Firebase session
- Maintain data persistence across devices (when combined with Firestore)
- Keep local prototype features working with Firebase authentication

### State Management

User data is stored in localStorage under `ntc_full_accounting_v2` with structure:

```javascript
{
  users: [
    {
      id: "usr_abc123",
      name: "User Name",
      email: "user@example.com",
      firebaseUid: "firebase_uid_xyz", // Links to Firebase user
      // ... other user data
    }
  ],
  businesses: [...],
  transactions: {...},
  // ... other app state
}
```

## Error Handling

### Common Firebase Auth Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/email-already-in-use` | Email is already registered | Use different email or sign in |
| `auth/invalid-email` | Email format is invalid | Check email format |
| `auth/weak-password` | Password too weak (< 6 chars) | Use stronger password |
| `auth/user-not-found` | No account with this email | Check email or sign up |
| `auth/wrong-password` | Incorrect password | Check password or reset |
| `auth/too-many-requests` | Too many failed attempts | Wait and try again later |
| `auth/network-request-failed` | Network error | Check internet connection |

All errors are handled and displayed to the user with friendly messages.

## Testing

### Testing with Local Authentication

1. Set `FIREBASE_ENABLED = false` in `index.html`
2. Refresh the application
3. Use any username/password to create test accounts
4. Data persists in localStorage

### Testing with Firebase Authentication

1. Set up a Firebase test project
2. Configure Firebase credentials in `index.html`
3. Enable Email/Password authentication in Firebase Console
4. Test signup, login, and password reset flows
5. Check Firebase Console to verify users are created

### Demo Account

A quick demo account is available when using local authentication:
- Username: `demo`
- Password: `demo123`

Click "Demo account" button on login page to auto-login.

## Migration Guide

### Migrating from Local to Firebase Authentication

If you have existing users in localStorage (local auth), you'll need to:

1. Export user data from localStorage
2. Create Firebase accounts for existing users using Firebase Admin SDK
3. Map Firebase UIDs to local user IDs
4. Update user documents in localStorage with `firebaseUid` field

**Note:** Password migration is not possible as local passwords are hashed differently. Users will need to reset passwords or you'll need to set temporary passwords.

### Migrating from API-based to Firebase Authentication

The API-based authentication system (`/auth/` directory) has been removed in favor of Firebase. If you were using the API system:

1. Export user accounts from your backend
2. Create Firebase accounts using Firebase Admin SDK
3. Update client code to use Firebase functions
4. Remove all references to old API endpoints

## Troubleshooting

### Firebase Not Initializing

**Symptoms:** Error in console: "Firebase initialization failed"

**Solutions:**
1. Check that `firebaseConfig` has valid values
2. Verify Firebase SDK scripts are loaded (check browser console)
3. Check internet connectivity
4. Verify Firebase project is active

### "Failed to create user" Error

**Solutions:**
1. Check Firebase Console → Authentication is enabled
2. Verify Email/Password provider is enabled
3. Check if email is already registered
4. Verify password meets minimum requirements (6+ characters)

### "Unauthorized domain" Error

**Solutions:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to Authorized domains list
3. Include `localhost` for local development

### Users Can't Log In

**Solutions:**
1. Check Firebase Console to verify user exists
2. Verify email and password are correct
3. Check for error messages in browser console
4. Ensure Firebase Authentication is enabled

### Local Auth Not Working

**Solutions:**
1. Check that `FIREBASE_ENABLED = false`
2. Verify `auth.js` is loaded
3. Check browser localStorage is not disabled
4. Clear localStorage and try again

## Best Practices

### Security

1. ✅ Use Firebase Authentication for production
2. ✅ Keep Firebase credentials in environment variables for CI/CD
3. ✅ Configure Firebase security rules to protect user data
4. ✅ Use HTTPS for all deployments
5. ❌ Don't expose Firebase Admin SDK credentials in client code
6. ❌ Don't use local authentication in production

### User Experience

1. ✅ Provide clear error messages
2. ✅ Show loading states during authentication
3. ✅ Implement password reset functionality
4. ✅ Validate input before submission
5. ✅ Use autocomplete attributes for better browser integration

### Development

1. ✅ Use Firebase emulator for local development
2. ✅ Keep authentication logic separate from business logic
3. ✅ Test authentication flows regularly
4. ✅ Document any custom authentication logic
5. ✅ Use version control for configuration changes

## Related Documentation

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- `functions/README.md` - Firebase Cloud Functions for payment processing
- `README.md` - General application documentation

## Support

For authentication issues:
1. Check Firebase Console for user status
2. Review browser console for error messages
3. Verify Firebase configuration is correct
4. Check Firebase Authentication quotas and limits
5. Contact Firebase Support for Firebase-specific issues

For application-specific issues, contact the development team.
