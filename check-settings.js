import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('./.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sufi_essences',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function checkSettings() {
    const client = await pool.connect();

    try {
        console.log('Checking if settings exist...');

        const result = await client.query(
            `SELECT setting_key, setting_value FROM site_settings 
       WHERE setting_key IN ('currency_symbol', 'free_shipping_threshold')`
        );

        console.log('Found settings:', result.rows);

        // Also check all settings
        const allSettings = await client.query('SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key');
        console.log('All settings:', allSettings.rows);

    } catch (error) {
        console.error('Error checking settings:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSettings();