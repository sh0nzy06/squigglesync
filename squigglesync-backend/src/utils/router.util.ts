import { Router, RequestHandler, Request, Response, NextFunction } from 'express';

/**
 * Creates a new Express router instance
 * Centralized router creation to reduce boilerplate
 */
export function createRouter(): Router {
  return Router();
}

/**
 * Route group configuration
 */
export interface RouteGroupOptions {
  prefix?: string;
  middleware?: RequestHandler[];
}

/**
 * Laravel-style route group
 * Allows grouping routes with a common prefix and/or middleware
 * 
 * @example
 * routeGroup({ prefix: '/api', middleware: [authMiddleware] }, (router) => {
 *   router.get('/users', getUsers);
 *   router.post('/users', createUser);
 * });
 */
export function routeGroup(
  options: RouteGroupOptions,
  callback: (router: Router) => void
): Router {
  const router = createRouter();

  // Apply middleware if provided
  if (options.middleware) {
    router.use(...options.middleware);
  }

  // Execute route definitions
  callback(router);

  // If prefix is provided, create a parent router to mount with prefix
  if (options.prefix) {
    const parentRouter = createRouter();
    parentRouter.use(options.prefix, router);
    return parentRouter;
  }

  return router;
}

/**
 * Helper to create a route group without prefix (just middleware)
 */
export function middlewareGroup(
  middleware: RequestHandler[],
  callback: (router: Router) => void
): Router {
  return routeGroup({ middleware }, callback);
}

/**
 * Helper to create a route group with just prefix (no middleware)
 */
export function prefixGroup(
  prefix: string,
  callback: (router: Router) => void
): Router {
  return routeGroup({ prefix }, callback);
}

