import { Injectable, signal, computed } from '@angular/core';

/**
 * UserPresence
 * 
 * Represents an active user in the room with their presence information.
 */
export interface UserPresence {
  /** Unique user identifier */
  userId: string;
  /** Display name for the user */
  userName: string;
  /** Unique color assigned to the user for visual distinction */
  color: string;
  /** Timestamp when the user joined the room */
  joinedAt: number;
}

/**
 * CursorPosition
 * 
 * Represents a user's cursor position on the canvas.
 */
export interface CursorPosition {
  /** X coordinate on the canvas */
  x: number;
  /** Y coordinate on the canvas */
  y: number;
  /** Timestamp of the last cursor update */
  lastUpdate: number;
}

/**
 * PresenceStore
 * 
 * PURPOSE: Manages user presence and cursor positions in the room
 * 
 * WHY IT MATTERS:
 * This store tracks all active users in the current room and their cursor
 * positions, enabling real-time collaboration features like showing other
 * users' cursors with their names. It provides a single source of truth
 * for presence data that components can reactively read.
 * 
 * HOW IT WORKS:
 * 1. User joins room → addUser() called with userId and userName
 * 2. User moves cursor → updateCursor() called with position
 * 3. User leaves room → removeUser() called
 * 4. Components read signals → UI updates reactively
 * 
 * EXAMPLE:
 * User "Alice" joins → addUser('user-123', 'Alice') called
 *   ↓
 * activeUsers signal updated with Alice's presence
 *   ↓
 * activeUserCount() computed signal updates
 *   ↓
 * Component effect() triggers → UI shows Alice joined
 */
@Injectable({
  providedIn: 'root',
})
export class PresenceStore {
  // ============================================================================
  // STATE SIGNALS
  // ============================================================================
  /**
   * Map of active users in the room
   * Key: userId, Value: UserPresence
   */
  private _activeUsers = signal<Map<string, UserPresence>>(new Map());

  /**
   * Map of user cursor positions
   * Key: userId, Value: CursorPosition
   */
  private _userCursors = signal<Map<string, CursorPosition>>(new Map());

  // ============================================================================
  // READONLY SIGNALS
  // ============================================================================
  /**
   * Read-only access to active users map
   */
  readonly activeUsers = this._activeUsers.asReadonly();

  /**
   * Read-only access to user cursors map
   */
  readonly userCursors = this._userCursors.asReadonly();

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  /**
   * Computed signal: Number of active users
   * 
   * Returns the count of active users in the room.
   * 
   * @returns The number of active users
   * 
   * Example:
   * activeUsers has 3 users
   * activeUserCount() → Returns 3
   */
  readonly activeUserCount = computed(() => this._activeUsers().size);

  /**
   * Computed signal: List of active users
   * 
   * Returns an array of all active users, sorted by join time.
   * Useful for displaying user lists in the UI.
   * 
   * @returns Array of UserPresence objects, sorted by joinedAt
   * 
   * Example:
   * activeUsers has 2 users
   * userList() → Returns [UserPresence, UserPresence]
   */
  readonly userList = computed(() => {
    const users = Array.from(this._activeUsers().values());
    // Sort by join time (oldest first)
    return users.sort((a, b) => a.joinedAt - b.joinedAt);
  });

  /**
   * Computed signal: List of user IDs
   * 
   * Returns an array of all active user IDs.
   * Useful for iteration or checking if a user exists.
   * 
   * @returns Array of user ID strings
   */
  readonly userIds = computed(() => Array.from(this._activeUsers().keys()));

