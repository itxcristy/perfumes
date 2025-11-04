import express from 'express';
import { query } from '../../db';

const router = express.Router();

// ============================================
// PUBLIC SITE SETTINGS ROUTES
// ============================================

// Get all public site settings
router.get('/site-settings', async (req, res) => {
  try {
    console.log('Fetching public site settings');
    
    const result = await query(
      `SELECT setting_key, setting_value, setting_type, category, description 
       FROM site_settings 
       WHERE is_public = true 
       ORDER BY category, setting_key`
    );

    console.log('Public site settings result:', result.rows.length, 'rows');

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching public site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public site settings',
      error: error.message
    });
  }
});

// Get public site setting by key
router.get('/site-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await query(
      `SELECT setting_key, setting_value, setting_type, category, description 
       FROM site_settings 
       WHERE setting_key = $1 AND is_public = true`,
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Public setting not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public setting',
      error: error.message
    });
  }
});

// Get all public social media accounts
router.get('/social-media', async (req, res) => {
  try {
    const result = await query(
      `SELECT platform, platform_name, url, username, icon_name, follower_count, description
       FROM social_media_accounts 
       WHERE is_active = true 
       ORDER BY display_order, platform`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public social media accounts',
      error: error.message
    });
  }
});

// Get all public contact information
router.get('/contact-info', async (req, res) => {
  try {
    const result = await query(
      `SELECT contact_type, label, value, is_primary, icon_name, additional_info
       FROM contact_information 
       WHERE is_active = true 
       ORDER BY display_order, contact_type`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public contact information',
      error: error.message
    });
  }
});

// Get all public footer links
router.get('/footer-links', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, section_name, link_text, link_url, opens_new_tab
       FROM footer_links
       WHERE is_active = true
       ORDER BY section_name, display_order`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public footer links',
      error: error.message
    });
  }
});

// Get business hours
router.get('/business-hours', async (req, res) => {
  try {
    const result = await query(
      `SELECT day_of_week, is_open, open_time, close_time, is_24_hours, notes
       FROM business_hours 
       ORDER BY day_of_week`
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

export default router;