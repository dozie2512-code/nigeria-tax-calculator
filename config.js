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
  apiKey: window.ENV?.FIREBASE_API_KEY || "AIzaSyDyLT58G18M7XPNLd3J6YnAMnLcKeEPmto",
  authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "aaaa-b8178.firebaseapp.com",
  projectId: window.ENV?.FIREBASE_PROJECT_ID || "aaaa-b8178",
  storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "aaaa-b8178.firebasestorage.app",
  messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "313899934004",
  appId: window.ENV?.FIREBASE_APP_ID || "1:313899934004:web:cb2b729fb3b42c57e00561",
  measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || "G-X18YDSXSZV"
};

// Firebase Authentication is always enabled
const FIREBASE_ENABLED = true;
