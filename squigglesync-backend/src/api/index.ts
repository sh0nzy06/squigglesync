import { Router } from 'express';
import { createRouter, routeGroup } from '../utils/router.util';
import { logMiddleware } from '../middleware/example.middleware';
import { sequenceManagerRouter } from './sequence-manager.router';
import { eventStoreRouter } from './events-store.router';
import { conflictResolverRouter } from './conflict-resolver.router';

const router = createRouter();

// Route group with middleware
// All routes in this group will have logMiddleware applied
const apiRoutes = routeGroup(
  {
    middleware: [logMiddleware],
  },
  (router) => {
    // Mount routers
    router.use('/sequence', sequenceManagerRouter);
    router.use('/events', eventStoreRouter);
    router.use('/conflict-resolver', conflictResolverRouter);
  }
);

// Mount the route group
router.use(apiRoutes);

export default router;
