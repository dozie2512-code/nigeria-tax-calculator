# Auth Front Page (Signup & Login)

This directory contains a standalone authentication front page for signup/login that posts to a backend API.

## Files

- `index.html` - Main HTML page with Login and Signup tabs
- `style.css` - Minimal, clean, mobile-friendly styles
- `app.js` - Authentication logic with SHA-256 password hashing

## How It Works

1. **Signup**: User submits username, email, and password
   - POST to `${API_BASE_URL}/api/auth/signup`
   - Request body: `{ username, email, password }` (password is SHA-256 hashed)

2. **Login**: User submits username and password
   - POST to `${API_BASE_URL}/api/auth/login`
   - Request body: `{ username, password }` (password is SHA-256 hashed)

3. **On Success**:
   - Auth token from response is stored in `localStorage` under key `ntc_auth_token`
   - User is redirected to `/dashboard.html`

## Configuration

Edit `app.js` and set the `API_BASE_URL` constant to your backend URL:

```javascript
const API_BASE_URL = "https://api.example.com"; // Your backend URL
```

Note: When `API_BASE_URL` is empty (default), requests will be made relative to the current origin.

## localStorage Token

The auth token is stored under the key `ntc_auth_token`. To retrieve it:

```javascript
const token = localStorage.getItem("ntc_auth_token");
```

## Redirect

On successful authentication, users are redirected to `/dashboard.html`. To change this, edit the `REDIRECT_URL` constant in `app.js`.

## Security Notes

- Passwords are hashed client-side using SHA-256 (Web Crypto API) before being sent
- Ensure your API allows CORS from the origin where you host this front end
- Use HTTPS in production to protect credentials
- The page is designed to work without a backend during development (uses placeholder API URL)
