const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and key are required');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function viewProducts() {
  try {
    console.log('Fetching featured products...');
    
    // Get featured products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(10);
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} featured products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      console.log(`   Image URL: ${product.image_url}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error("Error viewing products:", error);
  }
}

// Run the function
viewProducts();