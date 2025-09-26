const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfilesSchema() {
  try {
    console.log('Checking profiles table schema...');
    
    // Get a sample record to see what columns exist
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching profiles:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columns in profiles table:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data found in profiles table');
    }
    
    // Also check orders table
    console.log('\nChecking orders table schema...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError.message);
      return;
    }

    if (ordersData && ordersData.length > 0) {
      console.log('Columns in orders table:');
      console.log(Object.keys(ordersData[0]));
    } else {
      console.log('No data found in orders table');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkProfilesSchema();