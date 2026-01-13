/**
 * Firebase Configuration and Authentication Module
 * 
 * Firebase Authentication is the primary authentication method.
 * Email/Password authentication must be enabled in Firebase Console:
 * Authentication → Sign-in method → Email/Password
 * 
 * Update firebaseConfig values with your Firebase project credentials.
 */

// Firebase Authentication is always enabled
var FIREBASE_ENABLED = true;

/**
 * Firebase web configuration
 * 
 * SECURITY NOTE: In production, consider moving these credentials to:
 * - Environment variables (for server-side rendering)
 * - A separate config file excluded from version control
 * - A secure configuration service
 * 
 * These keys are for client-side Firebase SDK and are designed to be included
 * in client code. Security rules in Firebase Console control access to resources.
 * Ensure proper Firebase Security Rules are configured for your project.
 */
var firebaseConfig = {
  apiKey: "AIzaSyDyLT58G18M7XPNLd3J6YnAMnLcKeEPmto",
  authDomain: "aaaa-b8178.firebaseapp.com",
  projectId: "aaaa-b8178",
  storageBucket: "aaaa-b8178.firebasestorage.app",
  messagingSenderId: "313899934004",
  appId: "1:313899934004:web:cb2b729fb3b42c57e00561",
  measurementId: "G-X18YDSXSZV"
};

// Firebase initialization (only if configured)
var firebaseApp = null;
var firebaseAuth = null;

/**
 * Check if firebaseConfig is defined and has required properties
 * @returns {boolean} True if config is valid
 */
function isFirebaseConfigValid() {
  return typeof firebaseConfig !== 'undefined' && 
         firebaseConfig !== null &&
         typeof firebaseConfig.apiKey === 'string' &&
         typeof firebaseConfig.authDomain === 'string' &&
         typeof firebaseConfig.projectId === 'string';
}

// Initialize Firebase on load
if (FIREBASE_ENABLED && isFirebaseConfigValid()) {
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    console.log('Firebase Authentication initialized successfully');
  } catch (e) {
    console.error('Firebase initialization failed:', e.message);
    alert('Authentication system unavailable. Please check your internet connection or contact support.');
    FIREBASE_ENABLED = false;
  }
} else if (FIREBASE_ENABLED) {
  console.error('Firebase configuration is invalid. Please verify your Firebase settings.');
  alert('Authentication configuration error. Please contact support.');
}

/**
 * Check if Firebase Authentication is available and enabled
 * @returns {boolean}
 */
function isFirebaseAuthEnabled() {
  return FIREBASE_ENABLED && firebaseAuth !== null;
}

/**
 * Firebase Sign Up with Email/Password
 * Creates a new Firebase user and maps to local app state
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
async function firebaseSignUp(email, password) {
  if (!isFirebaseAuthEnabled()) {
    return { success: false, error: 'Firebase not configured' };
  }
  
  try {
    var userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    var user = userCredential.user;
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    var errorMessage = 'Sign up failed';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak (min 6 characters)';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password sign up is not enabled';
        break;
      default:
        errorMessage = error.message || 'Sign up failed';
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Firebase Sign In with Email/Password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
async function firebaseSignIn(email, password) {
  if (!isFirebaseAuthEnabled()) {
    return { success: false, error: 'Firebase not configured' };
  }
  
  try {
    var userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    var user = userCredential.user;
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    var errorMessage = 'Sign in failed';
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Invalid credentials';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message || 'Sign in failed';
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Firebase Sign Out
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function firebaseSignOut() {
  if (!isFirebaseAuthEnabled()) {
    return { success: false, error: 'Firebase not configured' };
  }
  
  try {
    await firebaseAuth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Sign out failed' };
  }
}

/**
 * Firebase Send Password Reset Email
 * Uses Firebase's hosted password reset page
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function firebaseSendPasswordReset(email) {
  if (!isFirebaseAuthEnabled()) {
    return { success: false, error: 'Firebase not configured' };
  }
  
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    var errorMessage = 'Password reset failed';
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later';
        break;
      default:
        errorMessage = error.message || 'Password reset failed';
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Get current Firebase user
 * @returns {object|null} Firebase user object or null
 */
function getFirebaseCurrentUser() {
  if (!isFirebaseAuthEnabled()) {
    return null;
  }
  return firebaseAuth.currentUser;
}

/**
 * Maps Firebase UID to local app user ID
 * Used to associate localStorage data with Firebase user
 * @param {string} firebaseUid - Firebase user UID
 * @returns {string|null} Local user ID or null
 */
function getLocalUserIdFromFirebaseUid(firebaseUid) {
  var storageKey = (typeof STORAGE_KEY !== 'undefined') ? STORAGE_KEY : 'ntc_full_accounting_v2';
  try {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    var state = JSON.parse(raw);
    var user = (state.users || []).find(function(u) { return u.firebaseUid === firebaseUid; });
    return user ? user.id : null;
  } catch (e) {
    return null;
  }
}

/**
 * Maps local user ID to Firebase UID in state
 * @param {string} localUserId - Local app user ID
 * @param {string} firebaseUid - Firebase user UID
 */
function mapLocalUserToFirebaseUid(localUserId, firebaseUid) {
  var storageKey = (typeof STORAGE_KEY !== 'undefined') ? STORAGE_KEY : 'ntc_full_accounting_v2';
  try {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return;
    var appState = JSON.parse(raw);
    var user = (appState.users || []).find(function(u) { return u.id === localUserId; });
    if (user) {
      user.firebaseUid = firebaseUid;
      localStorage.setItem(storageKey, JSON.stringify(appState));
    }
  } catch (e) {
    console.warn('Failed to map local user to Firebase UID:', e);
  }
}
