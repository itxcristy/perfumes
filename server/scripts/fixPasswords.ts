import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query } from '../db/connection';

async function fixPasswords() {
  try {
    console.log('🔐 Fixing user passwords...\n');

    // Hash the password 'admin123'
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(`Generated hash for password "${password}"`);
    console.log(`Hash: ${hashedPassword}\n`);

    // Update all three users with the correct hash
    const users = [
      { email: 'admin@example.com', role: 'admin' },
      { email: 'seller@example.com', role: 'seller' },
      { email: 'customer@example.com', role: 'customer' }
    ];

    for (const user of users) {
      const result = await query(
        `UPDATE public.profiles 
         SET password_hash = $1 
         WHERE email = $2 
         RETURNING email, role`,
        [hashedPassword, user.email]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated password for ${user.email} (${user.role})`);
      } else {
        console.log(`⚠️  User not found: ${user.email}`);
      }
    }

    console.log('\n✅ All passwords updated successfully!');
    console.log('\nYou can now login with:');
    console.log('- admin@example.com / admin123');
    console.log('- seller@example.com / admin123');
    console.log('- customer@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
}

fixPasswords();

