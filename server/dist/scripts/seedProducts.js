"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../db/connection");
const products = [
    {
        name: 'Oud Royale',
        slug: 'oud-royale',
        description: 'A luxurious blend of rare oud wood with hints of rose and amber. This exquisite fragrance captures the essence of Middle Eastern perfumery with its rich, woody base notes complemented by delicate floral undertones. Perfect for special occasions and evening wear.',
        short_description: 'Luxurious oud wood with rose and amber',
        price: 149.99,
        original_price: 199.99,
        category_slug: 'oud-collection',
        stock: 50,
        min_stock_level: 10,
        sku: 'OUD-ROY-001',
        images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
        is_featured: true,
        is_active: true
    },
    {
        name: 'Jasmine Nights',
        slug: 'jasmine-nights',
        description: 'An enchanting floral fragrance featuring night-blooming jasmine, white musk, and vanilla. This romantic scent evokes moonlit gardens and warm summer evenings. The delicate balance of floral and sweet notes makes it perfect for both day and night wear.',
        short_description: 'Night-blooming jasmine with white musk',
        price: 89.99,
        original_price: null,
        category_slug: 'floral-scents',
        stock: 75,
        min_stock_level: 15,
        sku: 'JAS-NIG-001',
        images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=500'],
        is_featured: true,
        is_active: true
    },
    {
        name: 'Sandalwood Essence',
        slug: 'sandalwood-essence',
        description: 'Pure sandalwood essential oil from sustainably sourced Indian sandalwood trees. This warm, woody fragrance has been used for centuries in meditation and spiritual practices. Its calming properties make it ideal for relaxation and aromatherapy.',
        short_description: 'Pure Indian sandalwood essential oil',
        price: 69.99,
        original_price: null,
        category_slug: 'essential-oils',
        stock: 100,
        min_stock_level: 20,
        sku: 'SAN-ESS-001',
        images: ['https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=500'],
        is_featured: false,
        is_active: true
    },
    {
        name: 'Citrus Breeze',
        slug: 'citrus-breeze',
        description: 'A refreshing cologne featuring bergamot, lemon, and orange blossom. This invigorating scent is perfect for daily wear, offering a clean and energizing aroma that lasts throughout the day. Ideal for warm weather and active lifestyles.',
        short_description: 'Fresh citrus cologne for daily wear',
        price: 59.99,
        original_price: 79.99,
        category_slug: 'colognes',
        stock: 120,
        min_stock_level: 25,
        sku: 'CIT-BRE-001',
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
        is_featured: false,
        is_active: true
    },
    {
        name: 'Amber Mystique',
        slug: 'amber-mystique',
        description: 'A mysterious oriental fragrance with amber, patchouli, and spices. This complex scent unfolds in layers, revealing different notes throughout the day. The warm, resinous base is complemented by exotic spices and a touch of sweetness.',
        short_description: 'Oriental amber with patchouli and spices',
        price: 119.99,
        original_price: null,
        category_slug: 'fragrances',
        stock: 60,
        min_stock_level: 12,
        sku: 'AMB-MYS-001',
        images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500'],
        is_featured: true,
        is_active: true
    },
    {
        name: 'Rose Attar',
        slug: 'rose-attar',
        description: 'Traditional rose attar made from Bulgarian roses using ancient distillation methods. This concentrated perfume oil captures the pure essence of roses without any alcohol. A single drop provides long-lasting fragrance that develops beautifully on the skin.',
        short_description: 'Pure Bulgarian rose attar oil',
        price: 79.99,
        original_price: null,
        category_slug: 'attars',
        stock: 45,
        min_stock_level: 10,
        sku: 'ROS-ATT-001',
        images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500'],
        is_featured: false,
        is_active: true
    },
    {
        name: 'Cedar Forest',
        slug: 'cedar-forest',
        description: 'A woody fragrance inspired by ancient cedar forests. This masculine scent combines cedarwood, vetiver, and moss for an earthy, grounding aroma. Perfect for those who appreciate natural, outdoorsy fragrances with depth and character.',
        short_description: 'Woody cedarwood with vetiver and moss',
        price: 94.99,
        original_price: 109.99,
        category_slug: 'woody-fragrances',
        stock: 80,
        min_stock_level: 15,
        sku: 'CED-FOR-001',
        images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=500'],
        is_featured: false,
        is_active: true
    },
    {
        name: 'Lavender Dreams',
        slug: 'lavender-dreams',
        description: 'Calming lavender essential oil perfect for relaxation and sleep. This therapeutic-grade oil is steam-distilled from French lavender flowers. Known for its stress-relieving properties, it can be used in diffusers, baths, or applied topically when diluted.',
        short_description: 'French lavender essential oil',
        price: 39.99,
        original_price: null,
        category_slug: 'essential-oils',
        stock: 150,
        min_stock_level: 30,
        sku: 'LAV-DRE-001',
        images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500'],
        is_featured: false,
        is_active: true
    }
];
async function seedProducts() {
    try {
        console.log('🔧 Initializing database connection...');
        await (0, connection_1.initializeDatabase)();
        console.log('🌱 Starting product seeding...\n');
        let insertedCount = 0;
        let skippedCount = 0;
        for (const product of products) {
            // Get category ID from slug
            const categoryResult = await (0, connection_1.query)('SELECT id FROM public.categories WHERE slug = $1', [product.category_slug]);
            if (categoryResult.rows.length === 0) {
                console.log(`⚠️  Skipped: ${product.name} (category not found: ${product.category_slug})`);
                skippedCount++;
                continue;
            }
            const categoryId = categoryResult.rows[0].id;
            // Check if product already exists
            const existingProduct = await (0, connection_1.query)('SELECT id FROM public.products WHERE slug = $1', [product.slug]);
            if (existingProduct.rows.length > 0) {
                console.log(`⏭️  Skipped: ${product.name} (already exists)`);
                skippedCount++;
                continue;
            }
            // Insert product
            const sql = `
        INSERT INTO public.products (
          name, slug, description, short_description, price, original_price,
          category_id, stock, min_stock_level, sku, images, is_featured, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, name
      `;
            const values = [
                product.name,
                product.slug,
                product.description,
                product.short_description,
                product.price,
                product.original_price,
                categoryId,
                product.stock,
                product.min_stock_level,
                product.sku,
                product.images, // Pass as array, not JSON string
                product.is_featured,
                product.is_active
            ];
            const result = await (0, connection_1.query)(sql, values);
            if (result.rows.length > 0) {
                insertedCount++;
                console.log(`✅ Added: ${result.rows[0].name}`);
            }
        }
        console.log(`\n🎉 Product seeding completed!`);
        console.log(`   - Inserted: ${insertedCount} products`);
        console.log(`   - Skipped: ${skippedCount} products`);
        console.log(`   - Total: ${insertedCount + skippedCount} products\n`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding products:', error.message);
        console.error(error);
        process.exit(1);
    }
}
// Run the seeding
seedProducts();
//# sourceMappingURL=seedProducts.js.map