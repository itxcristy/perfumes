# ⚡ Netlify Settings - Quick Reference Card

## 🎯 Copy-Paste Values

### Build Settings

```
Runtime:                Leave Default (Node.js auto-detected)
Base Directory:         (leave empty)
Package Directory:      (leave empty)
Build Command:          npm ci && npm run build
Publish Directory:      dist
Functions Directory:    netlify/functions
Deploy Log Visibility:  Public Logs
Build Status:           Active Builds
```

---

## 🔐 Environment Variables

### Copy these exactly:

#### Variable 1: DATABASE_URL
```
Key:   DATABASE_URL
Value: postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR_REGION.neon.tech/neondb?sslmode=require

⚠️  GET THIS FROM:
→ https://neon.tech
→ Your project dashboard
→ Copy the connection string
```

#### Variable 2: JWT_SECRET
```
Key:   JWT_SECRET
Value: (generate random string)

🔑 GENERATE HERE:
→ https://www.uuidgenerator.net/
→ Copy the generated UUID
→ Or use: openssl rand -base64 32
```

#### Variable 3: NODE_ENV
```
Key:   NODE_ENV
Value: production
```

#### Variable 4: VITE_APP_ENV (Optional)
```
Key:   VITE_APP_ENV
Value: production
```

---

## 📋 Step-by-Step

### 1️⃣ Go to Netlify
```
https://netlify.com → Sign In → Your Site
```

### 2️⃣ Site Settings
```
Left Sidebar → "Site Settings"
```

### 3️⃣ Build & Deploy
```
Left Sidebar → "Build & Deploy" → "Build settings"
```

### 4️⃣ Fill Build Settings
```
Build command:      npm ci && npm run build
Publish directory:  dist
Functions dir:      netlify/functions
```

### 5️⃣ Add Environment Variables
```
Left Sidebar → "Build & Deploy" → "Environment"
Click "Add variable" for each:
  - DATABASE_URL
  - JWT_SECRET
  - NODE_ENV
  - VITE_APP_ENV (optional)
```

### 6️⃣ Deploy
```
Left Sidebar → "Deploys"
Click "Trigger deploy" → "Deploy site"
```

---

## ✅ Verification

### After deployment, test:

```bash
# Health check
curl https://your-site.netlify.app/api/health

# Get categories
curl https://your-site.netlify.app/api/categories

# Get products
curl https://your-site.netlify.app/api/products
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check build command: `npm ci && npm run build` |
| DATABASE_URL error | Add in Environment variables |
| Functions not found | Check Functions directory: `netlify/functions` |
| Site shows 404 | Check Publish directory: `dist` |
| API returns 500 | Check DATABASE_URL is correct |

---

## 📊 What Each Setting Does

```
Build Command
  ↓
  Installs dependencies & builds your app
  ↓
  Creates: dist/ folder

Publish Directory
  ↓
  Netlify serves files from here
  ↓
  Your website is here

Functions Directory
  ↓
  Netlify deploys serverless functions
  ↓
  Your API is here

Environment Variables
  ↓
  Secret values your app needs
  ↓
  Database connection, JWT secret, etc.
```

---

## 🎯 Final Checklist

- [ ] Build command entered
- [ ] Publish directory: dist
- [ ] Functions directory: netlify/functions
- [ ] DATABASE_URL added
- [ ] JWT_SECRET added
- [ ] NODE_ENV = production
- [ ] Build status: Active Builds
- [ ] Deploy logs: Public Logs
- [ ] Deployed successfully
- [ ] API endpoints working

---

## 🚀 You're Done!

Your site is now:
✅ Building automatically
✅ Deploying to production
✅ Connected to Neon DB
✅ Running serverless functions
✅ Live on the internet

**Congratulations!** 🎉

---

**Need help?** See: NETLIFY_BUILD_SETTINGS.md

