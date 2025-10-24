# Quick Start Guide - Sufi Essences Migration

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Step 1: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sufi_essences
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### Step 2: Create Database

```bash
# Create PostgreSQL database
createdb sufi_essences
```

### Step 3: Initialize Schema

```bash
# Install dependencies (if not already done)
npm install

# Initialize database schema
npm run db:init
```

### Step 4: Start Backend

```bash
npm run dev:server
```

Server will run on `http://localhost:5000`

### Step 5: Start Frontend

In a new terminal:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Step 6: Test the Setup

```bash
# Test backend health
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api/products
```

## 📚 Documentation

- **Backend Setup**: `docs/BACKEND_SETUP_GUIDE.md`
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Frontend Integration**: `docs/FRONTEND_INTEGRATION_GUIDE.md`
- **Migration Progress**: `docs/MIGRATION_PROGRESS.md`

## 🔑 Key Commands

```bash
# Development
npm run dev              # Start frontend
npm run dev:server      # Start backend
npm run dev:all         # Start both

# Database
npm run db:init         # Initialize database schema

# Building
npm run build           # Build frontend
npm run build:server    # Build backend

# Linting
npm run lint            # Check code
npm run lint:fix        # Fix code

# Testing
npm run test            # Run tests
```

## 🛠️ API Client Usage

```typescript
import { apiClient } from '@/lib/apiClient';

// Register
await apiClient.register(email, password, fullName);

// Login
await apiClient.login(email, password);

// Get products (paginated)
const response = await apiClient.getProducts({ 
  page: 1, 
  limit: 20 
});

// Add to cart
await apiClient.addToCart(productId, quantity);

// Get cart
const cart = await apiClient.getCart();
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products (paginated)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `DELETE /api/cart` - Clear cart

## 🔐 Authentication

All protected endpoints require a JWT token:

```
Authorization: Bearer <token>
```

The API client automatically handles token storage and inclusion.

## 📁 Project Structure

```
.
├── server/              # Backend (Express + PostgreSQL)
│   ├── routes/         # API endpoints
│   ├── db/             # Database setup
│   ├── middleware/     # Auth, error handling
│   └── utils/          # Utilities
├── src/                # Frontend (React + Vite)
│   ├── lib/
│   │   └── apiClient.ts  # API client
│   ├── contexts/       # React contexts
│   ├── pages/          # Pages
│   └── components/     # Components
└── docs/               # Documentation
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Database connection failed
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check credentials in .env
# Verify database exists
psql -U postgres -l | grep sufi_essences
```

### API not responding
```bash
# Check backend is running
curl http://localhost:5000/health

# Check VITE_API_URL in .env
# Check browser console for errors
```

### Token not persisting
```bash
# Check localStorage in DevTools
# Verify apiClient.setToken() is called
# Check token in Authorization header
```

## 📈 Performance

- **Initial Load**: < 1 second
- **Pagination**: 20 items per page
- **Query Response**: < 100ms
- **Connection Pool**: 20 max connections

## 🔒 Security

- JWT authentication with 7-day expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based access control
- SQL injection prevention
- CORS configuration
- Helmet security headers

## 📝 Environment Variables

```
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sufi_essences
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_SIZE=20

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable HTTPS/SSL
4. Configure proper CORS origins
5. Set up database backups
6. Monitor connection pool
7. Implement rate limiting
8. Set up error tracking

## 📞 Support

For issues or questions:
1. Check documentation in `docs/`
2. Review API client: `src/lib/apiClient.ts`
3. Check backend logs: `npm run dev:server`
4. Review error messages in browser console

## ✅ Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created: `sufi_essences`
- [ ] `.env` configured with credentials
- [ ] `npm install` completed
- [ ] `npm run db:init` executed
- [ ] Backend running: `npm run dev:server`
- [ ] Frontend running: `npm run dev`
- [ ] API responding: `curl http://localhost:5000/health`
- [ ] Can register and login
- [ ] Can view products
- [ ] Can add to cart

## 🎉 You're Ready!

The migration is complete and ready for frontend integration. Start building!

For detailed information, see the documentation in `docs/`.

