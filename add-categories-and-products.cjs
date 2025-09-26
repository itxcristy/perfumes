// This script adds categories and products to the database
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the categories to add
const categoriesToAdd = [
    {
        name: "Islamic Books",
        description: "Collection of Islamic books and literature",
        image_url: "/src/assets/images/products/islamic-books/book-1.svg"
    },
    {
        name: "Customization",
        description: "Customization services for bottles, mugs, pens, and more",
        image_url: "/src/assets/images/products/customization/bottle-1.svg"
    },
    {
        name: "Abaya",
        description: "Elegant and modest abayas for women",
        image_url: "/src/assets/images/products/abaya/abaya-1.svg"
    },
    {
        name: "Hijabs",
        description: "Stylish and comfortable hijabs for daily wear",
        image_url: "/src/assets/images/products/hijabs/hijab-1.svg"
    },
    {
        name: "Jilbab",
        description: "Traditional and modern jilbabs for modest fashion",
        image_url: "/src/assets/images/products/jilbab/jilbab-1.svg"
    },
    {
        name: "Khimar",
        description: "Beautiful khimars for elegant coverage",
        image_url: "/src/assets/images/products/khimar/khimar-1.svg"
    },
    {
        name: "Nosepiece",
        description: "Decorative nosepieces and jewelry",
        image_url: "/src/assets/images/products/nosepiece/nosepiece-1.svg"
    },
    {
        name: "Alcohol Free Perfumes",
        description: "Luxury alcohol-free perfumes and attars",
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-1.svg"
    }
];

