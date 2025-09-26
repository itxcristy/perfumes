const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Script to verify the image fix
async function verifyImagesFix() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL and key are required.');
      return;
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Verifying product images fix...");
    
    // Check the perfume products specifically
    const perfumeProducts = [
      "Oud Al Rehab",
      "Rose Attar", 
      "Jasmine Essence",
      "Musk Collection",
      "Sandalwood Oil"
    ];
    
    for (const productName of perfumeProducts) {
      const { data: products, error } = await supabase
        .from('products')
        .select('name, images')
        .eq('name', productName)
        .limit(1);
        
      if (error) {
        console.error(`Error fetching ${productName}:`, error);
        continue;
      }
      
      if (products && products.length > 0) {
        const product = products[0];
        console.log(`${product.name}: ${product.images ? product.images.length : 0} images`);
        if (product.images) {
          product.images.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img}`);
          });
        }
      } else {
        console.log(`${productName}: Not found`);
      }
    }
    
    // Also check overall statistics
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('id, name, images');
      
    if (!allProductsError) {
      const productsWithImages = allProducts.filter(p => p.images && p.images.length > 0);
      console.log(`\nOverall: ${productsWithImages.length}/${allProducts.length} products have images`);
    }
    
    console.log("Verification completed!");
    
  } catch (error) {
    console.error("Error verifying images fix:", error);
  }
}

// Run the function
verifyImagesFix();