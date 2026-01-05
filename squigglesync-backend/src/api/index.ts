import { Router } from 'express';
import { createRouter, routeGroup } from '../utils/router.util';
import { logMiddleware } from '../middleware/example.middleware';
import { sequenceRouter } from './sequence.router';
import { eventsRouter } from './events.router';

const router = createRouter();

// Route group with middleware
// All routes in this group will have logMiddleware applied
const apiRoutes = routeGroup(
  {
    middleware: [logMiddleware],
  },
  (router) => {
    // Mount routers
    router.use('/sequence', sequenceRouter);
    router.use('/events', eventsRouter);
  }
);

// Mount the route group
router.use(apiRoutes);

export default router;