// Define products for each category (5 products per category)
const productsToAdd = [
    // Islamic Books
    {
        name: "The Sealed Nectar",
        description: "A comprehensive biography of Prophet Muhammad (PBUH)",
        price: 19.99,
        category_name: "Islamic Books",
        stock: 50,
        image_url: "/src/assets/images/products/islamic-books/book-1.svg",
        featured: true
    },
    {
        name: "Riyad as Salihin",
        description: "Gardens of the Righteous - A collection of hadith",
        price: 14.99,
        category_name: "Islamic Books",
        stock: 45,
        image_url: "/src/assets/images/products/islamic-books/book-2.svg",
        featured: true
    },
    {
        name: "Fortress of the Muslim",
        description: "Daily supplications from the Quran and Sunnah",
        price: 12.99,
        category_name: "Islamic Books",
        stock: 60,
        image_url: "/src/assets/images/products/islamic-books/book-3.svg",
        featured: false
    },
    {
        name: "40 Hadith Nawawi",
        description: "40 important hadiths with commentary",
        price: 16.99,
        category_name: "Islamic Books",
        stock: 40,
        image_url: "/src/assets/images/products/islamic-books/book-4.svg",
        featured: false
    },
    {
        name: "Islamic Finance",
        description: "Understanding Islamic banking and finance principles",
        price: 24.99,
        category_name: "Islamic Books",
        stock: 30,
        image_url: "/src/assets/images/products/islamic-books/book-5.svg",
        featured: true
    },

    // Customization
    {
        name: "Customized Perfume Bottle",
        description: "Personalized perfume bottle with name engraving",
        price: 34.99,
        category_name: "Customization",
        stock: 25,
        image_url: "/src/assets/images/products/customization/bottle-1.svg",
        featured: true
    },
    {
        name: "Personalized Mug",
        description: "Custom mug with Islamic calligraphy",
        price: 18.99,
        category_name: "Customization",
        stock: 40,
        image_url: "/src/assets/images/products/customization/mug-1.svg",
        featured: false
    },
    {
        name: "Engraved Pen Set",
        description: "Luxury pen set with personalized engraving",
        price: 29.99,
        category_name: "Customization",
        stock: 35,
        image_url: "/src/assets/images/products/customization/pen-1.svg",
        featured: true
    },
    {
        name: "Custom Wallet",
        description: "Leather wallet with personalized initials",
        price: 42.99,
        category_name: "Customization",
        stock: 20,
        image_url: "/src/assets/images/products/customization/wallet-1.svg",
        featured: false
    },
    {
        name: "A4 Size Frame",
        description: "Elegant A4 frame with Quranic verses",
        price: 39.99,
        category_name: "Customization",
        stock: 30,
        image_url: "/src/assets/images/products/customization/frame-a4-1.svg",
        featured: true
    },
    {
        name: "Mini Frame Collection",
        description: "Set of 3 mini frames with Islamic art",
        price: 27.99,
        category_name: "Customization",
        stock: 35,
        image_url: "/src/assets/images/products/customization/frame-mini-1.svg",
        featured: false
    },
    {
        name: "Wedding Frame",
        description: "Special wedding frame with Islamic motifs",
        price: 49.99,
        category_name: "Customization",
        stock: 15,
        image_url: "/src/assets/images/products/customization/frame-wedding-1.svg",
        featured: true
    },
    {
        name: "Handmade Keychain",
        description: "Beautiful resin keychain with Islamic symbols",
        price: 12.99,
        category_name: "Customization",
        stock: 50,
        image_url: "/src/assets/images/products/customization/keychain-1.svg",
        featured: false
    },
    {
        name: "Resin Rehal",
        description: "Handcrafted prayer book stand",
        price: 22.99,
        category_name: "Customization",
        stock: 25,
        image_url: "/src/assets/images/products/customization/rehal-1.svg",
        featured: true
    },
    {
        name: "Bookmark Set",
        description: "Set of 5 Islamic bookmarks",
        price: 9.99,
        category_name: "Customization",
        stock: 60,
        image_url: "/src/assets/images/products/customization/bookmark-1.svg",
        featured: false
    },
    {
        name: "Decorative Coaster Set",
        description: "Set of 4 resin coasters with Islamic patterns",
        price: 19.99,
        category_name: "Customization",
        stock: 40,
        image_url: "/src/assets/images/products/customization/coaster-1.svg",
        featured: false
    },
    {
        name: "Luxury Pen Stand",
        description: "Elegant pen stand with Quranic calligraphy",
        price: 32.99,
        category_name: "Customization",
        stock: 20,
        image_url: "/src/assets/images/products/customization/pen-stand-1.svg",
        featured: true
    },

    // Abaya
    {
        name: "Classic Black Abaya",
        description: "Elegant black abaya with subtle embroidery",
        price: 89.99,
        category_name: "Abaya",
        stock: 20,
        image_url: "/src/assets/images/products/abaya/abaya-1.svg",
        featured: true
    },
    {
        name: "Embroidered Abaya",
        description: "Beautifully embroidered abaya with floral patterns",
        price: 109.99,
        category_name: "Abaya",
        stock: 15,
        image_url: "/src/assets/images/products/abaya/abaya-2.svg",
        featured: true
    },
    {
        name: "Simple White Abaya",
        description: "Pure white abaya for special occasions",
        price: 94.99,
        category_name: "Abaya",
        stock: 18,
        image_url: "/src/assets/images/products/abaya/abaya-3.svg",
        featured: false
    },
    {
        name: "Designer Abaya",
        description: "Modern designer abaya with contemporary cuts",
        price: 129.99,
        category_name: "Abaya",
        stock: 12,
        image_url: "/src/assets/images/products/abaya/abaya-4.svg",
        featured: true
    },
    {
        name: "Casual Abaya",
        description: "Comfortable everyday abaya with side slits",
        price: 79.99,
        category_name: "Abaya",
        stock: 25,
        image_url: "/src/assets/images/products/abaya/abaya-5.svg",
        featured: false
    },

    // Hijabs
    {
        name: "Premium Cotton Hijab",
        description: "Soft cotton hijab in various colors",
        price: 14.99,
        category_name: "Hijabs",
        stock: 50,
        image_url: "/src/assets/images/products/hijabs/hijab-1.svg",
        featured: true
    },
    {
        name: "Silk Hijab Collection",
        description: "Luxurious silk hijabs with shine and comfort",
        price: 24.99,
        category_name: "Hijabs",
        stock: 40,
        image_url: "/src/assets/images/products/hijabs/hijab-2.svg",
        featured: true
    },
    {
        name: "Jersey Hijab",
        description: "Stretchy jersey hijab for active women",
        price: 12.99,
        category_name: "Hijabs",
        stock: 55,
        image_url: "/src/assets/images/products/hijabs/hijab-3.svg",
        featured: false
    },
    {
        name: "Printed Hijab Set",
        description: "Set of 3 printed hijabs with floral designs",
        price: 34.99,
        category_name: "Hijabs",
        stock: 30,
        image_url: "/src/assets/images/products/hijabs/hijab-4.svg",
        featured: true
    },
    {
        name: "Winter Hijab",
        description: "Warm winter hijab with fleece lining",
        price: 19.99,
        category_name: "Hijabs",
        stock: 35,
        image_url: "/src/assets/images/products/hijabs/hijab-5.svg",
        featured: false
    },

    // Jilbab
    {
        name: "Traditional Jilbab",
        description: "Classic jilbab with full coverage",
        price: 69.99,
        category_name: "Jilbab",
        stock: 25,
        image_url: "/src/assets/images/products/jilbab/jilbab-1.svg",
        featured: true
    },
    {
        name: "Modern Jilbab",
        description: "Contemporary jilbab with stylish cuts",
        price: 79.99,
        category_name: "Jilbab",
        stock: 20,
        image_url: "/src/assets/images/products/jilbab/jilbab-2.svg",
        featured: true
    },
    {
        name: "Lightweight Jilbab",
        description: "Breathable jilbab for summer wear",
        price: 59.99,
        category_name: "Jilbab",
        stock: 30,
        image_url: "/src/assets/images/products/jilbab/jilbab-3.svg",
        featured: false
    },
    {
        name: "Embroidered Jilbab",
        description: "Beautifully embroidered jilbab for special occasions",
        price: 89.99,
        category_name: "Jilbab",
        stock: 15,
        image_url: "/src/assets/images/products/jilbab/jilbab-4.svg",
        featured: true
    },
    {
        name: "Casual Jilbab",
        description: "Everyday jilbab with comfortable fit",
        price: 54.99,
        category_name: "Jilbab",
        stock: 35,
        image_url: "/src/assets/images/products/jilbab/jilbab-5.svg",
        featured: false
    },

    // Khimar
    {
        name: "Classic Khimar",
        description: "Traditional khimar with elegant drape",
        price: 49.99,
        category_name: "Khimar",
        stock: 30,
        image_url: "/src/assets/images/products/khimar/khimar-1.svg",
        featured: true
    },
    {
        name: "Layered Khimar",
        description: "Multi-layer khimar for added style",
        price: 59.99,
        category_name: "Khimar",
        stock: 25,
        image_url: "/src/assets/images/products/khimar/khimar-2.svg",
        featured: true
    },
    {
        name: "Sporty Khimar",
        description: "Active wear khimar for sports and exercise",
        price: 39.99,
        category_name: "Khimar",
        stock: 40,
        image_url: "/src/assets/images/products/khimar/khimar-3.svg",
        featured: false
    },
    {
        name: "Fancy Khimar",
        description: "Decorative khimar with embellishments",
        price: 69.99,
        category_name: "Khimar",
        stock: 20,
        image_url: "/src/assets/images/products/khimar/khimar-4.svg",
        featured: true
    },
    {
        name: "Simple Khimar",
        description: "Minimalist khimar for daily wear",
        price: 34.99,
        category_name: "Khimar",
        stock: 45,
        image_url: "/src/assets/images/products/khimar/khimar-5.svg",
        featured: false
    },

    // Nosepiece
    {
        name: "Gold Nosepiece",
        description: "Elegant gold-plated nosepiece with pearls",
        price: 29.99,
        category_name: "Nosepiece",
        stock: 25,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-1.svg",
        featured: true
    },
    {
        name: "Silver Nose Ring",
        description: "Beautiful silver nose ring with intricate design",
        price: 24.99,
        category_name: "Nosepiece",
        stock: 30,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-2.svg",
        featured: true
    },
    {
        name: "Diamond Nosepiece",
        description: "Luxury nosepiece with crystal stones",
        price: 49.99,
        category_name: "Nosepiece",
        stock: 15,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-3.svg",
        featured: true
    },
    {
        name: "Simple Nose Ring",
        description: "Minimalist nose ring for everyday wear",
        price: 19.99,
        category_name: "Nosepiece",
        stock: 40,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-4.svg",
        featured: false
    },
    {
        name: "Bridal Nosepiece",
        description: "Special bridal nosepiece for weddings",
        price: 59.99,
        category_name: "Nosepiece",
        stock: 10,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-5.svg",
        featured: true
    },

    // Alcohol Free Perfumes
    {
        name: "Oud Al Rehab",
        description: "Luxury oud perfume without alcohol",
        price: 39.99,
        category_name: "Alcohol Free Perfumes",
        stock: 35,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-1.svg",
        featured: true
    },
    {
        name: "Rose Attar",
        description: "Natural rose fragrance in oil base",
        price: 34.99,
        category_name: "Alcohol Free Perfumes",
        stock: 40,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-2.svg",
        featured: true
    },
    {
        name: "Jasmine Essence",
        description: "Pure jasmine oil perfume",
        price: 32.99,
        category_name: "Alcohol Free Perfumes",
        stock: 45,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-3.svg",
        featured: false
    },
    {
        name: "Musk Collection",
        description: "Set of 3 musk-based perfumes",
        price: 44.99,
        category_name: "Alcohol Free Perfumes",
        stock: 30,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-4.svg",
        featured: true
    },
    {
        name: "Sandalwood Oil",
        description: "Premium sandalwood attar",
        price: 37.99,
        category_name: "Alcohol Free Perfumes",
        stock: 35,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-5.svg",
        featured: false
    }
];

