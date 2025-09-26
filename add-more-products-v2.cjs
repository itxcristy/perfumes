// This script adds more products to existing categories in the database
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define additional products for each category (15 more products per category to make it 20 total)
const additionalProductsToAdd = [
    // Islamic Books - 15 more products
    {
        name: "Sahih Al-Bukhari",
        description: "The most authentic collection of Prophetic traditions",
        price: 29.99,
        category_name: "Islamic Books",
        stock: 25,
        image_url: "/src/assets/images/products/islamic-books/book-1.svg",
        featured: true
    },
    {
        name: "Tafsir Ibn Kathir",
        description: "Classical Quranic commentary by Imam Ibn Kathir",
        price: 34.99,
        category_name: "Islamic Books",
        stock: 20,
        image_url: "/src/assets/images/products/islamic-books/book-2.svg",
        featured: true
    },
    {
        name: "The Quran with Translation",
        description: "Holy Quran with English translation and commentary",
        price: 22.99,
        category_name: "Islamic Books",
        stock: 35,
        image_url: "/src/assets/images/products/islamic-books/book-3.svg",
        featured: false
    },
    {
        name: "Islamic Jurisprudence",
        description: "Understanding Islamic law and its applications",
        price: 27.99,
        category_name: "Islamic Books",
        stock: 30,
        image_url: "/src/assets/images/products/islamic-books/book-4.svg",
        featured: true
    },
    {
        name: "Stories of the Prophets",
        description: "Inspiring stories of prophets from Adam to Muhammad",
        price: 18.99,
        category_name: "Islamic Books",
        stock: 40,
        image_url: "/src/assets/images/products/islamic-books/book-5.svg",
        featured: false
    },
    {
        name: "The Life of Imam Ali",
        description: "Biography of the first Shia Imam and fourth Caliph",
        price: 21.99,
        category_name: "Islamic Books",
        stock: 35,
        image_url: "/src/assets/images/products/islamic-books/book-1.svg",
        featured: true
    },
    {
        name: "Islamic History",
        description: "Comprehensive history of Islamic civilization",
        price: 25.99,
        category_name: "Islamic Books",
        stock: 30,
        image_url: "/src/assets/images/products/islamic-books/book-2.svg",
        featured: false
    },
    {
        name: "Fiqh of Worship",
        description: "Islamic jurisprudence of prayers, fasting, and pilgrimage",
        price: 23.99,
        category_name: "Islamic Books",
        stock: 35,
        image_url: "/src/assets/images/products/islamic-books/book-3.svg",
        featured: true
    },
    {
        name: "Moral Teachings of Islam",
        description: "Ethical principles and moral values in Islam",
        price: 17.99,
        category_name: "Islamic Books",
        stock: 45,
        image_url: "/src/assets/images/products/islamic-books/book-4.svg",
        featured: false
    },
    {
        name: "Women in Islam",
        description: "The status and rights of women in Islamic society",
        price: 20.99,
        category_name: "Islamic Books",
        stock: 40,
        image_url: "/src/assets/images/products/islamic-books/book-5.svg",
        featured: true
    },
    {
        name: "Islamic Spirituality",
        description: "Understanding Tasawwuf and spiritual development",
        price: 26.99,
        category_name: "Islamic Books",
        stock: 25,
        image_url: "/src/assets/images/products/islamic-books/book-1.svg",
        featured: true
    },
    {
        name: "Hadith Literature",
        description: "Study of Prophetic traditions and their authenticity",
        price: 22.99,
        category_name: "Islamic Books",
        stock: 30,
        image_url: "/src/assets/images/products/islamic-books/book-2.svg",
        featured: false
    },
    {
        name: "Islamic Economics",
        description: "Economic principles based on Islamic teachings",
        price: 28.99,
        category_name: "Islamic Books",
        stock: 20,
        image_url: "/src/assets/images/products/islamic-books/book-3.svg",
        featured: true
    },
    {
        name: "Comparative Religion",
        description: "Understanding Islam in comparison to other faiths",
        price: 19.99,
        category_name: "Islamic Books",
        stock: 35,
        image_url: "/src/assets/images/products/islamic-books/book-4.svg",
        featured: false
    },
    {
        name: "Islamic Art and Architecture",
        description: "History and development of Islamic artistic traditions",
        price: 31.99,
        category_name: "Islamic Books",
        stock: 25,
        image_url: "/src/assets/images/products/islamic-books/book-5.svg",
        featured: true
    }
];

async function addAdditionalProducts() {
    try {
        console.log("Starting to add additional products...");

        // First, get existing categories
        const { data: existingCategories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, slug');

        if (categoriesError) {
            console.error("Error fetching existing categories:", categoriesError);
            return;
        }

        console.log(`Found ${existingCategories.length} existing categories`);

        // Create category map from existing categories
        const categoryMap = {};
        for (const category of existingCategories) {
            categoryMap[category.name] = category.id;
        }

        // Add additional products
        let productCount = 0;
        for (const productData of additionalProductsToAdd) {
            const categoryId = categoryMap[productData.category_name];

            if (!categoryId) {
                console.error(`Could not find category for product: ${productData.name}`);
                continue;
            }

            console.log(`Adding product: ${productData.name} to category: ${productData.category_name}`);

            // Try to insert with the same structure as the working script
            const { data, error } = await supabase
                .from('products')
                .insert({
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    category_id: categoryId,
                    stock: productData.stock,
                    image_url: productData.image_url,
                    featured: productData.featured,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error(`Error adding product ${productData.name}:`, error);
                // Try alternative approach with different field names
                const { data: altData, error: altError } = await supabase
                    .from('products')
                    .insert({
                        name: productData.name,
                        description: productData.description,
                        price: productData.price,
                        category_id: categoryId,
                        stock: productData.stock,
                        images: [productData.image_url],
                        is_featured: productData.featured,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (altError) {
                    console.error(`Alternative error adding product ${productData.name}:`, altError);
                    continue;
                }

                productCount++;
                console.log(`Product added (alternative method): ${altData.name} with ID: ${altData.id}`);
                continue;
            }

            productCount++;
            console.log(`Product added: ${data.name} with ID: ${data.id}`);
        }

        console.log(`Successfully added ${productCount} additional products!`);
    } catch (error) {
        console.error("Error adding additional products:", error);
    }
}

// Run the function
addAdditionalProducts();