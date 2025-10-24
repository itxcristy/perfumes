"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.extractToken = extractToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
/**
 * Hash a password
 */
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
}
/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
/**
 * Generate JWT token
 */
function generateToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
/**
 * Extract token from Authorization header
 */
function extractToken(authHeader) {
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return null;
    return parts[1];
}
//# sourceMappingURL=auth.js.map