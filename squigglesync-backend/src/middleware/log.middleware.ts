import { Request, Response, NextFunction } from 'express';

/**
 * Logging middleware - logs request info
 * Logs the timestamp, HTTP method, and URL for each request
 */
export function logMiddleware(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}

