# 🚀 HOSTINGER VPS DEPLOYMENT GUIDE
## Complete Setup for Kashmir Perfume E-Commerce Platform

**Target:** Deploy production-ready e-commerce platform on Hostinger VPS

---

## 📋 PREREQUISITES

### What You Need:
1. **Hostinger VPS Plan** (Recommended: VPS 2 or higher)
   - Minimum: 2 CPU cores, 4GB RAM, 50GB SSD
   - Ubuntu 22.04 LTS (recommended)

2. **Domain Name** (from Hostinger or any registrar)
   - Example: kashmirattars.com

3. **SSH Access** to your VPS
   - Get credentials from Hostinger panel

---

## 🔧 PART 1: INITIAL VPS SETUP (30 minutes)

### Step 1: Connect to Your VPS

```bash
# From your local machine (Windows PowerShell or Git Bash)
ssh root@your-vps-ip-address

# Enter password when prompted
```

### Step 2: Update System

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 3: Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser perfumes
# Set a strong password when prompted

# Add user to sudo group
usermod -aG sudo perfumes

# Switch to new user
su - perfumes
```

### Step 4: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (only if remote access needed)
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🗄️ PART 2: POSTGRESQL DATABASE SETUP (30 minutes)

### Step 1: Install PostgreSQL

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Check if running
sudo systemctl status postgresql
```

### Step 2: Secure PostgreSQL

```bash
# Switch to postgres user
sudo -i -u postgres

# Access PostgreSQL
psql

# Inside PostgreSQL prompt:
```

```sql
-- Create production database
CREATE DATABASE perfumes_production;

-- Create dedicated user with strong password
CREATE USER perfumes_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE_20_CHARS_MIN';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE perfumes_production TO perfumes_user;

-- Grant schema privileges
\c perfumes_production
GRANT ALL ON SCHEMA public TO perfumes_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO perfumes_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO perfumes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO perfumes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO perfumes_user;

-- Exit PostgreSQL
\q
```

```bash
# Exit postgres user
exit
```

### Step 3: Configure PostgreSQL for Remote Access (Optional)

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and change:
listen_addresses = 'localhost'
# To:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line at the end (replace with your IP for security):
host    perfumes_production    perfumes_user    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 4: Load Database Schema

```bash
# From your local machine, upload schema.sql
scp server/db/schema.sql perfumes@your-vps-ip:/home/perfumes/

# On VPS, load schema
psql -U perfumes_user -d perfumes_production -f /home/perfumes/schema.sql

# Enter password when prompted
```

### Step 5: Set Up Automated Backups

```bash
# Create backup directory
sudo mkdir -p /var/backups/postgresql
sudo chown perfumes:perfumes /var/backups/postgresql

# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
# PostgreSQL Backup Script

BACKUP_DIR="/var/backups/postgresql"
DB_NAME="perfumes_production"
DB_USER="perfumes_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Create backup
PGPASSWORD='YOUR_DB_PASSWORD' pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

```bash
# Make script executable
chmod +x ~/backup-db.sh

# Test backup
./backup-db.sh

# Schedule daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * /home/perfumes/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 📦 PART 3: NODE.JS & APPLICATION SETUP (30 minutes)

### Step 1: Install Node.js 18 LTS

```bash
# Install Node.js 18 using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 2: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 3: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/perfumes.git

# Or upload files via SCP from local machine:
# scp -r d:\client\perfumes perfumes@your-vps-ip:/home/perfumes/
```

### Step 4: Install Dependencies

```bash
# Navigate to project
cd ~/perfumes

# Install dependencies
npm install

# Install production dependencies only (optional, for smaller footprint)
# npm install --production
```

### Step 5: Configure Environment Variables

```bash
# Create production .env file
nano .env
```

```env
# Copy from .env.production.example and fill in real values
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfumes_production
DB_USER=perfumes_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT Secret (generate new one)
JWT_SECRET=0a950ba26af53665065bee3d7b67241138676006dd7b1b3ad43c035fb72e66b4

# Razorpay Live Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET

# SendGrid
SENDGRID_API_KEY=SG.XXXXXXXXXX
EMAIL_FROM=orders@yourdomain.com

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ... (add all other variables)
```

```bash
# Save and exit (Ctrl+X, Y, Enter)

# Secure the .env file
chmod 600 .env
```

### Step 6: Build Application

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Verify build
ls -la dist/
ls -la server/dist/
```

---

## 🌐 PART 4: NGINX SETUP (30 minutes)

### Step 1: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 2: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/perfumes
```

```nginx
# Nginx Configuration for Perfume E-Commerce

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Root directory for frontend
    root /home/perfumes/perfumes/dist;
    index index.html;

    # Frontend - Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API - Proxy to Node.js backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

```bash
# Save and exit

# Enable the site
sudo ln -s /etc/nginx/sites-available/perfumes /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 PART 5: SSL CERTIFICATE (15 minutes)

### Install Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew via cron
```

---

## 🚀 PART 6: START APPLICATION WITH PM2 (15 minutes)

### Step 1: Create PM2 Ecosystem File

```bash
cd ~/perfumes

# Create PM2 configuration
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'perfumes-backend',
    script: './server/dist/index.js',
    instances: 2, // Use 2 instances for load balancing
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

```bash
# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Copy and run the command it outputs

# Check status
pm2 status
pm2 logs
```

### Step 2: PM2 Monitoring Commands

```bash
# View logs
pm2 logs perfumes-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart perfumes-backend

# Stop application
pm2 stop perfumes-backend

# View detailed info
pm2 info perfumes-backend
```

---

## ✅ PART 7: VERIFICATION & TESTING (15 minutes)

### Step 1: Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Step 2: Test from Browser

```
# Open in browser:
https://yourdomain.com

# Should load your frontend

# Test API:
https://yourdomain.com/api/products
```

### Step 3: Test Complete Flow

1. Browse products ✓
2. Add to cart ✓
3. Register/Login ✓
4. Checkout ✓
5. Make payment (₹1 test) ✓
6. Receive order confirmation email ✓

---

## 📊 PART 8: MONITORING & MAINTENANCE

### Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/perfumes
```

```
/home/perfumes/perfumes/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 perfumes perfumes
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitor System Resources

```bash
# Install htop
sudo apt install -y htop

# Monitor resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## 🔄 DEPLOYMENT WORKFLOW

### For Future Updates:

```bash
# SSH to VPS
ssh perfumes@your-vps-ip

# Navigate to project
cd ~/perfumes

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build
npm run build:server

# Restart PM2
pm2 restart perfumes-backend

# Check logs
pm2 logs perfumes-backend --lines 50
```

---

## 🆘 TROUBLESHOOTING

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs perfumes-backend

# Check if port 5000 is in use
sudo lsof -i :5000

# Check environment variables
pm2 env 0
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U perfumes_user -d perfumes_production -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

---

## 📝 IMPORTANT NOTES

1. **Security:**
   - Change all default passwords
   - Keep system updated: `sudo apt update && sudo apt upgrade`
   - Monitor logs regularly
   - Set up fail2ban for SSH protection

2. **Backups:**
   - Database backed up daily at 2 AM
   - Keep backups for 30 days
   - Test restore procedure monthly

3. **Performance:**
   - Monitor with `pm2 monit`
   - Check logs for errors
   - Optimize database queries if slow

4. **Scaling:**
   - Increase PM2 instances if needed
   - Upgrade VPS plan for more traffic
   - Consider CDN for static assets

---

**Your Kashmir perfume e-commerce platform is now live on Hostinger VPS! 🎉**

