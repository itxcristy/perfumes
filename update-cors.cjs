const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from .env
const supabaseUrl = 'https://gtnpmxlnzpfqbhfzuitj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8';

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateCORS() {
  try {
    console.log('Attempting to check CORS configuration...');
    
    // First, let's test if we can access the project settings
    // Note: This is a simplified approach. In reality, you would need to use the Supabase Management API
    // which requires a service key and is not accessible through the client SDK
    
    console.log('Note: To update CORS settings, you need to do this through the Supabase Dashboard:');
    console.log('1. Go to https://app.supabase.com/project/gtnpmxlnzpfqbhfzuitj/settings/api');
    console.log('2. In the "CORS Origins" section, add: http://localhost:5174');
    console.log('3. In the "Exposed URLs" section, add: http://localhost:5174');
    
    // Test a simple query to verify connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    if (error) {
      console.error('Connection test error:', error.message);
      return;
    }

    console.log('Connection test successful!');
    console.log('Sample profiles data:', data);
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

updateCORS();