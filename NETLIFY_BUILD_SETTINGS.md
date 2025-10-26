# 🔧 Netlify Build Settings - Complete Guide

## What to Enter in Each Field

---

## 📋 Build Settings

### 1. **Runtime**
```
✅ LEAVE AS DEFAULT
(Netlify will auto-detect Node.js)

If you need to specify:
→ Node 18.x (recommended)
```

---

### 2. **Base Directory**
```
✅ LEAVE EMPTY or enter: /

This is where your project root is.
Since your netlify.toml is in the root, leave this empty.
```

---

### 3. **Package Directory**
```
✅ LEAVE EMPTY

Only use this if you have a monorepo.
Your project is NOT a monorepo, so leave empty.
```

---

### 4. **Build Command**
```
✅ ENTER THIS EXACTLY:

npm ci && npm run build

OR if you prefer:

npm install && npm run build

EXPLANATION:
- npm ci = Clean install (recommended for CI/CD)
- npm run build = Builds your React app with Vite
```

---

### 5. **Publish Directory**
```
✅ ENTER THIS EXACTLY:

dist

EXPLANATION:
- This is where Vite outputs your built files
- Netlify will serve files from this directory
```

---

### 6. **Functions Directory**
```
✅ ENTER THIS EXACTLY:

netlify/functions

EXPLANATION:
- This is where your serverless functions are
- Your API handler is in: netlify/functions/api.ts
```

---

## 🔐 Environment Variables

### Add These Variables:

#### 1. **DATABASE_URL** (Required)
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:AbCdEfGhIjKlMnOp@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require

WHERE TO GET:
→ Go to https://neon.tech
→ Create project
→ Copy connection string
→ Paste here
```

#### 2. **JWT_SECRET** (Required)
```
Key: JWT_SECRET
Value: (generate a random string)

GENERATE RANDOM STRING:
→ Use: https://www.uuidgenerator.net/
→ Or: openssl rand -base64 32
→ Example: aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u3vW4xY5z

EXPLANATION:
- Used for signing JWT tokens
- Keep it secret and secure
- Don't share this value
```

#### 3. **NODE_ENV** (Required)
```
Key: NODE_ENV
Value: production

EXPLANATION:
- Tells your app it's running in production
- Enables optimizations
```

#### 4. **VITE_APP_ENV** (Optional)
```
Key: VITE_APP_ENV
Value: production

EXPLANATION:
- Vite environment variable
- Already set in netlify.toml, but good to add here too
```

---

## 📊 Deploy Log Visibility

### Choose One:

#### ✅ **Public Logs** (Recommended for most projects)
```
Anyone with the deploy URL can see logs.
Good for:
- Public projects
- Debugging with team members
- Sharing deployment status
```

#### 🔒 **Private Logs** (For sensitive projects)
```
Only admins can see logs.
Good for:
- Projects with sensitive data
- Enterprise applications
- Security-critical apps
```

**RECOMMENDATION**: Choose **Public Logs** for easier debugging.

---

## 🚀 Build Status

### Choose One:

#### ✅ **Active Builds** (Recommended)
```
Netlify automatically builds when you push to Git.

WORKFLOW:
1. You push code to GitHub
2. Netlify detects the push
3. Netlify runs build command
4. Your site updates automatically

BEST FOR: Most projects
```

#### ⏸️ **Stopped Builds** (Manual only)
```
You must manually deploy using CLI.

WORKFLOW:
1. You build locally: npm run build
2. You deploy manually: netlify deploy --prod
3. Your site updates only when you deploy

BEST FOR: Testing before going live
```

**RECOMMENDATION**: Choose **Active Builds** for automatic deployment.

---

## 📝 Summary - What to Enter

| Field | Value |
|-------|-------|
| **Runtime** | Leave default (Node.js auto-detected) |
| **Base Directory** | Leave empty or `/` |
| **Package Directory** | Leave empty |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |
| **Functions Directory** | `netlify/functions` |
| **Deploy Log Visibility** | Public Logs |
| **Build Status** | Active Builds |

---

## 🔐 Environment Variables to Add

| Key | Value | Required |
|-----|-------|----------|
| `DATABASE_URL` | Your Neon connection string | ✅ Yes |
| `JWT_SECRET` | Random secret key | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `VITE_APP_ENV` | `production` | ⭕ Optional |

---

## ✅ Step-by-Step Setup

### 1. Go to Netlify Dashboard
```
→ https://netlify.com
→ Sign in
→ Select your site
→ Go to "Site Settings"
```

### 2. Click "Build & Deploy"
```
→ Left sidebar → "Build & Deploy"
→ Click "Build settings"
```

### 3. Fill in Build Settings
```
Build command: npm ci && npm run build
Publish directory: dist
Functions directory: netlify/functions
```

### 4. Add Environment Variables
```
→ Click "Environment"
→ Click "Add variable"
→ Add each variable from the table above
```

### 5. Save and Deploy
```
→ Click "Save"
→ Go to "Deploys"
→ Click "Trigger deploy"
→ Select "Deploy site"
```

---

## 🧪 Test Your Setup

### After deployment, verify:

```bash
# Test health endpoint
curl https://your-site.netlify.app/api/health

# Test categories
curl https://your-site.netlify.app/api/categories

# Test products
curl https://your-site.netlify.app/api/products
```

---

## 🆘 Troubleshooting

### Build fails with "npm: command not found"
```
→ Check Runtime is set to Node.js 18+
→ Check Build command is correct
```

### "DATABASE_URL not found" error
```
→ Go to Environment variables
→ Verify DATABASE_URL is added
→ Check the value is correct
→ Redeploy
```

### Functions not working
```
→ Check Functions directory: netlify/functions
→ Check netlify/functions/api.ts exists
→ Check build logs for errors
```

### Site shows "Page not found"
```
→ Check Publish directory: dist
→ Check build completed successfully
→ Hard refresh browser (Ctrl+Shift+R)
```

---

## 📚 Quick Reference

### Build Command Explained
```
npm ci && npm run build

npm ci
  ↓
  Clean install of dependencies
  (better for CI/CD than npm install)

&&
  ↓
  Run next command only if previous succeeded

npm run build
  ↓
  Builds your React app with Vite
  Output goes to: dist/
```

### Publish Directory Explained
```
dist/
  ├── index.html
  ├── css/
  ├── js/
  ├── images/
  └── assets/

Netlify serves everything from this folder.
```

### Functions Directory Explained
```
netlify/functions/
  └── api.ts
      ├── Handles all API requests
      ├── Connects to Neon DB
      └── Exports serverless handler
```

---

## 🎯 Final Checklist

Before deploying, verify:

- [ ] Build command: `npm ci && npm run build`
- [ ] Publish directory: `dist`
- [ ] Functions directory: `netlify/functions`
- [ ] DATABASE_URL environment variable set
- [ ] JWT_SECRET environment variable set
- [ ] NODE_ENV set to `production`
- [ ] Build status: Active Builds
- [ ] Deploy logs: Public Logs

---

## 🚀 You're Ready!

Once you've filled in all these settings:

1. Netlify will automatically build your project
2. Your serverless functions will be deployed
3. Your site will be live at `https://your-site.netlify.app`
4. Every push to GitHub will trigger a new deployment

**Your Aligarh Attars e-commerce site is ready to go live!** 🎉

---

**Questions?** Check the Netlify docs:
- https://docs.netlify.com/configure-builds/overview/
- https://docs.netlify.com/functions/overview/
- https://docs.netlify.com/environment-variables/overview/

