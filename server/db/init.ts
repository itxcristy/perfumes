import fs from 'fs';
import path from 'path';
import { query } from './connection';
import { isTableEmpty } from './utils';

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} schema statements...`);

    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.error('Schema error:', error.message);
          throw error;
        }
      }
    }

    console.log('✓ Database schema initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize schema:', error);
    throw error;
  }
}

/**
 * Seed database with comprehensive sample data
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Check if database is empty by checking if the profiles table is empty
    const isEmpty = await isTableEmpty('profiles');
    if (!isEmpty) {
      console.log('ℹ️  Database already contains data, skipping seed');
      return;
    }

    console.log('🌱 Seeding database with comprehensive sample data...');

    // Add sample categories
    await query(`
      INSERT INTO public.categories (name, slug, description, sort_order, is_active)
      VALUES 
        ('Perfumes', 'perfumes', 'Premium perfumes collection', 1, true),
        ('Colognes', 'colognes', 'Fresh colognes', 2, true),
        ('Fragrances', 'fragrances', 'Luxury fragrances', 3, true),
        ('Limited Edition', 'limited-edition', 'Exclusive limited edition scents', 4, true),
        ('Seasonal', 'seasonal', 'Scents for every season', 5, true)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Add sample products
    await query(`
      INSERT INTO public.products (name, slug, description, short_description, price, original_price, stock, sku, is_active, is_featured, show_on_homepage, rating, review_count)
      VALUES 
        ('Midnight Oud', 'midnight-oud', 'A luxurious oud fragrance with hints of rose and amber', 'Luxurious oud fragrance', 120.00, 150.00, 50, 'PERF-MIDNIGHT-OUD', true, true, true, 4.8, 12),
        ('Citrus Burst', 'citrus-burst', 'Refreshing citrus blend with lemon, lime, and bergamot', 'Refreshing citrus blend', 85.00, 100.00, 30, 'COL-CITRUS-BURST', true, true, true, 4.5, 8),
        ('Ocean Mist', 'ocean-mist', 'Marine scent with sea salt and driftwood notes', 'Marine scent with sea salt', 95.00, 110.00, 25, 'FRAG-OCEAN-MIST', true, false, true, 4.3, 5),
        ('Vanilla Dream', 'vanilla-dream', 'Sweet vanilla with caramel and tonka bean', 'Sweet vanilla fragrance', 75.00, 85.00, 40, 'PERF-VANILLA-DREAM', true, true, true, 4.7, 15),
        ('Spice Route', 'spice-route', 'Warm spices including cinnamon, cardamom, and clove', 'Warm spicy fragrance', 110.00, 130.00, 20, 'COL-SPICE-ROUTE', true, false, true, 4.6, 9)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Add sample admin user (password is 'admin123' hashed)
    await query(`
      INSERT INTO public.profiles (email, password_hash, full_name, role, is_active, email_verified)
      VALUES 
        ('admin@example.com', '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', 'Admin User', 'admin', true, true),
        ('seller@example.com', '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', 'Seller User', 'seller', true, true),
        ('customer@example.com', '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', 'Customer User', 'customer', true, true)
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✓ Database seeded successfully with sample data');
  } catch (error) {
    console.error('✗ Failed to seed database:', error);
    throw error;
  }
}