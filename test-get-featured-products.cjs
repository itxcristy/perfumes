// This script tests the getFeaturedProducts function
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

// Create a minimal supabase client for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function that mimics the fixed getFeaturedProducts function
async function testGetFeaturedProducts(limit = 5) {
    try {
        console.log("Testing getFeaturedProducts function...");

        const { data, error } = await supabase
            .from('products')
            .select(`
        id,
        name,
        price,
        original_price,
        images,
        slug,
        description,
        rating,
        review_count,
        stock,
        categories(name, slug)
      `)
            .eq('featured', true)
            .eq('active', true)
            .limit(limit);

        if (error) throw error;

        // Transform database results to match Product interface
        const result = (data || []).map((item) => {
            const baseProduct = {
                id: item.id,
                name: item.name,
                slug: item.slug || '',
                description: item.description || '',
                price: parseFloat(item.price) || 0,
                categoryId: '',
                category: item.categories?.name || '',
                images: item.images || [], // Use the images array directly from database
                stock: item.stock || 0,
                rating: parseFloat(item.rating) || 0,
                reviewCount: item.review_count || 0,
                reviews: [],
                sellerId: '',
                sellerName: '',
                tags: [],
                featured: true,
                createdAt: new Date()
            };

            // Only add originalPrice if it exists
            if (item.original_price) {
                return {
                    ...baseProduct,
                    originalPrice: parseFloat(item.original_price)
                };
            }

            return baseProduct;
        });

        console.log("Successfully fetched featured products:", result);
        return result;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

// Run the function
testGetFeaturedProducts();