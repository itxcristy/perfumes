// This script lists all categories with their IDs and product counts
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listCategories() {
    try {
        console.log("Listing all categories with product counts...");

        // Get all categories with product counts
        const { data: categories, error } = await supabase
            .from('categories')
            .select(`
                id,
                name,
                slug,
                description,
                image_url
            `)
            .order('name');

        if (error) {
            console.error("Error fetching categories:", error);
            return;
        }

        console.log(`Found ${categories.length} categories:`);
        console.log("----------------------------------------");

        // For each category, count products
        for (const category of categories) {
            const { count, error: countError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id);

            const productCount = countError ? "Error" : count;

            console.log(`ID: ${category.id}`);
            console.log(`Name: ${category.name}`);
            console.log(`Slug: ${category.slug}`);
            console.log(`Description: ${category.description}`);
            console.log(`Image URL: ${category.image_url}`);
            console.log(`Products: ${productCount}`);
            console.log("----------------------------------------");
        }
    } catch (error) {
        console.error("Error listing categories:", error);
    }
}

// Run the function
listCategories();