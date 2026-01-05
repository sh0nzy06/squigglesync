/**
 * SequenceManagerService
 * 
 * PURPOSE: Generates sequence numbers for events to ensure ordering
 * 
 * WHY IT MATTERS FOR CONCURRENCY:
 * When multiple users draw at the same time, we need a way to order their events.
 * Sequence numbers give us deterministic ordering - event #5 always comes before #6,
 * even if they arrived at the server at nearly the same time.
 * 
 * HOW IT WORKS:
 * - Each room has its own sequence counter
 * - getNextSequence() increments and returns the next number
 * - This ensures events are numbered 1, 2, 3, 4... in order
 * 
 * EXAMPLE:
 * Room "room-1" starts at 0
 * User A draws → sequence 1
 * User B draws (at same time) → sequence 2
 * User A draws again → sequence 3
 * 
 * Even if User B's event arrives first, it gets sequence 2, and User A's gets 1.
 * This is because we assign sequences when events are processed, not when they arrive.
 */
export class SequenceManagerService {
    private sequences: Map<string, number> = new Map();

    /**
     * Get the current sequence number for a room
     * 
     * This is the core  function that ensures events are processed in the correct order.
     * 
     * @param roomId 
     * @returns The next sequence number for the room
     */
    getNextSequence(roomId: string): number { 
        const current = this.sequences.get(roomId) || 0;
        const next = current + 1;
        this.sequences.set(roomId, next);

        return next;
    }


    /**
     * Get the current sequence number for a room
     * 
     * @param roomId 
     * @returns The current sequence number for the room
     */
    getCurrentSequence(roomId: string): number {
        return this.sequences.get(roomId) || 0;
     }

    /**
     * Reset the sequence counter for a room
     * 
     * @param roomId 
     */
    resetSequence(roomId: string): void {
        this.sequences.delete(roomId);
    }
}