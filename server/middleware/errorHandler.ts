import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
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
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a custom API error
 */
export function createError(
  message: string,
  status: number = 500,
  code: string = 'ERROR'
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
}

