# Sufi Essences - Setup Guide

This guide explains how to set up the Sufi Essences project on a new machine after cloning from GitHub.

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL 14+ installed
3. Git installed

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd perfumes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` and update the database configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sufi_essences
DB_USER=your-postgres-username
DB_PASSWORD=your-postgres-password
```

### 4. Create Database

Create the PostgreSQL database:

```bash
createdb sufi_essences
```

### 5. Automatic Database Initialization

The server will automatically initialize the database schema and seed sample data on first run. Simply start the development server:

```bash
npm run dev:server
```

Or run both frontend and backend:

```bash
npm run dev:all
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Sample users:
  - Admin: admin@example.com / admin123
  - Seller: seller@example.com / admin123
  - Customer: customer@example.com / admin123

## Manual Database Initialization (Optional)

If you prefer to manually initialize the database:

```bash
npm run db:init
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify database credentials in `.env`
3. Check that the `sufi_essences` database exists

### Port Conflicts

If ports 5173 (frontend) or 5000 (backend) are in use, the applications will automatically use the next available port.

### Reset Database

To completely reset the database:

1. Drop and recreate the database:
   ```bash
   dropdb sufi_essences
   createdb sufi_essences
   ```

2. Restart the server - it will automatically reinitialize