"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const connection_1 = require("../db/connection");
const init_1 = require("../db/init");
// Get __dirname equivalent in ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Load .env from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function main() {
    try {
        console.log('🚀 Starting database initialization...\n');
        // Step 1: Initialize connection
        console.log('1️⃣  Initializing database connection...');
        await (0, connection_1.initializeDatabase)();
        console.log('✓ Database connection successful\n');
        // Step 2: Initialize schema
        console.log('2️⃣  Creating database schema...');
        await (0, init_1.initializeSchema)();
        console.log('✓ Schema created successfully\n');
        // Step 3: Seed database (optional)
        console.log('3️⃣  Seeding database with sample data...');
        await (0, init_1.seedDatabase)();
        console.log('✓ Database seeded successfully\n');
        console.log('✅ Database initialization complete!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=initDb.js.map