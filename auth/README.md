# Auth front page (signup & login)

This directory contains a standalone front page for signup/login that posts to a backend API.

## How it works
- Client sends JSON POST requests to API_BASE_URL + /api/auth/signup and /api/auth/login.
- Passwords are hashed client-side using SHA-256 before send.
- On success token is expected in the response as `token` and will be stored in localStorage under `ntc_auth_token`.
- After successful auth user is redirected to `/dashboard.html` by default.

## Configuration
- Edit `auth/js/auth.js` and set `API_BASE_URL` to your backend URL (for example `https://api.example.com`).
- If your backend expects raw passwords (not hashed), remove the sha256 step in `auth/js/auth.js`.

## CORS & Security
- Ensure your API allows CORS from the origin where you host this front end.
- Use HTTPS for production to protect credentials.
