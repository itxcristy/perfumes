# 🖱️ Netlify Setup - Visual Click-by-Click Guide

## Step 1: Go to Your Site Dashboard

```
1. Open: https://netlify.com
2. Sign in with your account
3. Click on your site name (e.g., "aligarh-attars")
4. You're now on your site dashboard
```

---

## Step 2: Open Site Settings

```
LEFT SIDEBAR:
┌─────────────────────────┐
│ Overview                │
│ Deploys                 │
│ Analytics               │
│ ► Site Settings         │ ← CLICK HERE
│ ► Build & Deploy        │
│ ► Environment           │
│ ► Functions             │
│ ► Redirects & rewrites  │
│ ► Headers               │
│ ► Domain management     │
└─────────────────────────┘
```

---

## Step 3: Configure Build Settings

```
AFTER CLICKING "Site Settings":

1. Scroll down to "Build & Deploy"
2. Click "Build settings" button
3. You'll see:

┌─────────────────────────────────────────┐
│ Build Settings                          │
├─────────────────────────────────────────┤
│                                         │
│ Runtime:                                │
│ [Leave as default]                      │
│                                         │
│ Base directory:                         │
│ [Leave empty]                           │
│                                         │
│ Package directory:                      │
│ [Leave empty]                           │
│                                         │
│ Build command:                          │
│ [npm ci && npm run build]               │ ← ENTER THIS
│                                         │
│ Publish directory:                      │
│ [dist]                                  │ ← ENTER THIS
│                                         │
│ Functions directory:                    │
│ [netlify/functions]                     │ ← ENTER THIS
│                                         │
│ [Save] button                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 4: Add Environment Variables

```
LEFT SIDEBAR:
┌─────────────────────────┐
│ Overview                │
│ Deploys                 │
│ Analytics               │
│ Site Settings           │
│ Build & Deploy          │
│ ► Environment           │ ← CLICK HERE
│ ► Functions             │
│ ► Redirects & rewrites  │
│ ► Headers               │
│ ► Domain management     │
└─────────────────────────┘

AFTER CLICKING "Environment":

┌─────────────────────────────────────────┐
│ Environment variables                   │
├─────────────────────────────────────────┤
│                                         │
│ [Add variable] button                   │ ← CLICK HERE
│                                         │
│ Variables:                              │
│ (empty list initially)                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 5: Add First Variable (DATABASE_URL)

```
AFTER CLICKING "Add variable":

┌─────────────────────────────────────────┐
│ Add a new variable                      │
├─────────────────────────────────────────┤
│                                         │
│ Key:                                    │
│ [DATABASE_URL]                          │ ← TYPE THIS
│                                         │
│ Value:                                  │
│ [postgresql://neondb_owner:...]         │ ← PASTE YOUR NEON CONNECTION STRING
│                                         │
│ [Save] button                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 6: Add Second Variable (JWT_SECRET)

```
AFTER CLICKING "Add variable" AGAIN:

┌─────────────────────────────────────────┐
│ Add a new variable                      │
├─────────────────────────────────────────┤
│                                         │
│ Key:                                    │
│ [JWT_SECRET]                            │ ← TYPE THIS
│                                         │
│ Value:                                  │
│ [aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u]      │ ← GENERATE RANDOM STRING
│                                         │
│ [Save] button                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 7: Add Third Variable (NODE_ENV)

```
AFTER CLICKING "Add variable" AGAIN:

┌─────────────────────────────────────────┐
│ Add a new variable                      │
├─────────────────────────────────────────┤
│                                         │
│ Key:                                    │
│ [NODE_ENV]                              │ ← TYPE THIS
│                                         │
│ Value:                                  │
│ [production]                            │ ← TYPE THIS
│                                         │
│ [Save] button                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 8: Add Fourth Variable (VITE_APP_ENV) - Optional

```
AFTER CLICKING "Add variable" AGAIN:

┌─────────────────────────────────────────┐
│ Add a new variable                      │
├─────────────────────────────────────────┤
│                                         │
│ Key:                                    │
│ [VITE_APP_ENV]                          │ ← TYPE THIS
│                                         │
│ Value:                                  │
│ [production]                            │ ← TYPE THIS
│                                         │
│ [Save] button                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 9: Trigger Deployment

```
LEFT SIDEBAR:
┌─────────────────────────┐
│ Overview                │
│ ► Deploys               │ ← CLICK HERE
│ Analytics               │
│ Site Settings           │
│ Build & Deploy          │
│ Environment             │
│ Functions               │
│ Redirects & rewrites    │
│ Headers                 │
│ Domain management       │
└─────────────────────────┘

AFTER CLICKING "Deploys":

┌─────────────────────────────────────────┐
│ Deploys                                 │
├─────────────────────────────────────────┤
│                                         │
│ [Trigger deploy] button                 │ ← CLICK HERE
│                                         │
│ Recent deploys:                         │
│ (list of previous deploys)              │
│                                         │
└─────────────────────────────────────────┘

AFTER CLICKING "Trigger deploy":

┌─────────────────────────────────────────┐
│ Trigger a deploy                        │
├─────────────────────────────────────────┤
│                                         │
│ ○ Deploy site                           │ ← SELECT THIS
│ ○ Clear cache and deploy site           │
│                                         │
│ [Trigger deploy] button                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 10: Wait for Deployment

```
YOU'LL SEE:

┌─────────────────────────────────────────┐
│ Deploy in progress...                   │
├─────────────────────────────────────────┤
│                                         │
│ ⏳ Building...                           │
│ ⏳ Deploying...                          │
│ ⏳ Publishing...                         │
│                                         │
│ (Wait 2-3 minutes)                      │
│                                         │
│ ✅ Deploy successful!                   │
│                                         │
│ Your site is live at:                   │
│ https://your-site.netlify.app           │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Verify Your Site

```
AFTER DEPLOYMENT:

1. Click on your site URL
2. Your site should load
3. Test the API:
   - Browse products
   - Test login
   - Test cart
   - Test checkout

4. Check API endpoints:
   curl https://your-site.netlify.app/api/health
   curl https://your-site.netlify.app/api/categories
```

---

## 📊 Summary of All Clicks

```
1. https://netlify.com → Sign In → Your Site
2. Left Sidebar → Site Settings
3. Build settings → Fill in values
4. Left Sidebar → Environment
5. Add variable → DATABASE_URL
6. Add variable → JWT_SECRET
7. Add variable → NODE_ENV
8. Add variable → VITE_APP_ENV (optional)
9. Left Sidebar → Deploys
10. Trigger deploy → Deploy site
11. Wait for completion
12. Test your site
```

---

## 🎯 What to Enter (Copy-Paste)

### Build Command
```
npm ci && npm run build
```

### Publish Directory
```
dist
```

### Functions Directory
```
netlify/functions
```

### Environment Variables

**DATABASE_URL**
```
postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR_REGION.neon.tech/neondb?sslmode=require
```
(Get from Neon dashboard)

**JWT_SECRET**
```
(Generate random string from https://www.uuidgenerator.net/)
```

**NODE_ENV**
```
production
```

**VITE_APP_ENV**
```
production
```

---

## 🚀 You're Done!

Your site is now:
✅ Configured
✅ Building automatically
✅ Deployed to production
✅ Connected to Neon DB
✅ Live on the internet

**Congratulations!** 🎉

---

**Your site URL**: https://your-site.netlify.app
**Share it with your users!**

