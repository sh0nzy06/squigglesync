import { createRouter } from '../utils/router.util';
import { SequenceManagerService } from '../services/sequence-manager.service';
import { EventStoreService } from '../services/event-store.service';
import { WhiteboardEvent } from '../types/events';

const router = createRouter();

const sequenceManagerService = new SequenceManagerService();
const eventsStoreService = new EventStoreService(sequenceManagerService);

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
 * 
 * HOW IT WORKS:
 * 1. Client sends event (drawing, erase, etc.)
 * 2. Server validates event
 * 3. Server processes event through EventStore
 *    - Assigns sequence number
 *    - Stores in order
 * 4. Server returns processed event (with sequence)
 * 
 * CONCURRENCY HANDLING:
 * If 2 users draw at the same time:
 * - User A's event → sequence 1
 * - User B's event → sequence 2
 * - Both stored in order
 * - Both clients receive events in same order
 */
router.post('/', (req, res) => {
    const { roomId, event } = req.body;

    try {
        const processedEvent = eventsStoreService.addEvent(roomId, event as WhiteboardEvent);

        res.json({
            success: true,
            event: processedEvent,
            message: 'Event processed and stored'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
 * 
 * HOW IT WORKS:
 * - Returns all events in order (by sequence number)
 * - Optional 'after' query param for incremental sync
 * 
 * EXAMPLE:
 * GET /api/events/room-123 → all events
 * GET /api/events/room-123?after=5 → events after sequence 5
 */
router.get('/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { after } = req.query;

    try {
        let events:WhiteboardEvent[];

        if (after) {
            events = eventsStoreService.getEventsAfter(roomId, parseInt(after as string));
        } else {
            events = eventsStoreService.getEvents(roomId);
        }

        res.json({
            roomId,
            events,
            count: events.length,
            lastSequence: events[events.length - 1]?.sequence || 0,
        })


    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export { router as eventStoreRouter };