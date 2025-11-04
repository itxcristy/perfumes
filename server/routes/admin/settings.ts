import express from 'express';
import { query } from '../../db';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorize('admin'));

// ============================================
// SITE SETTINGS ROUTES
// ============================================

// Get all site settings
router.get('/site-settings', async (req, res) => {
  try {
    console.log('Fetching all site settings');
    
    const result = await query(
      `SELECT * FROM site_settings ORDER BY category, setting_key`
    );

    console.log('Site settings result:', result.rows.length, 'rows');

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
      error: error.message
    });
  }
});

// Get site setting by key
router.get('/site-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await query(
      `SELECT * FROM site_settings WHERE setting_key = $1`,
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// Update site setting
router.put('/site-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value, description } = req.body;
    const user = (req as any).user;
    const userId = user?.id || user?.userId || null;

    console.log('Update site setting request:', { key, setting_value, description, userId, user });

    // Validate input
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Setting key is required'
      });
    }

    if (setting_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Setting value is required'
      });
    }

    // Log the database query
    console.log('Executing database query for key:', key);
    
    // For site settings, the updated_by field is optional
    let result;
    if (userId) {
      result = await query(
        `UPDATE site_settings 
         SET setting_value = $1, description = COALESCE($2, description), updated_by = $3, updated_at = CURRENT_TIMESTAMP
         WHERE setting_key = $4
         RETURNING *`,
        [setting_value, description, userId, key]
      );
    } else {
      result = await query(
        `UPDATE site_settings 
         SET setting_value = $1, description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP
         WHERE setting_key = $3
         RETURNING *`,
        [setting_value, description, key]
      );
    }

    console.log('Database query result:', result);

    if (result.rows.length === 0) {
      console.log('Setting not found for key:', key);
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    console.log('Setting updated successfully:', result.rows[0]);
    
    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating site setting:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

// Create new site setting
router.post('/site-settings', async (req, res) => {
  try {
    const { setting_key, setting_value, setting_type, category, description, is_public } = req.body;
    const user = (req as any).user;
    const userId = user?.id || user?.userId || null;

    console.log('Creating new site setting:', { setting_key, setting_value, setting_type, category, description, is_public, userId });

    let result;
    if (userId) {
      result = await query(
        `INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_public, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [setting_key, setting_value, setting_type || 'text', category || 'general', description, is_public || false, userId]
      );
    } else {
      result = await query(
        `INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [setting_key, setting_value, setting_type || 'text', category || 'general', description, is_public || false]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating site setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create setting',
      error: error.message
    });
  }
});

// ============================================
// SOCIAL MEDIA ROUTES
// ============================================

// Get all social media accounts
router.get('/social-media', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM social_media_accounts ORDER BY display_order, platform`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media accounts',
      error: error.message
    });
  }
});

// Get single social media account
router.get('/social-media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM social_media_accounts WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media account',
      error: error.message
    });
  }
});

// Create social media account
router.post('/social-media', async (req, res) => {
  try {
    const { platform, platform_name, url, username, icon_name, is_active, display_order, follower_count, description } = req.body;

    const result = await query(
      `INSERT INTO social_media_accounts (platform, platform_name, url, username, icon_name, is_active, display_order, follower_count, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [platform, platform_name, url, username, icon_name, is_active !== false, display_order || 0, follower_count || 0, description]
    );

    res.status(201).json({
      success: true,
      message: 'Social media account created successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create social media account',
      error: error.message
    });
  }
});

// Update social media account
router.put('/social-media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, platform_name, url, username, icon_name, is_active, display_order, follower_count, description } = req.body;

    const result = await query(
      `UPDATE social_media_accounts 
       SET platform = COALESCE($1, platform),
           platform_name = COALESCE($2, platform_name),
           url = COALESCE($3, url),
           username = COALESCE($4, username),
           icon_name = COALESCE($5, icon_name),
           is_active = COALESCE($6, is_active),
           display_order = COALESCE($7, display_order),
           follower_count = COALESCE($8, follower_count),
           description = COALESCE($9, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [platform, platform_name, url, username, icon_name, is_active, display_order, follower_count, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    res.json({
      success: true,
      message: 'Social media account updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update social media account',
      error: error.message
    });
  }
});

// Delete social media account
router.delete('/social-media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM social_media_accounts WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media account not found'
      });
    }

    res.json({
      success: true,
      message: 'Social media account deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete social media account',
      error: error.message
    });
  }
});

// ============================================
// CONTACT INFORMATION ROUTES
// ============================================

// Get all contact information
router.get('/contact-info', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM contact_information ORDER BY display_order, contact_type`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information',
      error: error.message
    });
  }
});