  // ============================================================================
  // COLOR PALETTE
  // ============================================================================
  /**
   * Predefined color palette for user colors
   * 
   * Colors are chosen for good contrast and visibility.
   * Each user gets a unique color from this palette.
   */
  private readonly USER_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#A855F7', // Violet
  ];

  // ============================================================================
  // METHODS
  // ============================================================================

  /**
   * Add a user to the presence store
   * 
   * Adds a new user to the active users map with a unique color.
   * The color is assigned based on the user's position in the room
   * to ensure consistency across sessions.
   * 
   * @param userId - The unique user identifier
   * @param userName - The display name for the user
   * @param color - Optional color. If not provided, a color is assigned automatically
   * 
   * Example:
   * addUser('user-123', 'Alice')
   * → Adds Alice to activeUsers map
   * → Assigns a unique color from palette
   * → Sets joinedAt timestamp
   */
  addUser(userId: string, userName: string, color?: string): void {
    const users = new Map(this._activeUsers());
    
    // Don't add if user already exists
    if (users.has(userId)) {
      return;
    }

    // Assign color if not provided
    const userColor = color || this.getUserColor(userId);

    const presence: UserPresence = {
      userId,
      userName,
      color: userColor,
      joinedAt: Date.now(),
    };

    users.set(userId, presence);
    this._activeUsers.set(users);
  }

  /**
   * Remove a user from the presence store
   * 
   * Removes the user from both active users and cursor positions.
   * 
   * @param userId - The unique user identifier to remove
   * 
   * Example:
   * removeUser('user-123')
   * → Removes user from activeUsers map
   * → Removes user's cursor position
   */
  removeUser(userId: string): void {
    const users = new Map(this._activeUsers());
    users.delete(userId);
    this._activeUsers.set(users);

    // Also remove cursor position
    const cursors = new Map(this._userCursors());
    cursors.delete(userId);
    this._userCursors.set(cursors);
  }

  /**
   * Update a user's cursor position
   * 
   * Updates the cursor position for a specific user.
   * Only updates if the user exists in the active users map.
   * 
   * @param userId - The unique user identifier
   * @param x - X coordinate on the canvas
   * @param y - Y coordinate on the canvas
   * 
   * Example:
   * updateCursor('user-123', 100, 200)
   * → Updates cursor position for user-123
   * → Sets lastUpdate timestamp
   */
  updateCursor(userId: string, x: number, y: number): void {
    // Only update cursor if user exists
    if (!this._activeUsers().has(userId)) {
      return;
    }

    const cursors = new Map(this._userCursors());
    cursors.set(userId, {
      x,
      y,
      lastUpdate: Date.now(),
    });
    this._userCursors.set(cursors);
  }

  /**
   * Get a unique color for a user
   * 
   * Assigns a color from the palette based on the user ID.
   * Uses a simple hash function to ensure consistent color
   * assignment for the same user ID.
   * 
   * @param userId - The unique user identifier
   * @returns A hex color string from the palette
   * 
   * Example:
   * getUserColor('user-123')
   * → Returns '#3B82F6' (or another color from palette)
   */
  getUserColor(userId: string): string {
    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value and modulo to get palette index
    const index = Math.abs(hash) % this.USER_COLORS.length;
    return this.USER_COLORS[index];
  }

  /**
   * Get a user's presence information
   * 
   * @param userId - The unique user identifier
   * @returns UserPresence if user exists, undefined otherwise
   * 
   * Example:
   * getUser('user-123')
   * → Returns UserPresence object or undefined
   */
  getUser(userId: string): UserPresence | undefined {
    return this._activeUsers().get(userId);
  }

  /**
   * Get a user's cursor position
   * 
   * @param userId - The unique user identifier
   * @returns CursorPosition if user has a cursor, undefined otherwise
   * 
   * Example:
   * getCursor('user-123')
   * → Returns CursorPosition object or undefined
   */
  getCursor(userId: string): CursorPosition | undefined {
    return this._userCursors().get(userId);
  }

  /**
   * Clear all users from presence store
   * 
   * Removes all users and cursor positions.
   * Useful when leaving a room or resetting state.
   * 
   * Example:
   * clearAll()
   * → Clears all active users
   * → Clears all cursor positions
   */
  clearAll(): void {
    this._activeUsers.set(new Map());
    this._userCursors.set(new Map());
  }

  /**
   * Check if a user is active
   * 
   * @param userId - The unique user identifier
   * @returns True if user is active, false otherwise
   * 
   * Example:
   * isUserActive('user-123')
   * → Returns true if user exists, false otherwise
   */
  isUserActive(userId: string): boolean {
    return this._activeUsers().has(userId);
  }
}

