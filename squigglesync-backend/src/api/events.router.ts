import { createRouter } from '../utils/router.util';

const router = createRouter();

/**
 * POST /api/events
 * Receive and process a whiteboard event
 * @param req.body.roomId - The room ID
 * @param req.body.event - The event to process
 * @returns A message indicating that the event has been received
 * 
 * Example:
 * POST /api/events
 * Body: { roomId: 'room-123', event: { type: 'DRAW_LINE', userId: 'user-123', points: [[0,0], [100,100]] } }
 * 
 * Error:
 * 400 - Bad Request
 * 500 - Internal Server Error
 * 
 * Response:
 * { message: 'Event received', roomId: 'room-123', event: { type: 'DRAW_LINE', userId: 'user-123', points: [[0,0], [100,100]] } }
 */
router.post('/', (req, res) => {
    const { roomId, event } = req.body;

    if (!roomId || !event) {
        return res.status(400).json({ error: 'Room ID and event are required' });
    }

    if (!event.type || !event.userId) {
        return res.status(400).json({ error: 'Event type and user ID are required' });
    }

    res.json({
        success: true,
        message: 'Event received (stub - not processed yet)',
        received: {
            roomId,
            event
        }
    });
});

/**
 * GET /api/events/:roomId
 * Get all events for a room
 * @param req.params.roomId - The room ID
 * @returns A list of events for the room
 * 
 * Example:
 * GET /api/events/room-123
 * Response:
 * { success: true, message: 'Room events retrieved (stub - not implemented yet)', roomId: 'room-123', events: [] }
 * 
 * Error:
 * 400 - Bad Request
 * 500 - Internal Server Error
 */
router.get('/:roomId', (req, res) => {
    const { roomId } = req.params;
    res.json({
        success: true,
        message: 'Room events retrieved (stub - not implemented yet)',
        roomId,
        events: []
    });
});

export { router as eventsRouter };