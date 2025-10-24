"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const connection_1 = require("./db/connection");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const orders_1 = __importDefault(require("./routes/orders"));
// Import admin routes
const analytics_1 = __importDefault(require("./routes/admin/analytics"));
const products_2 = __importDefault(require("./routes/admin/products"));
const users_1 = __importDefault(require("./routes/admin/users"));
const orders_2 = __importDefault(require("./routes/admin/orders"));
// Get __dirname equivalent in ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Load environment variables from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/wishlist', wishlist_1.default);
app.use('/api/addresses', addresses_1.default);
app.use('/api/orders', orders_1.default);
// Admin API Routes
app.use('/api/admin/analytics', analytics_1.default);
app.use('/api/admin/products', products_2.default);
app.use('/api/admin/users', users_1.default);
app.use('/api/admin/orders', orders_2.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start server
async function startServer() {
    try {
        // Initialize database connection
        await (0, connection_1.initializeDatabase)();
        console.log('✓ Database connection initialized');
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map