"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSchema = initializeSchema;
exports.seedDatabase = seedDatabase;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const connection_1 = require("./connection");
// Get __dirname equivalent in ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
/**
 * Initialize database schema
 */
async function initializeSchema() {
    try {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf-8');
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        console.log(`Executing ${statements.length} schema statements...`);
        for (const statement of statements) {
            try {
                await (0, connection_1.query)(statement);
            }
            catch (error) {
                // Ignore "already exists" errors
                if (!error.message.includes('already exists')) {
                    console.error('Schema error:', error.message);
                    throw error;
                }
            }
        }
        console.log('✓ Database schema initialized successfully');
    }
    catch (error) {
        console.error('✗ Failed to initialize schema:', error);
        throw error;
    }
}
/**
 * Seed database with sample data (optional)
 */
async function seedDatabase() {
    try {
        // Check if data already exists
        const result = await (0, connection_1.query)('SELECT COUNT(*) FROM public.profiles');
        if (result.rows[0].count > 0) {
            console.log('Database already contains data, skipping seed');
            return;
        }
        console.log('Seeding database with sample data...');
        // Add sample categories
        await (0, connection_1.query)(`
      INSERT INTO public.categories (name, slug, description, sort_order, is_active)
      VALUES 
        ('Perfumes', 'perfumes', 'Premium perfumes collection', 1, true),
        ('Colognes', 'colognes', 'Fresh colognes', 2, true),
        ('Fragrances', 'fragrances', 'Luxury fragrances', 3, true)
    `);
        console.log('✓ Database seeded successfully');
    }
    catch (error) {
        console.error('✗ Failed to seed database:', error);
        throw error;
    }
}
//# sourceMappingURL=init.js.map