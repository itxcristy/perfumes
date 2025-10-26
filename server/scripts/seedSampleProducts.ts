import { pool } from '../db/connection.js';

/**
 * Seed Sample Products Script
 * Populates the database with sample products for testing the home page
 */

const sampleProducts = [
  // Featured Products (3)
  {
    name: 'Royal Oud Attar',
    description: 'A luxurious blend of aged oud wood with hints of rose and amber. Perfect for special occasions.',
    price: 89.99,
    original_price: 129.99,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
    category_id: null, // Will be set dynamically
    is_featured: true,
    rating: 4.8,
    review_count: 127,
    stock: 45,
    tags: ['oud', 'luxury', 'featured']
  },
  {
    name: 'Jasmine Night Perfume',
    description: 'Enchanting jasmine essence captured at midnight. A floral masterpiece that lasts all day.',
    price: 64.99,
    original_price: 84.99,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
    category_id: null,
    is_featured: true,
    rating: 4.9,
    review_count: 203,
    stock: 62,
    tags: ['floral', 'jasmine', 'featured']
  },
  {
    name: 'Amber Musk Essence',
    description: 'Warm amber combined with soft musk creates an irresistible, long-lasting fragrance.',
    price: 74.99,
    original_price: 99.99,
    images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500'],
    category_id: null,
    is_featured: true,
    rating: 4.7,
    review_count: 156,
    stock: 38,
    tags: ['amber', 'musk', 'featured']
  },

  // Best Sellers (5)
  {
    name: 'Sandalwood Supreme',
    description: 'Pure sandalwood attar from Mysore. Rich, creamy, and deeply meditative.',
    price: 79.99,
    original_price: 109.99,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.9,
    review_count: 342,
    stock: 28,
    tags: ['sandalwood', 'bestseller']
  },
  {
    name: 'Rose Garden Attar',
    description: 'Authentic Bulgarian rose attar. The queen of flowers in its purest form.',
    price: 69.99,
    original_price: 89.99,
    images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.8,
    review_count: 289,
    stock: 52,
    tags: ['rose', 'floral', 'bestseller']
  },
  {
    name: 'Velvet Oud Noir',
    description: 'Dark, mysterious oud with leather and spice notes. For the bold and confident.',
    price: 94.99,
    original_price: 134.99,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.7,
    review_count: 198,
    stock: 31,
    tags: ['oud', 'spicy', 'bestseller']
  },
  {
    name: 'Citrus Breeze Cologne',
    description: 'Fresh and invigorating blend of bergamot, lemon, and orange. Perfect for daily wear.',
    price: 49.99,
    original_price: 64.99,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.6,
    review_count: 421,
    stock: 87,
    tags: ['citrus', 'fresh', 'bestseller']
  },
  {
    name: 'Lavender Dreams',
    description: 'Calming lavender with hints of vanilla. Promotes relaxation and peace.',
    price: 54.99,
    original_price: 69.99,
    images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.8,
    review_count: 267,
    stock: 64,
    tags: ['lavender', 'calming', 'bestseller']
  },

  // Latest Arrivals (5 - with recent dates)
  {
    name: 'Midnight Jasmine Elixir',
    description: 'NEW! Rare night-blooming jasmine captured in its most potent form.',
    price: 84.99,
    original_price: 109.99,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.5,
    review_count: 23,
    stock: 50,
    tags: ['jasmine', 'new', 'floral'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    name: 'Saffron Gold Attar',
    description: 'NEW! Precious saffron threads infused with pure attar base. Limited edition.',
    price: 119.99,
    original_price: 159.99,
    images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.7,
    review_count: 18,
    stock: 25,
    tags: ['saffron', 'new', 'luxury'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    name: 'Ocean Mist Perfume',
    description: 'NEW! Fresh aquatic fragrance with sea salt and driftwood. Unisex appeal.',
    price: 59.99,
    original_price: 79.99,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.4,
    review_count: 31,
    stock: 72,
    tags: ['aquatic', 'new', 'fresh'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    name: 'Patchouli Earth',
    description: 'NEW! Deep, earthy patchouli with vetiver and cedarwood. Grounding and sensual.',
    price: 69.99,
    original_price: 89.99,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.6,
    review_count: 27,
    stock: 41,
    tags: ['patchouli', 'new', 'earthy'],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    name: 'White Tea Serenity',
    description: 'NEW! Delicate white tea with soft florals. Clean, elegant, and timeless.',
    price: 64.99,
    original_price: 84.99,
    images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=500'],
    category_id: null,
    is_featured: false,
    rating: 4.5,
    review_count: 19,
    stock: 58,
    tags: ['tea', 'new', 'fresh'],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
  }
];

async function seedSampleProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting sample product seeding...\n');
    
    // Get existing categories
    const categoriesResult = await client.query('SELECT id, name FROM categories LIMIT 5');
    const categories = categoriesResult.rows;
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Please run the main database initialization first.');
      return;
    }
    
    console.log(`✅ Found ${categories.length} categories\n`);
    
    // Clear existing products (optional - comment out if you want to keep existing data)
    // await client.query('DELETE FROM products');
    // console.log('🗑️  Cleared existing products\n');
    
    let insertedCount = 0;
    
    for (const product of sampleProducts) {
      // Assign random category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      product.category_id = randomCategory.id;
      
      const query = `
        INSERT INTO products (
          name, description, price, original_price, images,
          category_id, is_featured, rating, review_count, stock, tags, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, name
      `;

      const values = [
        product.name,
        product.description,
        product.price,
        product.original_price,
        product.images,
        product.category_id,
        product.is_featured,
        product.rating,
        product.review_count,
        product.stock,
        product.tags,
        product.created_at || new Date()
      ];
      
      const result = await client.query(query, values);
      
      if (result.rows.length > 0) {
        insertedCount++;
        console.log(`✅ Added: ${result.rows[0].name}`);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} sample products!`);
    console.log('\n📊 Summary:');
    console.log(`   - Featured Products: 3`);
    console.log(`   - Best Sellers: 5`);
    console.log(`   - Latest Arrivals: 5`);
    console.log(`   - Total: ${insertedCount} products\n`);
    
  } catch (error) {
    console.error('❌ Error seeding sample products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedSampleProducts()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

