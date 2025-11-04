# 🚀 DEPLOYMENT GUIDE - HOSTINGER VPS

**Project:** Kashmir Perfume E-Commerce Store  
**Target:** Hostinger VPS with PostgreSQL  
**Estimated Time:** 2-4 hours

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Hostinger VPS Setup
- [ ] VPS provisioned and running
- [ ] SSH access configured
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)

### 2. Production Secrets Generated
- [ ] JWT_SECRET generated: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Database password created (min 20 chars)
- [ ] Razorpay production keys obtained
- [ ] SendGrid API key obtained
- [ ] Sentry DSN obtained
- [ ] Google Analytics ID obtained

### 3. Domain Configuration
- [ ] Domain registered
- [ ] DNS A record pointing to VPS IP
- [ ] SSL certificate installed
- [ ] HTTPS configured

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
# or
ssh user@your-vps-ip
```

### Step 2: Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/perfume-store.git
cd perfume-store
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Create Production .env
```bash
cp .env.example .env
nano .env
```

**Update with production values:**
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfumes_production
DB_USER=perfumes_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_POOL_SIZE=20

VITE_API_URL=https://yourdomain.com/api

JWT_SECRET=YOUR_GENERATED_SECRET_HERE
JWT_EXPIRY=7d

RAZORPAY_KEY_ID=YOUR_PRODUCTION_KEY
RAZORPAY_KEY_SECRET=YOUR_PRODUCTION_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

SENDGRID_API_KEY=YOUR_SENDGRID_KEY
EMAIL_FROM=orders@yourdomain.com
EMAIL_FROM_NAME=Kashmir Perfume Store
EMAIL_SUPPORT=support@yourdomain.com

VITE_SENTRY_DSN=YOUR_SENTRY_DSN
VITE_GA_MEASUREMENT_ID=YOUR_GA_ID
```

### Step 5: Setup PostgreSQL Database
```bash
sudo -u postgres psql

# Create database
CREATE DATABASE perfumes_production;

# Create user
CREATE USER perfumes_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE perfumes_production TO perfumes_user;

# Exit
\q
```

### Step 6: Run Database Migrations
```bash
npm run db:init
npm run db:seed:categories
```

### Step 7: Build Frontend
```bash
npm run build
```

### Step 8: Configure Nginx
Create `/etc/nginx/sites-available/perfume-store`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/perfume-store/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/perfume-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup PM2 for Node.js
```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'perfume-store',
    script: './server/index.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 10: Setup SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 11: Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Test Frontend
```bash
curl https://yourdomain.com
```

### 2. Test API
```bash
curl https://yourdomain.com/api/health
```

### 3. Test Database Connection
```bash
psql -h localhost -U perfumes_user -d perfumes_production
```

### 4. Check PM2 Status
```bash
pm2 status
pm2 logs
```

### 5. Monitor Performance
```bash
pm2 monit
```

---

## 🔍 TROUBLESHOOTING

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### Database Connection Failed
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Nginx Not Working
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### PM2 Issues
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks
- [ ] Check PM2 status: `pm2 status`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`
- [ ] Check logs: `pm2 logs`

### Weekly Tasks
- [ ] Review error logs in Sentry
- [ ] Check database backups
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Review security updates
- [ ] Optimize database
- [ ] Analyze analytics

---

## 🆘 SUPPORT

For issues or questions:
1. Check logs: `pm2 logs`
2. Review Sentry dashboard
3. Check Nginx error logs: `/var/log/nginx/error.log`
4. Check PostgreSQL logs: `/var/log/postgresql/`

---

**Deployment Guide Created:** 2025-11-04  
**Last Updated:** 2025-11-04

