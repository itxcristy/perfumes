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
    },

    // Customization - 3 more products (to make it 20 total)
    {
        name: "Customized Notebook",
        description: "Leather notebook with personalized cover",
        price: 24.99,
        category_name: "Customization",
        stock: 30,
        image_url: "/src/assets/images/products/customization/bottle-1.svg",
        featured: true
    },
    {
        name: "Personalized Phone Case",
        description: "Custom phone case with Islamic designs",
        price: 16.99,
        category_name: "Customization",
        stock: 45,
        image_url: "/src/assets/images/products/customization/mug-1.svg",
        featured: false
    },
    {
        name: "Engraved Watch",
        description: "Luxury watch with personalized engraving",
        price: 89.99,
        category_name: "Customization",
        stock: 15,
        image_url: "/src/assets/images/products/customization/pen-1.svg",
        featured: true
    },
    {
        name: "Custom Picture Frame",
        description: "Beautiful frame with personalized text",
        price: 36.99,
        category_name: "Customization",
        stock: 25,
        image_url: "/src/assets/images/products/customization/frame-a4-1.svg",
        featured: true
    },
    {
        name: "Personalized Key Holder",
        description: "Decorative key holder with custom engraving",
        price: 21.99,
        category_name: "Customization",
        stock: 35,
        image_url: "/src/assets/images/products/customization/wallet-1.svg",
        featured: false
    },
    {
        name: "Customized T-Shirt",
        description: "Cotton t-shirt with personalized design",
        price: 26.99,
        category_name: "Customization",
        stock: 40,
        image_url: "/src/assets/images/products/customization/keychain-1.svg",
        featured: true
    },
    {
        name: "Engraved Cufflinks",
        description: "Elegant cufflinks with personalized engraving",
        price: 45.99,
        category_name: "Customization",
        stock: 20,
        image_url: "/src/assets/images/products/customization/rehal-1.svg",
        featured: true
    },
    {
        name: "Custom Leather Journal",
        description: "Premium leather journal with custom cover",
        price: 38.99,
        category_name: "Customization",
        stock: 25,
        image_url: "/src/assets/images/products/customization/bookmark-1.svg",
        featured: false
    },
    {
        name: "Personalized Laptop Sleeve",
        description: "Custom laptop sleeve with Islamic artwork",
        price: 31.99,
        category_name: "Customization",
        stock: 30,
        image_url: "/src/assets/images/products/customization/frame-mini-1.svg",
        featured: true
    },
    {
        name: "Customized Water Bottle",
        description: "Stainless steel water bottle with personal engraving",
        price: 23.99,
        category_name: "Customization",
        stock: 35,
        image_url: "/src/assets/images/products/customization/frame-wedding-1.svg",
        featured: false
    },
    {
        name: "Engraved Islamic Calendar",
        description: "Wall calendar with personalized Islamic quotes",
        price: 19.99,
        category_name: "Customization",
        stock: 40,
        image_url: "/src/assets/images/products/customization/pen-stand-1.svg",
        featured: true
    },
    {
        name: "Custom Prayer Mat",
        description: "Personalized prayer mat with name embroidery",
        price: 42.99,
        category_name: "Customization",
        stock: 22,
        image_url: "/src/assets/images/products/customization/bottle-1.svg",
        featured: true
    },
    {
        name: "Personalized Quran Stand",
        description: "Wooden Quran stand with custom engraving",
        price: 29.99,
        category_name: "Customization",
        stock: 28,
        image_url: "/src/assets/images/products/customization/mug-1.svg",
        featured: false
    },
    {
        name: "Custom Islamic Greeting Cards",
        description: "Set of 10 personalized Islamic greeting cards",
        price: 15.99,
        category_name: "Customization",
        stock: 50,
        image_url: "/src/assets/images/products/customization/pen-1.svg",
        featured: false
    },
    {
        name: "Engraved Islamic Wall Art",
        description: "Decorative wall art with personalized Quranic verses",
        price: 54.99,
        category_name: "Customization",
        stock: 18,
        image_url: "/src/assets/images/products/customization/wallet-1.svg",
        featured: true
    },

    // Abaya - 15 more products
    {
        name: "Luxury Beige Abaya",
        description: "Premium beige abaya with gold embroidery",
        price: 139.99,
        category_name: "Abaya",
        stock: 10,
        image_url: "/src/assets/images/products/abaya/abaya-1.svg",
        featured: true
    },
    {
        name: "Floral Print Abaya",
        description: "Beautiful abaya with floral print design",
        price: 99.99,
        category_name: "Abaya",
        stock: 20,
        image_url: "/src/assets/images/products/abaya/abaya-2.svg",
        featured: true
    },
    {
        name: "Slim Fit Abaya",
        description: "Modern slim fit abaya for contemporary style",
        price: 84.99,
        category_name: "Abaya",
        stock: 22,
        image_url: "/src/assets/images/products/abaya/abaya-3.svg",
        featured: false
    },
    {
        name: "Open Front Abaya",
        description: "Stylish open front abaya with belt",
        price: 95.99,
        category_name: "Abaya",
        stock: 18,
        image_url: "/src/assets/images/products/abaya/abaya-4.svg",
        featured: true
    },
    {
        name: "Kaftan Style Abaya",
        description: "Traditional kaftan style abaya with elegance",
        price: 104.99,
        category_name: "Abaya",
        stock: 15,
        image_url: "/src/assets/images/products/abaya/abaya-5.svg",
        featured: false
    },
    {
        name: "Nida Fabric Abaya",
        description: "Premium Nida fabric abaya for comfort",
        price: 119.99,
        category_name: "Abaya",
        stock: 16,
        image_url: "/src/assets/images/products/abaya/abaya-1.svg",
        featured: true
    },
    {
        name: "Lace Trim Abaya",
        description: "Elegant abaya with delicate lace trimmings",
        price: 109.99,
        category_name: "Abaya",
        stock: 17,
        image_url: "/src/assets/images/products/abaya/abaya-2.svg",
        featured: true
    },
    {
        name: "Color Block Abaya",
        description: "Modern color block design abaya",
        price: 92.99,
        category_name: "Abaya",
        stock: 21,
        image_url: "/src/assets/images/products/abaya/abaya-3.svg",
        featured: false
    },
    {
        name: "Embroidered Sleeves Abaya",
        description: "Abaya with beautifully embroidered sleeves",
        price: 114.99,
        category_name: "Abaya",
        stock: 14,
        image_url: "/src/assets/images/products/abaya/abaya-4.svg",
        featured: true
    },
    {
        name: "Two Piece Abaya Set",
        description: "Complete abaya set with matching accessories",
        price: 149.99,
        category_name: "Abaya",
        stock: 12,
        image_url: "/src/assets/images/products/abaya/abaya-5.svg",
        featured: true
    },
    {
        name: "Velvet Abaya",
        description: "Luxurious velvet abaya for special occasions",
        price: 134.99,
        category_name: "Abaya",
        stock: 13,
        image_url: "/src/assets/images/products/abaya/abaya-1.svg",
        featured: true
    },
    {
        name: "Button Front Abaya",
        description: "Classic button front abaya design",
        price: 87.99,
        category_name: "Abaya",
        stock: 23,
        image_url: "/src/assets/images/products/abaya/abaya-2.svg",
        featured: false
    },
    {
        name: "Layered Abaya",
        description: "Stylish layered abaya with modern appeal",
        price: 102.99,
        category_name: "Abaya",
        stock: 19,
        image_url: "/src/assets/images/products/abaya/abaya-3.svg",
        featured: true
    },
    {
        name: "Printed Hijab Abaya",
        description: "Abaya with matching printed hijab",
        price: 107.99,
        category_name: "Abaya",
        stock: 16,
        image_url: "/src/assets/images/products/abaya/abaya-4.svg",
        featured: false
    },
    {
        name: "Winter Abaya",
        description: "Warm winter abaya with lining",
        price: 124.99,
        category_name: "Abaya",
        stock: 14,
        image_url: "/src/assets/images/products/abaya/abaya-5.svg",
        featured: true
    },

    // Hijabs - 15 more products
    {
        name: "Chiffon Hijab",
        description: "Lightweight chiffon hijab for daily wear",
        price: 16.99,
        category_name: "Hijabs",
        stock: 45,
        image_url: "/src/assets/images/products/hijabs/hijab-1.svg",
        featured: true
    },
    {
        name: "Modal Hijab",
        description: "Soft modal fabric hijab with breathability",
        price: 18.99,
        category_name: "Hijabs",
        stock: 40,
        image_url: "/src/assets/images/products/hijabs/hijab-2.svg",
        featured: false
    },
    {
        name: "Georgette Hijab",
        description: "Elegant georgette hijab with flowy texture",
        price: 21.99,
        category_name: "Hijabs",
        stock: 35,
        image_url: "/src/assets/images/products/hijabs/hijab-3.svg",
        featured: true
    },
    {
        name: "Viscose Hijab",
        description: "Smooth viscose hijab with natural feel",
        price: 17.99,
        category_name: "Hijabs",
        stock: 42,
        image_url: "/src/assets/images/products/hijabs/hijab-4.svg",
        featured: false
    },
    {
        name: "Lace Trim Hijab",
        description: "Hijab with delicate lace trim details",
        price: 22.99,
        category_name: "Hijabs",
        stock: 30,
        image_url: "/src/assets/images/products/hijabs/hijab-5.svg",
        featured: true
    },
    {
        name: "Patterned Hijab Bundle",
        description: "Set of 5 patterned hijabs in different designs",
        price: 39.99,
        category_name: "Hijabs",
        stock: 25,
        image_url: "/src/assets/images/products/hijabs/hijab-1.svg",
        featured: true
    },
    {
        name: "Maternity Hijab",
        description: "Comfortable hijab designed for expecting mothers",
        price: 20.99,
        category_name: "Hijabs",
        stock: 35,
        image_url: "/src/assets/images/products/hijabs/hijab-2.svg",
        featured: false
    },
    {
        name: "Sport Hijab",
        description: "Athletic hijab for active lifestyle",
        price: 23.99,
        category_name: "Hijabs",
        stock: 30,
        image_url: "/src/assets/images/products/hijabs/hijab-3.svg",
        featured: true
    },
    {
        name: "Velvet Hijab",
        description: "Luxurious velvet hijab for special occasions",
        price: 26.99,
        category_name: "Hijabs",
        stock: 25,
        image_url: "/src/assets/images/products/hijabs/hijab-4.svg",
        featured: true
    },
    {
        name: "Organza Hijab",
        description: "Sheer organza hijab with elegant shimmer",
        price: 25.99,
        category_name: "Hijabs",
        stock: 28,
        image_url: "/src/assets/images/products/hijabs/hijab-5.svg",
        featured: false
    },
    {
        name: "Two-Tone Hijab",
        description: "Stylish two-tone color combination hijab",
        price: 19.99,
        category_name: "Hijabs",
        stock: 38,
        image_url: "/src/assets/images/products/hijabs/hijab-1.svg",
        featured: true
    },
    {
        name: "Crinkle Hijab",
        description: "Textured crinkle hijab with unique look",
        price: 15.99,
        category_name: "Hijabs",
        stock: 45,
        image_url: "/src/assets/images/products/hijabs/hijab-2.svg",
        featured: false
    },
    {
        name: "Embroidered Hijab",
        description: "Beautifully embroidered hijab with details",
        price: 28.99,
        category_name: "Hijabs",
        stock: 22,
        image_url: "/src/assets/images/products/hijabs/hijab-3.svg",
        featured: true
    },
    {
        name: "Infinity Hijab",
        description: "Versatile infinity style hijab for easy wrapping",
        price: 22.99,
        category_name: "Hijabs",
        stock: 33,
        image_url: "/src/assets/images/products/hijabs/hijab-4.svg",
        featured: false
    },
    {
        name: "Premium Hijab Set",
        description: "Luxury set of 7 premium quality hijabs",
        price: 49.99,
        category_name: "Hijabs",
        stock: 20,
        image_url: "/src/assets/images/products/hijabs/hijab-5.svg",
        featured: true
    },

    // Jilbab - 15 more products
    {
        name: "Maxi Jilbab",
        description: "Floor length jilbab with elegant design",
        price: 74.99,
        category_name: "Jilbab",
        stock: 22,
        image_url: "/src/assets/images/products/jilbab/jilbab-1.svg",
        featured: true
    },
    {
        name: "Short Jilbab",
        description: "Knee-length jilbab for casual outings",
        price: 49.99,
        category_name: "Jilbab",
        stock: 28,
        image_url: "/src/assets/images/products/jilbab/jilbab-2.svg",
        featured: false
    },
    {
        name: "Layered Jilbab",
        description: "Stylish layered design jilbab",
        price: 84.99,
        category_name: "Jilbab",
        stock: 18,
        image_url: "/src/assets/images/products/jilbab/jilbab-3.svg",
        featured: true
    },
    {
        name: "Printed Jilbab",
        description: "Beautiful printed design jilbab",
        price: 64.99,
        category_name: "Jilbab",
        stock: 25,
        image_url: "/src/assets/images/products/jilbab/jilbab-4.svg",
        featured: false
    },
    {
        name: "Velvet Jilbab",
        description: "Luxurious velvet fabric jilbab",
        price: 94.99,
        category_name: "Jilbab",
        stock: 12,
        image_url: "/src/assets/images/products/jilbab/jilbab-5.svg",
        featured: true
    },
    {
        name: "Button Front Jilbab",
        description: "Classic button front jilbab style",
        price: 62.99,
        category_name: "Jilbab",
        stock: 27,
        image_url: "/src/assets/images/products/jilbab/jilbab-1.svg",
        featured: false
    },
    {
        name: "Open Front Jilbab",
        description: "Modern open front jilbab design",
        price: 72.99,
        category_name: "Jilbab",
        stock: 23,
        image_url: "/src/assets/images/products/jilbab/jilbab-2.svg",
        featured: true
    },
    {
        name: "Color Block Jilbab",
        description: "Trendy color block jilbab design",
        price: 67.99,
        category_name: "Jilbab",
        stock: 24,
        image_url: "/src/assets/images/products/jilbab/jilbab-3.svg",
        featured: true
    },
    {
        name: "Lace Trim Jilbab",
        description: "Elegant lace trim detail jilbab",
        price: 77.99,
        category_name: "Jilbab",
        stock: 20,
        image_url: "/src/assets/images/products/jilbab/jilbab-4.svg",
        featured: false
    },
    {
        name: "Two-Piece Jilbab Set",
        description: "Complete jilbab set with accessories",
        price: 99.99,
        category_name: "Jilbab",
        stock: 15,
        image_url: "/src/assets/images/products/jilbab/jilbab-5.svg",
        featured: true
    },
    {
        name: "Summer Jilbab",
        description: "Lightweight jilbab for hot weather",
        price: 57.99,
        category_name: "Jilbab",
        stock: 32,
        image_url: "/src/assets/images/products/jilbab/jilbab-1.svg",
        featured: false
    },
    {
        name: "Winter Jilbab",
        description: "Warm lined jilbab for cold weather",
        price: 82.99,
        category_name: "Jilbab",
        stock: 18,
        image_url: "/src/assets/images/products/jilbab/jilbab-2.svg",
        featured: true
    },
    {
        name: "Designer Jilbab",
        description: "High-fashion designer jilbab collection",
        price: 109.99,
        category_name: "Jilbab",
        stock: 10,
        image_url: "/src/assets/images/products/jilbab/jilbab-3.svg",
        featured: true
    },
    {
        name: "Simple Jilbab",
        description: "Minimalist design jilbab for daily wear",
        price: 52.99,
        category_name: "Jilbab",
        stock: 35,
        image_url: "/src/assets/images/products/jilbab/jilbab-4.svg",
        featured: false
    },
    {
        name: "Premium Jilbab",
        description: "Top quality premium fabric jilbab",
        price: 87.99,
        category_name: "Jilbab",
        stock: 17,
        image_url: "/src/assets/images/products/jilbab/jilbab-5.svg",
        featured: true
    },

    // Khimar - 15 more products
    {
        name: "Long Khimar",
        description: "Extra long khimar for full coverage",
        price: 54.99,
        category_name: "Khimar",
        stock: 28,
        image_url: "/src/assets/images/products/khimar/khimar-1.svg",
        featured: true
    },
    {
        name: "Short Khimar",
        description: "Convenient short length khimar",
        price: 44.99,
        category_name: "Khimar",
        stock: 35,
        image_url: "/src/assets/images/products/khimar/khimar-2.svg",
        featured: false
    },
    {
        name: "Printed Khimar",
        description: "Beautiful printed design khimar",
        price: 47.99,
        category_name: "Khimar",
        stock: 32,
        image_url: "/src/assets/images/products/khimar/khimar-3.svg",
        featured: true
    },
    {
        name: "Velvet Khimar",
        description: "Luxurious velvet fabric khimar",
        price: 64.99,
        category_name: "Khimar",
        stock: 22,
        image_url: "/src/assets/images/products/khimar/khimar-4.svg",
        featured: true
    },
    {
        name: "Chiffon Khimar",
        description: "Lightweight chiffon khimar",
        price: 42.99,
        category_name: "Khimar",
        stock: 38,
        image_url: "/src/assets/images/products/khimar/khimar-5.svg",
        featured: false
    },
    {
        name: "Embroidered Khimar",
        description: "Elegantly embroidered khimar",
        price: 62.99,
        category_name: "Khimar",
        stock: 24,
        image_url: "/src/assets/images/products/khimar/khimar-1.svg",
        featured: true
    },
    {
        name: "Two-Tone Khimar",
        description: "Stylish two-tone color khimar",
        price: 46.99,
        category_name: "Khimar",
        stock: 33,
        image_url: "/src/assets/images/products/khimar/khimar-2.svg",
        featured: false
    },
    {
        name: "Lace Trim Khimar",
        description: "Delicate lace trim detail khimar",
        price: 57.99,
        category_name: "Khimar",
        stock: 26,
        image_url: "/src/assets/images/products/khimar/khimar-3.svg",
        featured: true
    },
    {
        name: "Crinkle Khimar",
        description: "Textured crinkle fabric khimar",
        price: 37.99,
        category_name: "Khimar",
        stock: 42,
        image_url: "/src/assets/images/products/khimar/khimar-4.svg",
        featured: false
    },
    {
        name: "Premium Khimar Set",
        description: "Set of 3 premium quality khimars",
        price: 79.99,
        category_name: "Khimar",
        stock: 18,
        image_url: "/src/assets/images/products/khimar/khimar-5.svg",
        featured: true
    },
    {
        name: "Maternity Khimar",
        description: "Comfortable khimar for expecting mothers",
        price: 41.99,
        category_name: "Khimar",
        stock: 36,
        image_url: "/src/assets/images/products/khimar/khimar-1.svg",
        featured: false
    },
    {
        name: "Winter Khimar",
        description: "Warm lined khimar for cold weather",
        price: 52.99,
        category_name: "Khimar",
        stock: 29,
        image_url: "/src/assets/images/products/khimar/khimar-2.svg",
        featured: true
    },
    {
        name: "Summer Khimar",
        description: "Lightweight khimar for hot weather",
        price: 36.99,
        category_name: "Khimar",
        stock: 44,
        image_url: "/src/assets/images/products/khimar/khimar-3.svg",
        featured: false
    },
    {
        name: "Designer Khimar",
        description: "High-fashion designer khimar collection",
        price: 74.99,
        category_name: "Khimar",
        stock: 15,
        image_url: "/src/assets/images/products/khimar/khimar-4.svg",
        featured: true
    },
    {
        name: "Simple Daily Khimar",
        description: "Easy-to-wear daily khimar",
        price: 32.99,
        category_name: "Khimar",
        stock: 50,
        image_url: "/src/assets/images/products/khimar/khimar-5.svg",
        featured: false
    },

    // Nosepiece - 15 more products
    {
        name: "Rose Gold Nosepiece",
        description: "Trendy rose gold nosepiece with gemstones",
        price: 34.99,
        category_name: "Nosepiece",
        stock: 22,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-1.svg",
        featured: true
    },
    {
        name: "Pearl Nose Ring",
        description: "Classic pearl nose ring with silver finish",
        price: 27.99,
        category_name: "Nosepiece",
        stock: 28,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-2.svg",
        featured: false
    },
    {
        name: "Floral Nosepiece",
        description: "Beautiful floral design nosepiece",
        price: 32.99,
        category_name: "Nosepiece",
        stock: 24,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-3.svg",
        featured: true
    },
    {
        name: "Geometric Nose Ring",
        description: "Modern geometric design nose ring",
        price: 22.99,
        category_name: "Nosepiece",
        stock: 35,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-4.svg",
        featured: false
    },
    {
        name: "Luxury Crystal Nosepiece",
        description: "Premium crystal nosepiece for special occasions",
        price: 44.99,
        category_name: "Nosepiece",
        stock: 18,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-5.svg",
        featured: true
    },
    {
        name: "Minimalist Nose Ring",
        description: "Simple and elegant minimalist nose ring",
        price: 17.99,
        category_name: "Nosepiece",
        stock: 42,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-1.svg",
        featured: false
    },
    {
        name: "Bohemian Nosepiece",
        description: "Boho style nosepiece with ethnic design",
        price: 26.99,
        category_name: "Nosepiece",
        stock: 30,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-2.svg",
        featured: true
    },
    {
        name: "Heart Shape Nose Ring",
        description: "Romantic heart shape design nose ring",
        price: 23.99,
        category_name: "Nosepiece",
        stock: 33,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-3.svg",
        featured: false
    },
    {
        name: "Crescent Moon Nosepiece",
        description: "Islamic inspired crescent moon design",
        price: 31.99,
        category_name: "Nosepiece",
        stock: 26,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-4.svg",
        featured: true
    },
    {
        name: "Star Design Nose Ring",
        description: "Beautiful star pattern nose ring",
        price: 25.99,
        category_name: "Nosepiece",
        stock: 32,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-5.svg",
        featured: false
    },
    {
        name: "Vintage Nosepiece",
        description: "Classic vintage style nosepiece",
        price: 36.99,
        category_name: "Nosepiece",
        stock: 20,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-1.svg",
        featured: true
    },
    {
        name: "Contemporary Nose Ring",
        description: "Modern contemporary design nose ring",
        price: 28.99,
        category_name: "Nosepiece",
        stock: 29,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-2.svg",
        featured: false
    },
    {
        name: "Islamic Pattern Nosepiece",
        description: "Nosepiece with traditional Islamic patterns",
        price: 33.99,
        category_name: "Nosepiece",
        stock: 25,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-3.svg",
        featured: true
    },
    {
        name: "Delicate Nose Ring",
        description: "Delicately designed thin nose ring",
        price: 20.99,
        category_name: "Nosepiece",
        stock: 38,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-4.svg",
        featured: false
    },
    {
        name: "Statement Nosepiece",
        description: "Bold statement nosepiece for fashion lovers",
        price: 39.99,
        category_name: "Nosepiece",
        stock: 17,
        image_url: "/src/assets/images/products/nosepiece/nosepiece-5.svg",
        featured: true
    },

    // Alcohol Free Perfumes - 15 more products
    {
        name: "Attar Al Misk",
        description: "Luxurious musk-based perfume oil",
        price: 42.99,
        category_name: "Alcohol Free Perfumes",
        stock: 28,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-1.svg",
        featured: true
    },
    {
        name: "Amber Oil Perfume",
        description: "Warm amber fragrance in oil base",
        price: 36.99,
        category_name: "Alcohol Free Perfumes",
        stock: 32,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-2.svg",
        featured: false
    },
    {
        name: "Vanilla Essence",
        description: "Sweet vanilla oil-based perfume",
        price: 31.99,
        category_name: "Alcohol Free Perfumes",
        stock: 38,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-3.svg",
        featured: true
    },
    {
        name: "Lavender Attar",
        description: "Calming lavender oil perfume",
        price: 33.99,
        category_name: "Alcohol Free Perfumes",
        stock: 36,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-4.svg",
        featured: false
    },
    {
        name: "Patchouli Oil",
        description: "Earthy patchouli essential oil perfume",
        price: 38.99,
        category_name: "Alcohol Free Perfumes",
        stock: 30,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-5.svg",
        featured: true
    },
    {
        name: "White Musk Perfume",
        description: "Clean and fresh white musk oil fragrance",
        price: 35.99,
        category_name: "Alcohol Free Perfumes",
        stock: 33,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-1.svg",
        featured: false
    },
    {
        name: "Ylang Ylang Attar",
        description: "Exotic ylang ylang floral oil perfume",
        price: 39.99,
        category_name: "Alcohol Free Perfumes",
        stock: 29,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-2.svg",
        featured: true
    },
    {
        name: "Orange Blossom Oil",
        description: "Citrusy orange blossom oil-based perfume",
        price: 30.99,
        category_name: "Alcohol Free Perfumes",
        stock: 42,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-3.svg",
        featured: false
    },
    {
        name: "Neroli Perfume",
        description: "Delicate neroli flower oil fragrance",
        price: 41.99,
        category_name: "Alcohol Free Perfumes",
        stock: 27,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-4.svg",
        featured: true
    },
    {
        name: "Frankincense Oil",
        description: "Sacred frankincense resin oil perfume",
        price: 43.99,
        category_name: "Alcohol Free Perfumes",
        stock: 25,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-5.svg",
        featured: true
    },
    {
        name: "Tuberose Attar",
        description: "Intense tuberose floral oil perfume",
        price: 45.99,
        category_name: "Alcohol Free Perfumes",
        stock: 22,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-1.svg",
        featured: true
    },
    {
        name: "Coconut Oil Perfume",
        description: "Tropical coconut oil-based fragrance",
        price: 29.99,
        category_name: "Alcohol Free Perfumes",
        stock: 45,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-2.svg",
        featured: false
    },
    {
        name: "Peppermint Oil",
        description: "Refreshing peppermint essential oil perfume",
        price: 28.99,
        category_name: "Alcohol Free Perfumes",
        stock: 48,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-3.svg",
        featured: false
    },
    {
        name: "Cinnamon Attar",
        description: "Warm spicy cinnamon oil-based perfume",
        price: 34.99,
        category_name: "Alcohol Free Perfumes",
        stock: 34,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-4.svg",
        featured: true
    },
    {
        name: "Premium Perfume Set",
        description: "Collection of 5 premium alcohol-free perfumes",
        price: 69.99,
        category_name: "Alcohol Free Perfumes",
        stock: 15,
        image_url: "/src/assets/images/products/alcohol-free-perfumes/perfume-5.svg",
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

            // Check if product already exists to avoid duplicates
            const { data: existingProduct, error: checkError } = await supabase
                .from('products')
                .select('id')
                .eq('name', productData.name)
                .eq('category_id', categoryId)
                .single();

            if (existingProduct) {
                console.log(`Product ${productData.name} already exists, skipping...`);
                continue;
            }

            const { data, error } = await supabase
                .from('products')
                .insert({
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    category_id: categoryId,
                    stock: productData.stock,
                    images: [productData.image_url], // Using images array as per schema
                    is_featured: productData.featured, // Using correct field name
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

        console.log(`Successfully added ${productCount} additional products!`);
    } catch (error) {
        console.error("Error adding additional products:", error);
    }
}

// Run the function
addAdditionalProducts();