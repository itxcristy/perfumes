# Admin Settings Management - Complete Guide

## 🎉 Overview

Your admin dashboard now includes a comprehensive **Settings Management System** that allows you to manage:

1. **Site Settings** - General website configuration (site name, tagline, currency, etc.)
2. **Social Media Accounts** - Manage all your social media presence
3. **Contact Information** - Phone numbers, emails, addresses, WhatsApp, etc.
4. **Footer Links** - Organize footer navigation links by sections
5. **Business Hours** - Set operating hours for each day of the week

---

## 📊 What Was Created

### Database Tables

✅ **5 New Tables Created:**

1. **`site_settings`** - General site configuration
   - Site name, tagline, description
   - Currency settings
   - Tax rates
   - Custom key-value pairs

2. **`social_media_accounts`** - Social media platforms
   - Platform name and URL
   - Username/handle
   - Follower count
   - Active/inactive status
   - Display order

3. **`contact_information`** - Business contact details
   - Phone numbers
   - Email addresses
   - Physical addresses
   - WhatsApp numbers
   - Support contacts

4. **`business_hours`** - Operating hours
   - Hours for each day of the week
   - Open/closed status
   - 24-hour operation flag
   - Special notes

5. **`footer_links`** - Footer navigation
   - Organized by sections
   - Link text and URLs
   - Display order
   - Active/inactive status

### Backend API Routes

✅ **Complete REST API Created:**

All routes are under `/api/admin/settings/` and require admin authentication:

**Site Settings:**
- `GET /api/admin/settings/site-settings` - Get all settings
- `GET /api/admin/settings/site-settings/:key` - Get specific setting
- `PUT /api/admin/settings/site-settings/:key` - Update setting
- `POST /api/admin/settings/site-settings` - Create new setting

**Social Media:**
- `GET /api/admin/settings/social-media` - List all accounts
- `GET /api/admin/settings/social-media/:id` - Get specific account
- `POST /api/admin/settings/social-media` - Create account
- `PUT /api/admin/settings/social-media/:id` - Update account
- `DELETE /api/admin/settings/social-media/:id` - Delete account

**Contact Information:**
- `GET /api/admin/settings/contact-info` - List all contacts
- `GET /api/admin/settings/contact-info/:id` - Get specific contact
- `POST /api/admin/settings/contact-info` - Create contact
- `PUT /api/admin/settings/contact-info/:id` - Update contact
- `DELETE /api/admin/settings/contact-info/:id` - Delete contact

**Business Hours:**
- `GET /api/admin/settings/business-hours` - Get all hours
- `PUT /api/admin/settings/business-hours/:day` - Update hours for specific day (0-6)

**Footer Links:**
- `GET /api/admin/settings/footer-links` - List all links
- `POST /api/admin/settings/footer-links` - Create link
- `PUT /api/admin/settings/footer-links/:id` - Update link
- `DELETE /api/admin/settings/footer-links/:id` - Delete link

### Admin UI Components

✅ **Complete Admin Interface Created:**

**Main Components:**
- `SettingsPage.tsx` - Main settings page with tabs
- `SiteSettingsList.tsx` - Manage general site settings
- `SocialMediaList.tsx` - Manage social media accounts
- `SocialMediaForm.tsx` - Add/edit social media accounts
- `ContactInfoList.tsx` - Manage contact information
- `ContactInfoForm.tsx` - Add/edit contact details
- `FooterLinksList.tsx` - Manage footer links
- `FooterLinkForm.tsx` - Add/edit footer links

**Navigation:**
- Added "Settings" to admin sidebar
- Added `/admin/settings` route to admin dashboard

---

## 🚀 How to Use

### 1. Access the Settings Page

1. Start your development server:
   ```bash
   npm run dev:all
   ```

2. Login to admin dashboard:
   - Go to `http://localhost:5173/admin`
   - Login with admin credentials

3. Click on **"Settings"** in the sidebar

### 2. Manage Site Settings

**What you can do:**
- Update site name and tagline
- Change currency and currency symbol
- Set tax rates
- Configure email addresses
- Modify copyright text

**How to use:**
- Each setting has an input field
- Make your changes
- Click "Save" button next to the setting
- Changes are saved immediately

### 3. Manage Social Media Accounts

**Pre-seeded platforms:**
- Facebook (15,000 followers)
- Instagram (25,000 followers)
- Twitter (8,000 followers)
- YouTube (12,000 followers)
- Pinterest (5,000 followers)
- TikTok (30,000 followers)

