import { query, initializeDatabase } from '../db/connection';
import { hashPassword } from '../utils/auth';

/**
 * Script to test authentication system
 */
async function testAuth() {
  try {
    console.log('🔧 Initializing database connection...');
    await initializeDatabase();

    // Test creating users with different roles
    const testUsers = [
      {
        email: 'customer@test.com',
        password: 'Test@123456',
        fullName: 'Test Customer',
        role: 'customer'
      },
      {
        email: 'seller@test.com',
        password: 'Test@123456',
        fullName: 'Test Seller',
        role: 'seller'
      },
      {
        email: 'admin@test.com',
        password: 'Test@123456',
        fullName: 'Test Admin',
        role: 'admin'
      }
    ];

    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id, email, role FROM public.profiles WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`✅ User already exists: ${user.email} (${user.role})`);
        continue;
      }

      // Hash password
      console.log(`🔐 Creating ${user.role}: ${user.email}`);
      const passwordHash = await hashPassword(user.password);

      // Create user
      const result = await query(
        `INSERT INTO public.profiles (email, password_hash, full_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, full_name, role, created_at`,
        [user.email, passwordHash, user.fullName, user.role, true, true]
      );

      const newUser = result.rows[0];
      console.log(`✅ Created ${newUser.role}: ${newUser.email}`);
    }

    console.log('\n✅ Authentication test completed successfully!');
    console.log('\nTest credentials:');
    testUsers.forEach(user => {
      console.log(`   ${user.role}: ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error testing authentication:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
testAuth();