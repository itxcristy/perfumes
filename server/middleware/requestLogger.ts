import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, query } = req;

  // Log request
  console.log(`→ ${method} ${path}`, query && Object.keys(query).length > 0 ? query : '');

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? '✗' : '✓';

    console.log(`${statusColor} ${method} ${path} [${status}] ${duration}ms`);

    return originalSend.call(this, data);
  };

  next();
}

