# Deployment

This document explains how to deploy the Firebase Cloud Functions and Firestore rules for the Nigeria Tax Calculator project, and how to set up a GitHub Actions workflow to automate deployment.

WARNING: Never commit API keys, service account keys, or other secrets to the repository. Store secrets only in your environment or GitHub repository secrets.

Prerequisites
- Node.js 18+ and npm
- Firebase CLI (install globally):
  npm install -g firebase-tools
- Access to the Firebase project you will deploy to (you must be a project owner or have deploy permissions)

Local manual deployment
1. Authenticate the Firebase CLI (interactive):
   firebase login

2. Choose or add the Firebase project for this repository (creates .firebaserc):
   firebase use --add
