// This script counts products in each category
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countProducts() {
    try {
        console.log("Counting products in each category...");

        // Get all categories
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name');

        if (categoriesError) {
            console.error("Error fetching categories:", categoriesError);
            return;
        }

        console.log(`Found ${categories.length} categories`);

        // Count products in each category
        for (const category of categories) {
            const { count, error } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id);

            if (error) {
                console.error(`Error counting products in category ${category.name}:`, error);
                continue;
            }

            console.log(`${category.name}: ${count} products`);
        }

        // Get total product count
        const { count: totalCount, error: totalError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (!totalError) {
            console.log(`\nTotal products in database: ${totalCount}`);
        }
    } catch (error) {
        console.error("Error counting products:", error);
    }
}

// Run the function
countProducts();