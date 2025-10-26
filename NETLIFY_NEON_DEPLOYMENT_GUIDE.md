# Netlify + Neon DB Deployment Guide

## Overview

This guide will help you deploy your Aligarh Attars e-commerce application to Netlify with Neon DB (serverless PostgreSQL).

### Architecture:
- **Frontend**: React + Vite → Netlify Static Site
- **Backend**: Express API → Netlify Functions (Serverless)
- **Database**: PostgreSQL → Neon DB (Serverless)

---

## Step 1: Set Up Neon DB

### 1.1 Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (free tier available)
3. Sign up with email or GitHub

### 1.2 Create Database
1. After login, click "Create Project"
2. Name it: `aligarh-attars`
3. Select region closest to you
4. Click "Create Project"

### 1.3 Get Connection String
1. In Neon dashboard, go to "Connection string"
2. Copy the **PostgreSQL** connection string
3. It looks like: `postgresql://user:password@host/dbname?sslmode=require`

### 1.4 Save Connection String
Save this somewhere safe - you'll need it for Netlify environment variables.

**Example**:
```
postgresql://neondb_owner:AbCdEfGhIjKlMnOp@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require
```

---

## Step 2: Prepare Your Project

### 2.1 Update Database Connection
The connection code needs to support Neon's connection string format.

**Current code** (uses individual env vars):
```typescript
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});
```

**New code** (supports Neon connection string):
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### 2.2 Update .env File
Add to your `.env`:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

---

## Step 3: Create Netlify Configuration

### 3.1 Create `netlify.toml`
This file tells Netlify how to build and deploy your app.

**Location**: Root of your project (same level as `package.json`)

**Content**:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3.2 Create Functions Directory
```bash
mkdir -p netlify/functions
```

---

## Step 4: Convert Express Routes to Netlify Functions

### 4.1 Create API Handler
Create `netlify/functions/api.ts`:

```typescript
import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import { initializeDatabase } from '../../server/db/connection';
import authRoutes from '../../server/routes/auth';
import productsRoutes from '../../server/routes/products';
import categoriesRoutes from '../../server/routes/categories';
import cartRoutes from '../../server/routes/cart';
import wishlistRoutes from '../../server/routes/wishlist';
import ordersRoutes from '../../server/routes/orders';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);

// Export handler
export const handler = serverless(app);
```

---

## Step 5: Update Frontend API Calls

### 5.1 Create API Configuration
Create `src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : '/.netlify/functions/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5.2 Update .env Files
**`.env.development`**:
```
VITE_API_URL=http://localhost:5000
```

**`.env.production`**:
```
VITE_API_URL=/.netlify/functions/api
```

---

## Step 6: Deploy to Netlify

### 6.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 6.2 Connect to Netlify
```bash
netlify login
```

### 6.3 Link Project
```bash
netlify link
```

### 6.4 Set Environment Variables
```bash
netlify env:set DATABASE_URL "postgresql://user:password@host/dbname?sslmode=require"
```

### 6.5 Deploy
```bash
netlify deploy --prod
```

---

## Step 7: Initialize Database on Neon

### 7.1 Run Migrations
After deployment, run:
```bash
npm run db:auto-init
```

This will:
- Create tables on Neon DB
- Seed categories
- Seed sample users
- Seed sample products

---

## Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution**: Set environment variable in Netlify dashboard:
1. Go to Site Settings → Environment
2. Add `DATABASE_URL` with your Neon connection string

### Issue: "SSL certificate error"
**Solution**: Already handled in connection code with `ssl: { rejectUnauthorized: false }`

### Issue: "Function timeout"
**Solution**: Increase timeout in `netlify.toml`:
```toml
[functions]
  timeout = 30
```

### Issue: "CORS errors"
**Solution**: Update CORS in Express app to allow Netlify domain

---

## Monitoring

### Check Logs
```bash
netlify logs
```

### Monitor Database
Visit Neon dashboard to see:
- Query performance
- Connection status
- Database size

---

## Cost Estimate

- **Netlify**: Free tier (generous limits)
- **Neon DB**: Free tier (up to 3 projects, 5GB storage)
- **Total**: $0/month for small projects

---

## Next Steps

1. ✅ Create Neon account and database
2. ✅ Get connection string
3. ✅ Update database connection code
4. ✅ Create netlify.toml
5. ✅ Convert Express to Netlify Functions
6. ✅ Update frontend API calls
7. ✅ Deploy to Netlify
8. ✅ Initialize database

---

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Serverless HTTP**: https://github.com/dougmoscrop/serverless-http

---

**Status**: Ready to deploy! 🚀

