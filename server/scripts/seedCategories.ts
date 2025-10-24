import { pool } from '../db/connection.js';

/**
 * Seed Categories Script
 * Populates the database with perfume categories
 */

const categories = [
  {
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Luxurious perfumes for every occasion',
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    sort_order: 1
  },
  {
    name: 'Colognes',
    slug: 'colognes',
    description: 'Fresh and invigorating colognes',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    sort_order: 2
  },
  {
    name: 'Fragrances',
    slug: 'fragrances',
    description: 'Signature fragrances that define you',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    sort_order: 3
  },
  {
    name: 'Attars',
    slug: 'attars',
    description: 'Traditional attars with rich heritage',
    image_url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
    sort_order: 4
  },
  {
    name: 'Essential Oils',
    slug: 'essential-oils',
    description: 'Pure essential oils for aromatherapy',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    sort_order: 5
  },
  {
    name: 'Oud Collection',
    slug: 'oud-collection',
    description: 'Premium oud fragrances',
    image_url: 'https://images.unsplash.com/photo-1587556930116-1a5e8e4e8a8e?w=800&q=80',
    sort_order: 6
  },
  {
    name: 'Floral Scents',
    slug: 'floral-scents',
    description: 'Delicate floral fragrances',
    image_url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
    sort_order: 7
  },
  {
    name: 'Woody Fragrances',
    slug: 'woody-fragrances',
    description: 'Earthy and grounding woody scents',
    image_url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
    sort_order: 8
  }
];

async function seedCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting category seeding...\n');
    
    // Clear existing categories (optional)
    // await client.query('DELETE FROM categories');
    // console.log('🗑️  Cleared existing categories\n');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const category of categories) {
      const query = `
        INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
        RETURNING id, name, (xmax = 0) AS inserted
      `;
      
      const values = [
        category.name,
        category.slug,
        category.description,
        category.image_url,
        category.sort_order
      ];
      
      const result = await client.query(query, values);
      
      if (result.rows.length > 0) {
        const wasInserted = result.rows[0].inserted;
        if (wasInserted) {
          insertedCount++;
          console.log(`✅ Added: ${result.rows[0].name}`);
        } else {
          updatedCount++;
          console.log(`🔄 Updated: ${result.rows[0].name}`);
        }
      }
    }
    
    // Update product counts for each category
    console.log('\n📊 Updating product counts...');
    await client.query(`
      UPDATE categories c
      SET sort_order = (
        SELECT COUNT(*)
        FROM products p
        WHERE p.category_id = c.id
      )
      FROM (
        SELECT category_id, COUNT(*) as product_count
        FROM products
        WHERE category_id IS NOT NULL
        GROUP BY category_id
      ) pc
      WHERE c.id = pc.category_id
    `);
    
    console.log(`\n🎉 Category seeding completed!`);
    console.log(`   - Inserted: ${insertedCount} categories`);
    console.log(`   - Updated: ${updatedCount} categories`);
    console.log(`   - Total: ${insertedCount + updatedCount} categories\n`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedCategories()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

