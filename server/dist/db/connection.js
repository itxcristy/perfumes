"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initializeDatabase = initializeDatabase;
exports.query = query;
exports.getClient = getClient;
exports.closePool = closePool;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// Get __dirname equivalent in ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Load environment variables from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Validate required environment variables
const requiredEnvVars = ['DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please update your .env file with the correct database credentials.');
    console.error('Example: DB_PASSWORD=your_actual_postgres_password');
}
// Create connection pool
const pool = new pg_1.Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sufi_essences',
    max: parseInt(process.env.DB_POOL_SIZE || '20'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool = pool;
// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});
/**
 * Initialize database connection and verify connectivity
 */
async function initializeDatabase() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection successful:', result.rows[0]);
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}
/**
 * Execute a query with connection pooling
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`Query executed in ${duration}ms:`, text.substring(0, 50));
        return result;
    }
    catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}
/**
 * Get a client from the pool for transactions
 */
async function getClient() {
    return pool.connect();
}
/**
 * Close the connection pool
 */
async function closePool() {
    await pool.end();
}
//# sourceMappingURL=connection.js.map