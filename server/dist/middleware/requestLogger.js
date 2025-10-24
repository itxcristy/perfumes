"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, path, query } = req;
    // Log request
    console.log(`→ ${method} ${path}`, query && Object.keys(query).length > 0 ? query : '');
    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusColor = status >= 400 ? '✗' : '✓';
        console.log(`${statusColor} ${method} ${path} [${status}] ${duration}ms`);
        return originalSend.call(this, data);
    };
    next();
}
//# sourceMappingURL=requestLogger.js.map