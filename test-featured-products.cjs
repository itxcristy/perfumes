// This script tests if we can fetch featured products
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFeaturedProducts() {
    try {
        console.log("Testing featured products fetch...");

        // Try to query featured products specifically
        const { data: featured, error: featuredError } = await supabase
            .from('products')
            .select('id, name, featured')
            .eq('featured', true)
            .limit(5);

        if (featuredError) {
            console.error("Featured products query error:", featuredError);
            return;
        }

        console.log("Successfully fetched featured products:", featured);

    } catch (error) {
        console.error("Error testing featured products:", error);
    }
}

// Run the function
testFeaturedProducts();