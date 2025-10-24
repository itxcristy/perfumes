"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.createError = createError;
/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';
    console.error(`[${status}] ${code}: ${message}`);
    res.status(status).json({
        error: {
            status,
            code,
            message,
            timestamp: new Date().toISOString(),
            path: req.path,
        },
    });
}
/**
 * Async error wrapper for route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Create a custom API error
 */
function createError(message, status = 500, code = 'ERROR') {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}
//# sourceMappingURL=errorHandler.js.map