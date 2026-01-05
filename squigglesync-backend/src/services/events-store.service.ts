/**
 * EventStoreService
 * 
 * PURPOSE: Stores events in memory and maintains their order
 * 
 * WHY IT MATTERS FOR CONCURRENCY:
 * When multiple events arrive at the same time, we need to:
 * 1. Assign them sequence numbers (via SequenceManager)
 * 2. Store them in the correct order
 * 3. Retrieve them in order (for state reconstruction)
 * 
 * HOW IT WORKS:
 * - Each room has an array of events
 * - Events are stored sorted by sequence number
 * - When adding an event, we insert it in the right position
 * 
 * EXAMPLE:
 * Event 1 arrives → stored at position 0
 * Event 3 arrives (out of order!) → stored at position 1
 * Event 2 arrives (late!) → inserted at position 1, Event 3 moves to position 2
 * 
 * Result: [Event1, Event2, Event3] - always in order!
 */
import { WhiteboardEvent } from '../types/events';
import { SequenceManagerService } from './sequence-manager.service';

export class EventStoreService {
    private events: Map<string, WhiteboardEvent[]> = new Map();
    private sequenceManager: SequenceManagerService = new SequenceManagerService();

    constructor(sequenceManager: SequenceManagerService) {
        this.sequenceManager = sequenceManager;
    }

    /**
     * Add an event to the store
     * 
     * This is where the magic happens:
     * 1. Get next sequence number (ensures ordering)
     * 2. Attach sequence to event
     * 3. Insert event in sorted position
     * 
     * @param roomId - The room identifier
     * @param event - The event to store
     * @returns The event with sequence number attached
     */
    addEvent(roomId: string, event: WhiteboardEvent): WhiteboardEvent {
        const sequence = this.sequenceManager.getNextSequence(roomId);
        const enrichedEvent: WhiteboardEvent = {
            ...event,
            sequence,
            timestamp: Date.now()
        };

        if (!this.events.has(roomId)) {
            this.events.set(roomId, []);
        }

        // non-null assertion - we know the room exists and has events
        const roomEvents = this.events.get(roomId)!;

        this.insertEvent(roomEvents, enrichedEvent);

        return enrichedEvent;
    }

    /**
     * Insert an event into the room events array in the correct position using binary search
     * @param roomEvents - The array of events for the room
     * @param event - The event to insert
     */
    private insertEvent(roomEvents: WhiteboardEvent[], event: WhiteboardEvent): void {
        const eventSeq = event.sequence || 0;

        //  binary search to find the correct position to insert the event
        let left = 0;
        let right = roomEvents.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const midSeq = roomEvents[mid].sequence || 0;

            if (midSeq < eventSeq) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        roomEvents.splice(left, 0, event);
    }

    /**
     * Get all events for a room
     * @param roomId - The room identifier
     * @returns Array of events for the room
     */
    getEvents(roomId: string): WhiteboardEvent[] {
        return this.events.get(roomId) || [];
    }

     /**
     * Get events after a specific sequence number
     * 
     * Useful for incremental sync:
     * - Client has events up to sequence 10
     * - Client requests events after 10
     * - Server returns events 11, 12, 13...
     * 
     * @param roomId - The room identifier
     * @param afterSequence - Only return events after this sequence
     * @returns Array of events after the sequence
     */
    getEventsAfter(roomId: string, afterSequence: number): WhiteboardEvent[] {
        const roomEvents = this.events.get(roomId) || [];

        return roomEvents.filter(event => event.sequence && event.sequence > afterSequence);
    }

    /**
     * Clear all events for a room
     * @param roomId - The room identifier
     */
    clearRoomEvents(roomId: string): void {
        this.events.delete(roomId);
        this.sequenceManager.resetSequence(roomId);
    }
}