// Get single contact info
router.get('/contact-info/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM contact_information WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information',
      error: error.message
    });
  }
});

// Create contact information
router.post('/contact-info', async (req, res) => {
  try {
    const { contact_type, label, value, is_primary, is_active, display_order, icon_name, additional_info } = req.body;

    const result = await query(
      `INSERT INTO contact_information (contact_type, label, value, is_primary, is_active, display_order, icon_name, additional_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [contact_type, label, value, is_primary || false, is_active !== false, display_order || 0, icon_name, additional_info]
    );

    res.status(201).json({
      success: true,
      message: 'Contact information created successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create contact information',
      error: error.message
    });
  }
});

// Update contact information
router.put('/contact-info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_type, label, value, is_primary, is_active, display_order, icon_name, additional_info } = req.body;

    const result = await query(
      `UPDATE contact_information
       SET contact_type = COALESCE($1, contact_type),
           label = COALESCE($2, label),
           value = COALESCE($3, value),
           is_primary = COALESCE($4, is_primary),
           is_active = COALESCE($5, is_active),
           display_order = COALESCE($6, display_order),
           icon_name = COALESCE($7, icon_name),
           additional_info = COALESCE($8, additional_info),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [contact_type, label, value, is_primary, is_active, display_order, icon_name, additional_info, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information',
      error: error.message
    });
  }
});

// Delete contact information
router.delete('/contact-info/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM contact_information WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact information deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact information',
      error: error.message
    });
  }
});

// ============================================
// BUSINESS HOURS ROUTES
// ============================================

// Get all business hours
router.get('/business-hours', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM business_hours ORDER BY day_of_week`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business hours',
      error: error.message
    });
  }
});

// Update business hours for a specific day
router.put('/business-hours/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const { is_open, open_time, close_time, is_24_hours, notes } = req.body;

    const result = await query(
      `UPDATE business_hours
       SET is_open = COALESCE($1, is_open),
           open_time = $2,
           close_time = $3,
           is_24_hours = COALESCE($4, is_24_hours),
           notes = COALESCE($5, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE day_of_week = $6
       RETURNING *`,
      [is_open, open_time, close_time, is_24_hours, notes, day]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business hours not found for this day'
      });
    }

    res.json({
      success: true,
      message: 'Business hours updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update business hours',
      error: error.message
    });
  }
});

// ============================================
// FOOTER LINKS ROUTES
// ============================================

// Get all footer links
router.get('/footer-links', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM footer_links ORDER BY section_name, display_order`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer links',
      error: error.message
    });
  }
});

// Create footer link
router.post('/footer-links', async (req, res) => {
  try {
    const { section_name, link_text, link_url, display_order, is_active, opens_new_tab } = req.body;

    const result = await query(
      `INSERT INTO footer_links (section_name, link_text, link_url, display_order, is_active, opens_new_tab)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [section_name, link_text, link_url, display_order || 0, is_active !== false, opens_new_tab || false]
    );

    res.status(201).json({
      success: true,
      message: 'Footer link created successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create footer link',
      error: error.message
    });
  }
});

// Update footer link
router.put('/footer-links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { section_name, link_text, link_url, display_order, is_active, opens_new_tab } = req.body;

    const result = await query(
      `UPDATE footer_links
       SET section_name = COALESCE($1, section_name),
           link_text = COALESCE($2, link_text),
           link_url = COALESCE($3, link_url),
           display_order = COALESCE($4, display_order),
           is_active = COALESCE($5, is_active),
           opens_new_tab = COALESCE($6, opens_new_tab),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [section_name, link_text, link_url, display_order, is_active, opens_new_tab, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer link not found'
      });
    }

    res.json({
      success: true,
      message: 'Footer link updated successfully',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update footer link',
      error: error.message
    });
  }
});

// Delete footer link
router.delete('/footer-links/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM footer_links WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer link not found'
      });
    }

    res.json({
      success: true,
      message: 'Footer link deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete footer link',
      error: error.message
    });
  }
});

// ============================================
// FILE UPLOAD ROUTES
// ============================================

// Upload file (logo, etc.)
router.post('/upload', async (req, res) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // For now, we'll store the base64 data URL directly
    // In production, you might want to save to cloud storage (S3, etc.)
    // and return a URL to the stored file

    res.json({
      success: true,
      data: {
        url: file // Return the base64 data URL
      }
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

export default router;