async function addCategoriesAndProducts() {
    try {
        console.log("Starting to add categories and products...");

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

        // Add any missing categories
        for (const categoryData of categoriesToAdd) {
            // Check if category already exists
            if (categoryMap[categoryData.name]) {
                console.log(`Category ${categoryData.name} already exists with ID: ${categoryMap[categoryData.name]}`);
                continue;
            }

            console.log(`Adding category: ${categoryData.name}`);

            // Generate slug from name
            const slug = categoryData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name: categoryData.name,
                    slug: slug,
                    description: categoryData.description,
                    image_url: categoryData.image_url,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error(`Error adding category ${categoryData.name}:`, error);
                continue;
            }

            categoryMap[categoryData.name] = data.id;
            console.log(`Category added: ${data.name} with ID: ${data.id}`);
        }

        // Add products
        let productCount = 0;
        for (const productData of productsToAdd) {
            const categoryId = categoryMap[productData.category_name];

            if (!categoryId) {
                console.error(`Could not find category for product: ${productData.name}`);
                continue;
            }

            console.log(`Adding product: ${productData.name} to category: ${productData.category_name}`);

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
                continue;
            }

            productCount++;
            console.log(`Product added: ${data.name} with ID: ${data.id}`);
        }

        console.log(`Successfully added ${Object.keys(categoryMap).length} categories and ${productCount} products!`);
    } catch (error) {
        console.error("Error adding categories and products:", error);
    }
}

// Run the function
addCategoriesAndProducts();