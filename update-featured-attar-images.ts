import { createClient } from '@supabase/supabase-js';

// List of high-quality perfume images from Unsplash
const PERFUME_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1529963159401-76ce4d1e3f69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1606692590030-054043b65e8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1597436870721-9e41d2a9b3d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1612838320371-90435a3f0e5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1597436870721-9e41d2a9b3d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1612838320371-90435a3f0e5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1529963159401-76ce4d1e3f69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1606692590030-054043b65e8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1612838320371-90435a3f0e5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80"
];

// Additional perfume images for variety
const ADDITIONAL_PERFUME_IMAGES = [
  "https://images.unsplash.com/photo-1523296357416-0aaa4319649a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1606692590030-054043b65e8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1597436870721-9e41d2a9b3d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1612838320371-90435a3f0e5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80",
  "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80"
];

async function updateFeaturedAttarImages() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL and key are required');
      return;
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all products that are likely to be attars/perfumes
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category_id', '%perfume%')
      .or('name.ilike.%attar%,name.ilike.%perfume%,name.ilike.%oud%,name.ilike.%sandalwood%,name.ilike.%rose%,name.ilike.%jasmine%');
    
    if (error) {
      console.error('Error fetching products:', error);
      // Try a broader query
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*');
      
      if (allError) {
        console.error('Error fetching all products:', allError);
        return;
      }
      
      // Filter products that are likely attars/perfumes based on name
      const perfumeProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes('attar') ||
        product.name.toLowerCase().includes('perfume') ||
        product.name.toLowerCase().includes('oud') ||
        product.name.toLowerCase().includes('sandalwood') ||
        product.name.toLowerCase().includes('rose') ||
        product.name.toLowerCase().includes('jasmine') ||
        product.name.toLowerCase().includes('musk') ||
        product.name.toLowerCase().includes('fragrance') ||
        product.category?.toLowerCase().includes('perfume') ||
        product.category?.toLowerCase().includes('attar')
      );
      
      console.log(`Found ${perfumeProducts.length} perfume/attar products to update`);
      
      // Update each perfume product with a perfume image
      for (let i = 0; i < perfumeProducts.length; i++) {
        const product = perfumeProducts[i];
        // Use a different image for each product, cycling through the arrays
        const imageUrl = i < PERFUME_IMAGE_URLS.length 
          ? PERFUME_IMAGE_URLS[i] 
          : ADDITIONAL_PERFUME_IMAGES[(i - PERFUME_IMAGE_URLS.length) % ADDITIONAL_PERFUME_IMAGES.length];
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            images: [imageUrl],
            image_url: imageUrl
          })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`Error updating product ${product.name}:`, updateError);
        } else {
          console.log(`Successfully updated ${product.name} with image ${imageUrl}`);
        }
      }
    } else {
      console.log(`Found ${products.length} perfume/attar products to update`);
      
      // Update each perfume product with a perfume image
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // Use a different image for each product, cycling through the arrays
        const imageUrl = i < PERFUME_IMAGE_URLS.length 
          ? PERFUME_IMAGE_URLS[i] 
          : ADDITIONAL_PERFUME_IMAGES[(i - PERFUME_IMAGE_URLS.length) % ADDITIONAL_PERFUME_IMAGES.length];
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            images: [imageUrl],
            image_url: imageUrl
          })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`Error updating product ${product.name}:`, updateError);
        } else {
          console.log(`Successfully updated ${product.name} with image ${imageUrl}`);
        }
      }
    }
    
    // Also update featured products specifically
    const { data: featuredProducts, error: featuredError } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true);
    
    if (!featuredError && featuredProducts.length > 0) {
      console.log(`Found ${featuredProducts.length} featured products to update`);
      
      // Update each featured product with a perfume image
      for (let i = 0; i < featuredProducts.length; i++) {
        const product = featuredProducts[i];
        // Use a different image for each product, cycling through the arrays
        const imageUrl = i < PERFUME_IMAGE_URLS.length 
          ? PERFUME_IMAGE_URLS[i] 
          : ADDITIONAL_PERFUME_IMAGES[(i - PERFUME_IMAGE_URLS.length) % ADDITIONAL_PERFUME_IMAGES.length];
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            images: [imageUrl],
            image_url: imageUrl
          })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`Error updating featured product ${product.name}:`, updateError);
        } else {
          console.log(`Successfully updated featured product ${product.name} with image ${imageUrl}`);
        }
      }
    }
    
    console.log("Product image update completed!");
  } catch (error) {
    console.error("Error updating product images:", error);
  }
}

// Run the function
updateFeaturedAttarImages();