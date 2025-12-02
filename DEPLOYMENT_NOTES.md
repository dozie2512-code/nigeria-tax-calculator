# Deployment Notes — DigitalOcean App Platform

This guide explains how to deploy the Nigeria Accounting & Tax Engine with the Copilot Chat Assistant on DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account
2. An OpenAI API key (get one at https://platform.openai.com/api-keys)
3. This repository connected to your DigitalOcean account

## Deployment Steps

### 1. Connect Repository

1. Log in to DigitalOcean and navigate to **App Platform**
2. Click **Create App**
3. Select **GitHub** as the source
4. Authorize DigitalOcean to access your repositories
5. Select this repository (`nigeria-tax-calculator`)
6. Choose the `main` branch

### 2. Configure Build & Run Settings

- **Build Command**: `npm install` (or leave empty; DigitalOcean auto-detects Node.js apps)
- **Run Command**: `npm start`
- **HTTP Port**: `3000` (or configure via the PORT environment variable)

### 3. Set Environment Variables

In the App Platform settings, add the following environment variable:

| Key              | Value                        | Encrypt |
|------------------|------------------------------|---------|
| `OPENAI_API_KEY` | `sk-your-openai-api-key`     | Yes     |

> ⚠️ **Security Note**: Always encrypt your API key. Never commit API keys to source control.

### 4. Deploy

Click **Deploy** and wait for the build to complete. Once deployed, your app will be accessible at the provided URL.

## Local Development

To run the app locally:

```bash
# Install dependencies
npm install

# Start the server (with your API key)
OPENAI_API_KEY=sk-your-key npm start
```

The app will be available at http://localhost:3000

## Features

- **Static Site**: The original `index.html` and associated assets are served from the root
- **Chat Assistant**: A floating chat widget (bottom-right corner) provides AI-powered assistance
- **API Endpoint**: `POST /api/assistant` accepts `{ message, context }` and returns `{ reply }`

## Security Notes

1. **Never commit API keys** to the repository
2. API keys are stored server-side only — they are never exposed to the client
3. Use environment variables for all sensitive configuration
4. Enable encryption for environment variables in DigitalOcean App Platform

## Troubleshooting

- **Chat widget not responding**: Check that `OPENAI_API_KEY` is set correctly
- **500 errors**: Review the app logs in DigitalOcean for detailed error messages
- **Port issues**: Ensure the `PORT` environment variable matches your configuration (default: 3000)
