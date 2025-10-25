# Advanced Multi-Role E-Commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase. This application supports multiple user roles (customers, sellers, admins) with comprehensive features for online shopping, product management, and order processing.

## Features

### 🛍️ Customer Features
- **Product Browsing**: Search, filter, and browse products by category
- **Shopping Cart**: Add, remove, and manage items with real-time updates
- **Wishlist**: Save favorite products for later
- **Product Comparison**: Compare multiple products side-by-side
- **Reviews & Ratings**: Leave and view product reviews
- **Secure Checkout**: Multi-step checkout process with validation
- **Order Tracking**: Track order status and history
- **User Profile**: Manage personal information and preferences
- **About Page**: Learn about our heritage, story, and values at Aligarh Attar House

### 👨‍💼 Seller Features
- **Product Management**: Add, edit, and delete products
- **Inventory Tracking**: Monitor stock levels
- **Order Management**: View and process customer orders
- **Sales Analytics**: Track performance metrics
- **Product Categories**: Organize products efficiently

### 🔧 Admin Features
- **Enhanced User Management**: Full CRUD operations with bulk actions
- **Platform Analytics**: Comprehensive dashboard with charts
- **System Monitoring**: Track platform performance
- **Content Management**: Manage categories and featured products
- **Security Controls**: Monitor and manage platform security

### 🔐 Universal Authentication System
- **Single Sign-On**: Unified login page for all user roles (customers, sellers, admins)
- **Role-Based Registration**: Users can register as customers, sellers, or admins
- **Secure Authentication**: JWT-based authentication with password hashing
- **Password Reset**: Forgot password functionality
- **Session Management**: Persistent sessions across page refreshes
- **Role-Based Redirection**: Automatic redirection to appropriate dashboard based on user role

### 🚀 Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live cart and notification updates
- **Performance Optimized**: Lazy loading, caching, and code splitting
- **Security**: Input sanitization, XSS prevention, and rate limiting
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Form Validation**: Client-side and server-side validation
- **Animation**: Smooth transitions with Framer Motion

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### Development Tools
- **Vite** - Build tool
- **ESLint** - Code linting
- **TypeScript** - Type checking

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd advanced_multi-role_e-commerce_platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Database setup**
   - Create a new project on [Supabase](https://supabase.com)
   - Follow the detailed setup guide in [supabase-scripts/SETUP-GUIDE.md](supabase-scripts/SETUP-GUIDE.md)
   - Run the SQL scripts in order from the [supabase-scripts](supabase-scripts) directory
   - Update `.env` with your project URL and anon key

5. **Start development**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Register a new account or use direct login in development

📖 **Detailed setup instructions:** See [supabase-scripts/SETUP-GUIDE.md](supabase-scripts/SETUP-GUIDE.md)

## 📦 Database Schema

### Quick Setup
The database schema has been organized into modular SQL scripts in the [supabase-scripts](supabase-scripts) directory:

1. **[01-auth-schema.sql](supabase-scripts/01-auth-schema.sql)** - Authentication tables and policies
2. **[02-user-profiles.sql](supabase-scripts/02-user-profiles.sql)** - User profiles and roles
3. **[03-categories.sql](supabase-scripts/03-categories.sql)** - Product categories
4. **[04-products.sql](supabase-scripts/04-products.sql)** - Products and product variants
5. **[05-inventory.sql](supabase-scripts/05-inventory.sql)** - Inventory tracking
6. **[06-shopping-cart.sql](supabase-scripts/06-shopping-cart.sql)** - Cart functionality
7. **[07-wishlist.sql](supabase-scripts/07-wishlist.sql)** - Wishlist functionality
8. **[08-orders.sql](supabase-scripts/08-orders.sql)** - Order management
9. **[09-reviews.sql](supabase-scripts/09-reviews.sql)** - Product reviews
10. **[11-analytics.sql](supabase-scripts/11-analytics.sql)** - Analytics and reporting
11. **[12-admin-functions.sql](supabase-scripts/12-admin-functions.sql)** - Administrative functions
12. **[13-security-policies.sql](supabase-scripts/13-security-policies.sql)** - Row Level Security policies
13. **[14-sample-data.sql](supabase-scripts/14-sample-data.sql)** - Sample data for testing
14. **[15-remove-mock-data.sql](supabase-scripts/15-remove-mock-data.sql)** - Script to clean up mock data
15. **[17-user-management-functions.sql](supabase-scripts/17-user-management-functions.sql)** - Enhanced user management functions

### Security Hardening

For production deployment, run the **[SECURITY-FIXES.sql](supabase-scripts/SECURITY-FIXES.sql)** script to:

1. Disable development mode and direct login
2. Fix RLS recursion issues that can cause infinite loops
3. Apply hardened security policies without recursion
4. Verify the security configuration

```
-- Run this in your Supabase SQL Editor
-- This script should be run AFTER all other setup scripts
\ir supabase-scripts/SECURITY-FIXES.sql
```

### Database Tables

#### Core Tables
- **`profiles`** - User profiles extending Supabase auth.users
- **`addresses`** - User shipping and billing addresses
- **`categories`** - Product categories with hierarchical support
- **`products`** - Main product catalog with full e-commerce features
- **`product_variants`** - Product variations (size, color, storage, etc.)

#### Shopping & Orders
- **`cart_items`** - Individual items in shopping carts
- **`wishlist_items`** - Items in user wishlists
- **`orders`** - Order management with full order lifecycle
- **`order_items`** - Individual items in orders with product snapshots
- **`order_tracking`** - Order status tracking and updates

#### Reviews & Marketing
- **`reviews`** - Product reviews and ratings system

#### Additional Features
- **`user_preferences`** - User notification and preference settings
- **`user_security_settings`** - Two-factor authentication and security settings
- **`payment_methods`** - Stored payment methods
- **`inventory_transactions`** - Inventory movement tracking
- **`low_stock_alerts`** - Automated low stock notifications
- **`analytics_events`** - User behavior tracking

### Key Features

#### Security
- **Row Level Security (RLS)** enabled on all tables
- Comprehensive policies for user data access
- Admin and vendor role-based permissions
- Rate limiting and security audit logging

#### Performance
- Optimized indexes for all common queries
- Full-text search support for products
- GIN indexes for array and JSONB columns
- Efficient foreign key relationships

#### Functionality
- **Automatic timestamps** with triggers
- **Order number generation** with functions
- **Product rating calculation** with triggers
- **Inventory tracking** with stock management
- **Product variants** for size, color, storage options
- **Flexible pricing** with original and sale prices

### Sample Data

The [14-sample-data.sql](supabase-scripts/14-sample-data.sql) file includes:
- **8 categories**: Traditional Attars, Modern Blends, Floral Scents, Woody Scents, Oud-Based, Unisex Fragrances, Limited Edition, Gift Sets
- **10+ products** with realistic attar data
- **Product variants** for different bottle sizes
- **Sample reviews** with ratings
- **Realistic product ratings** and review counts