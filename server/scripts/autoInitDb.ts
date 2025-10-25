import dotenv from 'dotenv';
import path from 'path';
// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Auto-initialize database with schema and sample data
 * This script is designed to run automatically when the server starts
 * to ensure the database is properly set up on new installations
 */

// Categories data
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

// Sample products data
const sampleProducts = [
  // Featured Products (3)
  {
    name: 'Royal Oud Attar',
    description: 'A luxurious blend of aged oud wood with hints of rose and amber. Perfect for special occasions.',
    price: 89.99,
    original_price: 129.99,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
    category_index: 0, // Perfumes
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
    category_index: 6, // Floral Scents
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
    category_index: 2, // Fragrances
    is_featured: true,
    rating: 4.7,
    review_count: 156,
    stock: 38,
    tags: ['amber', 'musk', 'featured']
  },
  // Additional products
  {
    name: 'Sandalwood Supreme',
    description: 'Pure sandalwood attar from Mysore. Rich, creamy, and deeply meditative.',
    price: 79.99,
    original_price: 109.99,
    images: ['https://images.unsplash.com/photo-1587556930116-1a5e8e4e8a8e?w=500'],
    category_index: 3, // Attars
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
    category_index: 3, // Attars
    is_featured: false,
    rating: 4.8,
    review_count: 289,
    stock: 52,
    tags: ['rose', 'floral', 'bestseller']
  }
];

// Sample users
const sampleUsers = [
  {
    email: 'admin@example.com',
    password_hash: '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', // 'admin123'
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    email_verified: true
  },
  {
    email: 'seller@example.com',
    password_hash: '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', // 'admin123'
    full_name: 'Seller User',
    role: 'seller',
    is_active: true,
    email_verified: true
  },
  {
    email: 'customer@example.com',
    password_hash: '$2b$10$rVv68ShX8dJ3PQxUQ8jIzOqFz9H5G9H5G9H5G9H5G9H5G9H5G9H5G', // 'admin123'
    full_name: 'Customer User',
    role: 'customer',
    is_active: true,
    email_verified: true
  }
];

async function seedCategories(query: Function) {
  console.log('🌱 Seeding categories...');
  
  let insertedCount = 0;
  let updatedCount = 0;

  for (const category of categories) {
    const sql = `
      INSERT INTO public.categories (name, slug, description, image_url, sort_order, is_active)
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

    const result = await query(sql, values);

    if (result.rows.length > 0) {
      const wasInserted = result.rows[0].inserted;
      if (wasInserted) {
        insertedCount++;
        console.log(`✅ Added category: ${result.rows[0].name}`);
      } else {
        updatedCount++;
        console.log(`🔄 Updated category: ${result.rows[0].name}`);
      }
    }
  }

  console.log(`✅ Categories seeded - Inserted: ${insertedCount}, Updated: ${updatedCount}`);
  return insertedCount + updatedCount;
}

async function seedUsers(query: Function) {
  console.log('👥 Seeding sample users...');
  
  let insertedCount = 0;

  for (const user of sampleUsers) {
    const sql = `
      INSERT INTO public.profiles (email, password_hash, full_name, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `;

    const values = [
      user.email,
      user.password_hash,
      user.full_name,
      user.role,
      user.is_active,
      user.email_verified
    ];

    const result = await query(sql, values);

    if (result.rows.length > 0) {
      insertedCount++;
      console.log(`✅ Added user: ${result.rows[0].email}`);
    }
  }

  console.log(`✅ Users seeded - Inserted: ${insertedCount}`);
  return insertedCount;
}

async function seedProducts(query: Function) {
  console.log('🛍️  Seeding sample products...');
  
  // First get all categories to assign to products
  const categoriesResult = await query('SELECT id FROM public.categories ORDER BY sort_order');
  const categoryIds = categoriesResult.rows.map((row: any) => row.id);
  
  if (categoryIds.length === 0) {
    console.log('⚠️  No categories found, skipping product seeding');
    return 0;
  }
  
  let insertedCount = 0;

  for (const product of sampleProducts) {
    // Assign category based on index, fallback to first category
    const categoryId = categoryIds[product.category_index] || categoryIds[0];
    
    const sql = `
      INSERT INTO public.products (
        name, description, price, original_price, images,
        category_id, is_featured, rating, review_count, stock, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, name
    `;

    // Generate slug from name
    const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const values = [
      product.name,
      product.description,
      product.price,
      product.original_price,
      product.images,
      categoryId,
      product.is_featured,
      product.rating,
      product.review_count,
      product.stock,
      product.tags
    ];
    
    const result = await query(sql, values);
    
    if (result.rows.length > 0) {
      insertedCount++;
      console.log(`✅ Added product: ${result.rows[0].name}`);
    }
  }
  
  console.log(`✅ Products seeded - Inserted: ${insertedCount}`);
  return insertedCount;
}

/**
 * Auto-initialize the database
 * This function checks if the database needs to be initialized and does so if needed
 */
export async function autoInitializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting automatic database initialization...\n');

    // Import required modules
    const { initializeDatabase } = await import('../db/connection');
    const { initializeSchema } = await import('../db/init');
    const { isDatabaseInitialized } = await import('../db/utils');

    // Step 1: Initialize connection
    console.log('1️⃣  Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connection successful\n');

    // Check if database is already initialized
    const initialized = await isDatabaseInitialized();
    if (initialized) {
      console.log('ℹ️  Database already initialized, skipping schema creation');
    } else {
      // Step 2: Initialize schema
      console.log('2️⃣  Creating database schema...');
      await initializeSchema();
      console.log('✅ Schema created successfully\n');
    }

    // Import query function for seeding
    const { query } = await import('../db/connection');

    // Step 3: Seed categories
    console.log('3️⃣  Seeding categories...');
    await seedCategories(query);
    console.log('✅ Categories seeded successfully\n');

    // Step 4: Seed users
    console.log('4️⃣  Seeding sample users...');
    await seedUsers(query);
    console.log('✅ Sample users seeded successfully\n');

    // Step 5: Seed products
    console.log('5️⃣  Seeding sample products...');
    await seedProducts(query);
    console.log('✅ Sample products seeded successfully\n');

    console.log('🎉 Automatic database initialization complete!');
    console.log('   You can now access the application with the following credentials:');
    console.log('   - Admin: admin@example.com / admin123');
    console.log('   - Seller: seller@example.com / admin123');
    console.log('   - Customer: customer@example.com / admin123\n');
  } catch (error) {
    console.error('❌ Automatic database initialization failed:', error);
    throw error;
  }
}