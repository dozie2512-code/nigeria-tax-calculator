/**
 * Firebase Configuration - Example File
 *
 * Copy this file to config.js and fill in your Firebase project credentials.
 * config.js is gitignored; never commit real credentials to source control.
 *
 * HOW TO GET THESE VALUES:
 * 1. Go to https://console.firebase.google.com
 * 2. Select your project → Project Settings → Your apps → Web app
 * 3. Copy the firebaseConfig object shown there
 *
 * REQUIRED FIREBASE SETUP:
 * - Enable Email/Password authentication in Authentication → Sign-in method
 * - Create a Firestore database in Firestore Database → Create database
 * - Deploy firestore.rules (see PRODUCTION.md)
 */
window.__FIREBASE_CONFIG__ = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"   // optional
};
