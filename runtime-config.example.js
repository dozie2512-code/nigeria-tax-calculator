// runtime-config.example.js
// Copy this to runtime-config.js during deployment and fill in real values (do NOT commit runtime-config.js)
window.RUNTIME_CONFIG = {
  // Enable Firebase only when you provide a valid firebaseConfig at deploy time
  FIREBASE_ENABLED: false,

  // Optional: override localStorage key used by the app
  STORAGE_KEY: "ntc_full_accounting_v2",

  // Firebase config — leave empty in public repos. Fill from secret store at deploy time.
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};
