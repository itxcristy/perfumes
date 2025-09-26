const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Script to give products multiple images for better display
async function updateProductImageSets() {
    try {
        // Get Supabase credentials from environment variables
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase URL and key are required. Please set the environment variables.');
            console.log('You can find these in your .env file or Supabase dashboard.');
            return;
        }

        // Create a Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Define products with multiple images
        const productImageSets = [
            {
                name: "Oud Al Rehab",
                images: [
                    "/images/products/perfumes/attar-1.jpg",
                    "/images/products/perfumes/attar-2.jpg",
                    "/images/products/perfumes/attar-3.jpg"
                ]
            },
            {
                name: "Rose Attar",
                images: [
                    "/images/products/perfumes/attar-2.jpg",
                    "/images/products/perfumes/attar-4.jpg",
                    "/images/products/perfumes/attar-5.jpg"
                ]
            },
            {
                name: "Jasmine Essence",
                images: [
                    "/images/products/perfumes/attar-3.jpg",
                    "/images/products/perfumes/attar-1.jpg",
                    "/images/products/perfumes/attar-4.jpg"
                ]
            },
            {
                name: "Musk Collection",
                images: [
                    "/images/products/perfumes/attar-1.jpg",
                    "/images/products/perfumes/attar-5.jpg",
                    "/images/products/perfumes/attar-2.jpg"
                ]
            },
            {
                name: "Sandalwood Oil",
                images: [
                    "/images/products/perfumes/attar-2.jpg",
                    "/images/products/perfumes/attar-3.jpg",
                    "/images/products/perfumes/attar-5.jpg"
                ]
            }
        ];

        console.log("Updating product image sets...");

        // Update each product with multiple images
        for (const product of productImageSets) {
            // First, get the product to see if it exists
            const { data: existingProducts, error: fetchError } = await supabase
                .from('products')
                .select('id, name, images')
                .eq('name', product.name);

            if (fetchError) {
                console.error(`Error fetching ${product.name}:`, fetchError);
                continue;
            }

            if (existingProducts && existingProducts.length > 0) {
                // Update the product with multiple images
                const { data, error } = await supabase
                    .from('products')
                    .update({ images: product.images })
                    .eq('id', existingProducts[0].id);

                if (error) {
                    console.error(`Error updating ${product.name}:`, error);
                } else {
                    console.log(`Successfully updated ${product.name} with ${product.images.length} images`);
                }
            } else {
                console.log(`Product ${product.name} not found in database`);
            }
        }

        console.log("Product image sets update completed!");
    } catch (error) {
        console.error("Error updating product image sets:", error);
    }
}

// Run the function
updateProductImageSets();