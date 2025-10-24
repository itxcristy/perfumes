import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    status?: number;
    code?: string;
}
/**
 * Global error handler middleware
 */
export declare function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void;
/**
 * Async error wrapper for route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Create a custom API error
 */
export declare function createError(message: string, status?: number, code?: string): ApiError;
//# sourceMappingURL=errorHandler.d.ts.map