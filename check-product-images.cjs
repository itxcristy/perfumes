const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Script to check product images
async function checkProductImages() {
    try {
        // Get Supabase credentials from environment variables
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        console.log("Supabase URL:", supabaseUrl);
        console.log("Supabase Key exists:", !!supabaseKey);

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase URL and key are required. Please set the environment variables.');
            console.log('You can find these in your .env file or Supabase dashboard.');
            return;
        }

        // Create a Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Checking product images...");

        // Get a few products to see their images
        const { data: products, error } = await supabase
            .from('products')
            .select('name, images')
            .in('name', ['Oud Al Rehab', 'Rose Attar', 'Jasmine Essence'])
            .limit(3);

        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        console.log("Found products:", products.length);
        console.log("Product images:");
        products.forEach(product => {
            console.log(`- ${product.name}: ${product.images ? product.images.length : 0} images`);
            if (product.images) {
                product.images.forEach((img, index) => {
                    console.log(`  ${index + 1}. ${img}`);
                });
            }
        });

    } catch (error) {
        console.error("Error checking product images:", error);
    }
}

// Run the function
checkProductImages();