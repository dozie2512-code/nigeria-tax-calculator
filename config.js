/**
 * Firebase Configuration
 * 
 * IMPORTANT: This file contains placeholder Firebase configuration.
 * In production, replace these values with your actual Firebase project credentials.
 * 
 * For better security:
 * 1. Use environment variables in your deployment platform (Netlify, Vercel, etc.)
 * 2. Configure Firebase App Check for additional security
 * 3. Set up proper Firebase Security Rules
 * 4. Restrict API key usage in Firebase Console
 */

// Firebase configuration - Replace with your actual values or use environment variables
const firebaseConfig = {
  apiKey: window.ENV?.FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: window.ENV?.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: window.ENV?.FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Firebase Authentication is always enabled
const FIREBASE_ENABLED = true;
