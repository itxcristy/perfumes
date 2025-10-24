import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './connection';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Seed database with sample data (optional)
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Check if data already exists
    const result = await query('SELECT COUNT(*) FROM public.profiles');
    if (result.rows[0].count > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }

    console.log('Seeding database with sample data...');

    // Add sample categories
    await query(`
      INSERT INTO public.categories (name, slug, description, sort_order, is_active)
      VALUES 
        ('Perfumes', 'perfumes', 'Premium perfumes collection', 1, true),
        ('Colognes', 'colognes', 'Fresh colognes', 2, true),
        ('Fragrances', 'fragrances', 'Luxury fragrances', 3, true)
    `);

    console.log('✓ Database seeded successfully');
  } catch (error) {
    console.error('✗ Failed to seed database:', error);
    throw error;
  }
}

