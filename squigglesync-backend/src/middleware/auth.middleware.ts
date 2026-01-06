import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware (placeholder)
 * TODO: Implement actual authentication logic
 * For now, just passes through without validation
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // TODO: Implement actual authentication
  // For now, just pass through
  next();
}

