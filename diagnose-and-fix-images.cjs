const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Script to diagnose and fix product images
async function diagnoseAndFixImages() {
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
    
    console.log("Diagnosing product images...");
    
    // First, let's check if we can connect to the database at all
    try {
      const { data: test, error: testError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        return;
      }
      console.log("Database connection successful");
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      return;
    }
    
    // Get all products to see their current state
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('id, name, images')
      .order('name');
      
    if (allProductsError) {
      console.error('Error fetching all products:', allProductsError);
      return;
    }
    
    console.log(`Found ${allProducts.length} products in database`);
    
    // Count products with and without images
    const productsWithImages = allProducts.filter(p => p.images && p.images.length > 0);
    const productsWithoutImages = allProducts.filter(p => !p.images || p.images.length === 0);
    
    console.log(`Products with images: ${productsWithImages.length}`);
    console.log(`Products without images: ${productsWithoutImages.length}`);
    
    // Show some examples
    console.log("\nSample products with images:");
    productsWithImages.slice(0, 3).forEach(product => {
      console.log(`- ${product.name}: ${product.images.length} images`);
    });
    
    console.log("\nSample products without images:");
    productsWithoutImages.slice(0, 3).forEach(product => {
      console.log(`- ${product.name}: 0 images`);
    });
    
    // If there are products without images, let's fix them
    if (productsWithoutImages.length > 0) {
      console.log("\nFixing products without images...");
      
      // Define image mappings for perfume products
      const perfumeImageMappings = {
        "Oud Al Rehab": ["/images/products/perfumes/attar-1.jpg", "/images/products/perfumes/attar-2.jpg", "/images/products/perfumes/attar-3.jpg"],
        "Rose Attar": ["/images/products/perfumes/attar-2.jpg", "/images/products/perfumes/attar-4.jpg", "/images/products/perfumes/attar-5.jpg"],
        "Jasmine Essence": ["/images/products/perfumes/attar-3.jpg", "/images/products/perfumes/attar-1.jpg", "/images/products/perfumes/attar-4.jpg"],
        "Musk Collection": ["/images/products/perfumes/attar-1.jpg", "/images/products/perfumes/attar-5.jpg", "/images/products/perfumes/attar-2.jpg"],
        "Sandalwood Oil": ["/images/products/perfumes/attar-2.jpg", "/images/products/perfumes/attar-3.jpg", "/images/products/perfumes/attar-5.jpg"]
      };
      
      // Fix each product without images
      for (const product of productsWithoutImages) {
        // Check if this is a perfume product we have mappings for
        if (perfumeImageMappings[product.name]) {
          const { data, error } = await supabase
            .from('products')
            .update({ images: perfumeImageMappings[product.name] })
            .eq('id', product.id);
            
          if (error) {
            console.error(`Error updating ${product.name}:`, error);
          } else {
            console.log(`Successfully updated ${product.name} with ${perfumeImageMappings[product.name].length} images`);
          }
        } else {
          // For other products, use a default image
          const { data, error } = await supabase
            .from('products')
            .update({ images: ["/images/products/perfumes/attar-1.jpg"] })
            .eq('id', product.id);
            
          if (error) {
            console.error(`Error updating ${product.name}:`, error);
          } else {
            console.log(`Successfully updated ${product.name} with default image`);
          }
        }
      }
      
      console.log("Image fix completed!");
    } else {
      console.log("All products already have images!");
    }
    
    // Also check and fix the Alcohol Free Perfumes category image
    console.log("\nChecking category images...");
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, image_url')
      .eq('name', 'Alcohol Free Perfumes');
      
    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
    } else if (categories && categories.length > 0) {
      const category = categories[0];
      if (!category.image_url || category.image_url === '') {
        const { data, error } = await supabase
          .from('categories')
          .update({ image_url: "/images/products/perfumes/attar-1.jpg" })
          .eq('id', category.id);
          
        if (error) {
          console.error("Error updating category image:", error);
        } else {
          console.log("Successfully updated Alcohol Free Perfumes category image");
        }
      } else {
        console.log("Alcohol Free Perfumes category already has an image");
      }
    }
    
  } catch (error) {
    console.error("Error in diagnose and fix:", error);
  }
}

// Run the function
diagnoseAndFixImages();