**How to manage:**
- Click "Add Account" to add new platform
- Click "Edit" to modify existing account
- Click "Visit" to open the social media page
- Click eye icon to activate/deactivate
- Click trash icon to delete

**Fields:**
- Platform (Facebook, Instagram, etc.)
- Profile URL
- Username/handle
- Follower count
- Display order
- Description
- Active status

### 4. Manage Contact Information

**Pre-seeded contacts:**
- Customer Support Phone
- Sales Inquiries Phone
- General Email
- Support Email
- WhatsApp Support
- Main Office Address
- Warehouse Address

**Contact types:**
- Phone Number
- Email Address
- Physical Address
- WhatsApp
- Support

**How to manage:**
- Click "Add Contact" to create new contact
- Click "Edit" to modify
- Click eye icon to activate/deactivate
- Click trash icon to delete

**Fields:**
- Contact Type
- Label (e.g., "Customer Support")
- Value (phone/email/address)
- Department (optional)
- Business Hours (optional)
- Primary contact flag
- Display order
- Active status

### 5. Manage Footer Links

**Pre-seeded sections:**
- **Shop** (5 links)
- **Customer Care** (5 links)
- **Company** (5 links)
- **Legal** (4 links)

**How to manage:**
- Click "Add Link" to create new link
- Click "Edit" to modify
- Click eye icon to activate/deactivate
- Click trash icon to delete

**Fields:**
- Section name
- Link text
- Link URL (relative or absolute)
- Display order
- Opens in new tab
- Active status

---

## 📝 Sample Data Included

The migration automatically seeded your database with realistic sample data:

### Site Settings (10 entries)
- Site name: "Perfume Paradise"
- Tagline: "Discover Your Signature Scent"
- Support email: support@perfumeparadise.com
- Currency: USD ($)
- Tax rate: 10%
- Free shipping threshold: $50

### Social Media (6 platforms)
- All major platforms configured
- Realistic follower counts
- Active and ready to use

### Contact Info (7 entries)
- Multiple phone numbers
- Email addresses
- Office and warehouse addresses
- WhatsApp support

### Business Hours (7 days)
- Monday-Friday: 9 AM - 6 PM
- Saturday: 10 AM - 4 PM (reduced hours)
- Sunday: Closed

### Footer Links (19 links)
- Organized in 4 sections
- All common e-commerce links included

---

## 🔧 Customization

### To Update Sample Data

You can modify the seed data in:
```
server/db/migrations/create-site-settings.sql
```

Then re-run the migration:
```bash
npm run db:migrate:settings
```

### To Add New Settings

1. Add to database via admin UI or SQL
2. Settings are automatically available in the API
3. Update frontend components if needed

---

## 🎯 Next Steps

### 1. Update Your Footer Component

The Footer component currently has hardcoded data. You should update it to fetch from the API:

**Create API hooks:**
```typescript
// src/hooks/useSiteSettings.ts
export const useSocialMedia = () => {
  // Fetch from /api/admin/settings/social-media
};

export const useContactInfo = () => {
  // Fetch from /api/admin/settings/contact-info
};

export const useFooterLinks = () => {
  // Fetch from /api/admin/settings/footer-links
};
```

**Update Footer.tsx:**
```typescript
const { data: socialMedia } = useSocialMedia();
const { data: contactInfo } = useContactInfo();
const { data: footerLinks } = useFooterLinks();
```

### 2. Make Settings Public

Currently, settings endpoints require admin authentication. To make them public:

1. Create public endpoints in `server/routes/settings.ts`
2. Remove authentication middleware for GET requests
3. Filter by `is_public` flag for site settings

### 3. Add More Settings

You can easily add more settings:
- Payment gateway configuration
- SEO settings
- Email templates
- Notification preferences
- Theme customization

---

## 🔒 Security Notes

⚠️ **Important:**
- All settings routes require admin authentication
- Only admins can modify settings
- Sensitive settings (like API keys) should have `is_public: false`
- Always validate input on the backend

---

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs
3. Verify database connection
4. Ensure migration ran successfully

---

## ✅ Checklist

- [x] Database tables created
- [x] Sample data seeded
- [x] Backend API routes created
- [x] Admin UI components created
- [x] Navigation updated
- [x] Migration script created
- [ ] Update Footer component to use dynamic data
- [ ] Create public API endpoints
- [ ] Test all CRUD operations
- [ ] Deploy to production

---

**Congratulations! Your admin settings management system is ready to use! 🎉**

