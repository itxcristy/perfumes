import { autoInitializeDatabase } from './autoInitDb';

/**
 * Test script for auto-initialization
 */
async function testAutoInit() {
  try {
    console.log('🧪 Testing auto-initialization...');
    await autoInitializeDatabase();
    console.log('✅ Auto-initialization test completed successfully!');
  } catch (error: any) {
    console.error('❌ Error testing auto-initialization:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
testAutoInit();