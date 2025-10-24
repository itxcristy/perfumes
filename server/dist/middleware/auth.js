"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.optionalAuth = optionalAuth;
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("./errorHandler");
/**
 * Authentication middleware - verifies JWT token
 */
function authenticate(req, res, next) {
    try {
        const token = (0, auth_1.extractToken)(req.headers.authorization);
        if (!token) {
            throw (0, errorHandler_1.createError)('Missing authentication token', 401, 'UNAUTHORIZED');
        }
        const decoded = (0, auth_1.verifyToken)(token);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        next((0, errorHandler_1.createError)(error.message, 401, 'UNAUTHORIZED'));
    }
}
/**
 * Authorization middleware - checks user role
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.role || !allowedRoles.includes(req.role)) {
            return next((0, errorHandler_1.createError)('Insufficient permissions', 403, 'FORBIDDEN'));
        }
        next();
    };
}
/**
 * Optional authentication - doesn't fail if token is missing
 */
function optionalAuth(req, res, next) {
    try {
        const token = (0, auth_1.extractToken)(req.headers.authorization);
        if (token) {
            const decoded = (0, auth_1.verifyToken)(token);
            req.userId = decoded.userId;
            req.role = decoded.role;
        }
    }
    catch (error) {
        // Silently ignore auth errors for optional auth
    }
    next();
}
//# sourceMappingURL=auth.js.map