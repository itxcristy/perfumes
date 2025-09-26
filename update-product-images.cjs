const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Simple script to update product images directly in the database
async function updateProductImages() {
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

    // Define the image mappings for perfume products
    const perfumeImageUpdates = [
      { name: "Oud Al Rehab", imageUrl: "/images/products/perfumes/attar-1.jpg" },
      { name: "Rose Attar", imageUrl: "/images/products/perfumes/attar-2.jpg" },
      { name: "Jasmine Essence", imageUrl: "/images/products/perfumes/attar-3.jpg" },
      { name: "Musk Collection", imageUrl: "/images/products/perfumes/attar-1.jpg" },
      { name: "Sandalwood Oil", imageUrl: "/images/products/perfumes/attar-2.jpg" }
    ];

    console.log("Updating product images...");

    // Update each perfume product
    for (const product of perfumeImageUpdates) {
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
        // Update the product
        const { data, error } = await supabase
          .from('products')
          .update({ images: [product.imageUrl] })
          .eq('id', existingProducts[0].id);

        if (error) {
          console.error(`Error updating ${product.name}:`, error);
        } else {
          console.log(`Successfully updated ${product.name} with image ${product.imageUrl}`);
        }
      } else {
        console.log(`Product ${product.name} not found in database`);
      }
    }

    // Also update the Alcohol Free Perfumes category image
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .update({ image_url: "/images/products/perfumes/attar-1.jpg" })
      .eq('name', 'Alcohol Free Perfumes');

    if (categoryError) {
      console.error("Error updating category image:", categoryError);
    } else {
      console.log("Successfully updated Alcohol Free Perfumes category image");
    }

    console.log("Product image update completed!");
  } catch (error) {
    console.error("Error updating product images:", error);
  }
}

// Run the function
updateProductImages();