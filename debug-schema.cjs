// This script debugs the database schema
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSchema() {
    try {
        console.log("Debugging database schema...");

        // Check if we can connect to the database
        const { data, error } = await supabase
            .from('products')
            .select('id')
            .limit(1);

        if (error) {
            console.error("Connection error:", error);
            return;
        }

        console.log("Connection successful!");

        // Try to get column information
        const { data: columns, error: columnsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (columnsError) {
            console.error("Column query error:", columnsError);
            return;
        }

        console.log("Sample product data:", columns[0]);

        // Try to query featured products specifically
        const { data: featured, error: featuredError } = await supabase
            .from('products')
            .select('id, name, is_featured')
            .eq('is_featured', true)
            .limit(5);

        if (featuredError) {
            console.error("Featured products query error:", featuredError);

            // Try with just 'featured' column name
            const { data: featured2, error: featuredError2 } = await supabase
                .from('products')
                .select('id, name, featured')
                .eq('featured', true)
                .limit(5);

            if (featuredError2) {
                console.error("Featured products query error with 'featured':", featuredError2);
            } else {
                console.log("Featured products with 'featured' column:", featured2);
            }
        } else {
            console.log("Featured products with 'is_featured' column:", featured);
        }

    } catch (error) {
        console.error("Error debugging schema:", error);
    }
}

// Run the function
debugSchema();