const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from .env
const supabaseUrl = 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

console.log('Supabase URL:', supabaseUrl);
console.log('Attempting to connect...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection error:', error.message);
      return;
    }

    console.log('Connection successful!');
    console.log('Data:', data);
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();