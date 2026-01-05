import { Request, Response, NextFunction } from 'express';

/**
 * Example middleware - logs request info
 * You can create more middleware files here for auth, validation, etc.
 */
export function logMiddleware(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

/**
 * Example auth middleware (placeholder)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // TODO: Implement actual authentication
  // For now, just pass through
  next();
}

