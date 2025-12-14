# Netlify Quick Start Guide

Get your Nigeria Tax Calculator deployed on Netlify in minutes!

## 🚀 5-Minute Deployment

### Step 1: Sign Up for Netlify
1. Go to [netlify.com](https://www.netlify.com/)
2. Click "Sign up" and connect your GitHub account

### Step 2: Deploy This Repository
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **GitHub** as your Git provider
3. Select the `nigeria-tax-calculator` repository
4. Configure build settings:
   - **Build command**: Leave empty (or: `echo 'Static site'`)
   - **Publish directory**: `.` (just a dot)
   - Click **"Deploy site"**

### Step 3: Wait for Deployment
- Netlify will deploy your site automatically
- This usually takes 30-60 seconds
- You'll get a URL like `https://random-name-123.netlify.app`

### Step 4: Test Your Site
1. Click the generated URL
2. You should see the Nigeria Tax Calculator login screen
3. Try creating an account and logging in

## ✅ What's Already Configured

The repository includes everything needed for Netlify:

- ✅ `netlify.toml` - Build and deployment configuration
- ✅ `_redirects` - SPA routing fallback
- ✅ `404.html` - Custom error page
- ✅ Security headers configured
- ✅ Firebase integration ready

## 🔧 Optional: Custom Domain

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

## 🔐 Optional: Firebase Authentication

If you want to use Firebase authentication:

### Quick Setup (for testing):
The app already has Firebase credentials hardcoded. Just:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Authentication** → **Email/Password**
3. Add your Netlify URL to **Authorized domains**
4. Update `firebaseConfig` in `index.html` with your credentials

### Secure Setup (for production):
1. Go to Netlify **Site settings** → **Environment variables**
2. Add Firebase credentials as environment variables
3. Modify `index.html` to use environment variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Firebase setup.

## 🎯 Quick Troubleshooting

### Problem: Build Failed
**Solution**: 
- Ensure build command is empty or `echo 'Static site'`
- Ensure publish directory is `.` (just a dot)
- Check Netlify deploy logs for errors

### Problem: 404 Error on Refresh
**Solution**: 
- The `_redirects` file should handle this automatically
- Verify `_redirects` file exists in root directory
- Check it contains: `/*    /index.html   200`

### Problem: Firebase Not Working
**Solution**: 
1. Check browser console for errors
2. Verify Firebase credentials in `index.html`
3. Ensure Email/Password auth is enabled in Firebase
4. Add Netlify domain to Firebase authorized domains

### Problem: CDN Scripts Not Loading
**Solution**: 
- Check Content-Security-Policy in `netlify.toml`
- Ensure it allows `cdnjs.cloudflare.com` and `gstatic.com`
- Check browser console for CSP errors

## 📊 Deployment Status Checks

After deployment, verify:

- [ ] Site loads at Netlify URL
- [ ] Can access login/signup page
- [ ] Can create account and login
- [ ] Can add transactions
- [ ] Can generate reports
- [ ] Can export to PDF/Excel
- [ ] No errors in browser console
- [ ] Firebase authentication works (if configured)

## 🔄 Automatic Deployments

Netlify automatically deploys when you:
- Push to your main/master branch
- Merge a pull request
- Make changes through GitHub UI

To disable auto-deploy:
1. Go to **Site settings** → **Build & deploy**
2. Under **Build settings**, click **"Edit settings"**
3. Set **"Build mode"** to **Manual**

## 📈 Performance Monitoring

Netlify provides built-in analytics:
1. Go to **Analytics** tab in Netlify dashboard
2. View visitor stats, page views, bandwidth usage

## 🛡️ Security Features

Already configured in `netlify.toml`:
- ✅ HTTPS (automatic)
- ✅ X-Frame-Options header
- ✅ Content-Security-Policy
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy

## 💰 Cost

- **Free tier** is sufficient for this project
- Includes 100GB bandwidth/month
- Includes 300 build minutes/month
- Automatic HTTPS
- Global CDN

## 📱 Testing Checklist

After deployment, test:

1. **Desktop browsers**:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

2. **Mobile browsers**:
   - [ ] iOS Safari
   - [ ] Android Chrome

3. **Core features**:
   - [ ] Authentication
   - [ ] Add transactions
   - [ ] View reports
   - [ ] Export functionality

## 🎉 You're Done!

Your Nigeria Tax Calculator is now live on Netlify!

**Next steps**:
- Share the URL with users
- Set up custom domain (optional)
- Configure Firebase authentication (optional)
- Monitor usage in Netlify analytics

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Detailed Deployment Guide](./DEPLOYMENT.md)
- [Project README](./README.md)

---

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting and configuration options.
