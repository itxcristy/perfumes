const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from .env
const supabaseUrl = 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

console.log('Testing Supabase connection with updated configuration...');

// Create client with updated configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'X-Client-Info': 'sufi-essences-dashboard',
      'Access-Control-Allow-Origin': 'http://localhost:5174'
    }
  },
  fetch: {
    credentials: 'omit',
    timeout: 30000
  }
});

async function testConnection() {
  try {
    console.log('Testing connection to profiles table...');
    
    // Test profiles query with proper column names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .limit(5);

    if (profilesError) {
      console.error('Profiles query error:', profilesError.message);
      return;
    }

    console.log('Profiles query successful!');
    console.log('Profiles data:', profiles);

    console.log('\nTesting connection to orders table...');
    
    // Test orders query
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .limit(5);

    if (ordersError) {
      console.error('Orders query error:', ordersError.message);
      return;
    }

    console.log('Orders query successful!');
    console.log('Orders data:', orders);

    console.log('\nTesting connection to products table...');
    
    // Test products query
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(5);

    if (productsError) {
      console.error('Products query error:', productsError.message);
      return;
    }

    console.log('Products query successful!');
    console.log('Products count:', products.length);

    console.log('\nAll tests passed! The fixes should resolve the CORS and query issues.');
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();