import { Component, ChangeDetectionStrategy, signal, computed, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services & Stores
import { WhiteboardStore } from '../../../core/store/whiteboard.store';

/**
 * RoomSelectorComponent
 * 
 * PURPOSE: Reusable component for creating and joining whiteboard rooms
 * 
 * WHY IT MATTERS:
 * Provides a clean, accessible interface for room management that can be
 * reused across the application. Follows UI/UX best practices with clear
 * visual hierarchy, proper accessibility, and responsive design.
 * 
 * HOW IT WORKS:
 * 1. User can enter a room ID to join an existing room
 * 2. User can generate a new room ID to create a room
 * 3. Component emits room changes via output signals
 * 4. Integrates with WhiteboardStore for state management
 * 
 * EXAMPLE:
 * <app-room-selector 
 *   [initialRoomId]="roomId()"
 *   (roomCreated)="handleRoomCreated($event)"
 *   (roomJoined)="handleRoomJoined($event)"
 * />
 */
@Component({
  selector: 'app-room-selector',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    Button,
    InputGroup,
    InputGroupAddon,
    Message,
    Tooltip
  ],
  templateUrl: './room-selector.component.html',
  styleUrl: './room-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomSelectorComponent {
  // ============================================================================
  // DEPENDENCIES
  // ============================================================================
  private whiteboardStore = inject(WhiteboardStore);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // ============================================================================
  // INPUTS
  // ============================================================================
  /**
   * Initial room ID to display (optional)
   * Useful when editing an existing room or pre-filling the input
   */
  initialRoomId = input<string>('');

  /**
   * Whether to show the "Create New Room" button
   * Defaults to true
   */
  showCreateButton = input<boolean>(true);

  /**
   * Whether to auto-navigate to the room after creation/join
   * Defaults to false (parent handles navigation)
   */
  autoNavigate = input<boolean>(false);

  // ============================================================================
  // OUTPUTS
  // ============================================================================
  /**
   * Emitted when a new room is created
   * Emits the generated room ID
   */
  roomCreated = output<string>();

  /**
   * Emitted when a user joins an existing room
   * Emits the room ID
   */
  roomJoined = output<string>();

  /**
   * Emitted when room ID changes (for URL sharing)
   * Emits the room ID
   */
  roomIdChange = output<string>();

  // ============================================================================
  // STATE
  // ============================================================================
  /**
   * Current room ID input value
   */
  roomIdInput = signal<string>('');

  /**
   * Whether the component is in a loading state
   */
  isLoading = signal<boolean>(false);

  /**
   * Error message to display (if any)
   */
  errorMessage = signal<string | null>(null);

  /**
   * Success message to display (if any)
   */
  successMessage = signal<string | null>(null);

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  /**
   * Whether the room ID input is valid
   * Room ID must be non-empty and at least 3 characters
   */
  isValidRoomId = computed(() => {
    const id = this.roomIdInput().trim();
    return id.length >= 3;
  });

  /**
   * Whether the join button should be enabled
   */
  canJoin = computed(() => {
    return this.isValidRoomId() && !this.isLoading();
  });

  /**
   * Whether the create button should be enabled
   */
  canCreate = computed(() => {
    return !this.isLoading();
  });

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  constructor() {
    // Initialize with provided room ID if available
    const initialId = this.initialRoomId();
    if (initialId) {
      this.roomIdInput.set(initialId);
    }
  }

  // ============================================================================
  // METHODS
  // ============================================================================

  /**
   * Generate a unique room ID
   * 
   * Creates a room ID using a random alphanumeric string.
   * Format: "room-{random-string}"
   * 
   * @returns Generated room ID
   */
  generateRoomId(): string {
    return `room-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Handle creating a new room
   * 
   * Generates a new room ID, updates the store, and emits events.
   * Optionally navigates to the room if autoNavigate is enabled.
   */
  onCreateRoom(): void {
    if (!this.canCreate()) {
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    try {
      const roomId = this.generateRoomId();
      this.roomIdInput.set(roomId);
      
      // Update store
      this.whiteboardStore.setRoom(roomId);
      
      // Emit events
      this.roomCreated.emit(roomId);
      this.roomIdChange.emit(roomId);

      // Show success message
      this.successMessage.set('Room created successfully!');
      this.messageService.add({
        severity: 'success',
        summary: 'Room Created',
        detail: `Room ${roomId} has been created`,
        life: 3000
      });

      // Auto-navigate if enabled
      if (this.autoNavigate()) {
        this.navigateToRoom(roomId);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create room';
      this.errorMessage.set(errorMsg);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle joining an existing room
   * 
   * Validates the room ID, updates the store, and emits events.
   * Optionally navigates to the room if autoNavigate is enabled.
   */
  onJoinRoom(): void {
    if (!this.canJoin()) {
      return;
    }

    const roomId = this.roomIdInput().trim();
    if (!roomId) {
      this.errorMessage.set('Please enter a room ID');
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    try {
      // Update store
      this.whiteboardStore.setRoom(roomId);
      
      // Emit events
      this.roomJoined.emit(roomId);
      this.roomIdChange.emit(roomId);

      // Show success message
      this.successMessage.set(`Joining room ${roomId}...`);
      this.messageService.add({
        severity: 'success',
        summary: 'Joining Room',
        detail: `Connecting to room ${roomId}`,
        life: 3000
      });

      // Auto-navigate if enabled
      if (this.autoNavigate()) {
        this.navigateToRoom(roomId);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to join room';
      this.errorMessage.set(errorMsg);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle room ID input changes
   * 
   * Updates the room ID signal and clears messages when user types.
   */
  onRoomIdChange(value: string): void {
    this.roomIdInput.set(value);
    this.clearMessages();
  }

  /**
   * Copy room link to clipboard
   * 
   * Generates the full URL for the current room and copies it to clipboard.
   * Shows a success message on completion.
   */
  copyRoomLink(): void {
    const roomId = this.roomIdInput().trim();
    if (!roomId) {
      this.errorMessage.set('No room ID to copy');
      return;
    }

    if (typeof window === 'undefined' || !window.navigator?.clipboard) {
      this.errorMessage.set('Clipboard API not available');
      return;
    }

    const link = `${window.location.origin}/whiteboard/${roomId}`;
    window.navigator.clipboard.writeText(link).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Link Copied',
        detail: 'Room link copied to clipboard',
        life: 3000
      });
    }).catch(() => {
      this.errorMessage.set('Failed to copy link');
    });
  }

  /**
   * Navigate to the room route
   * 
   * @param roomId The room ID to navigate to
   */
  private navigateToRoom(roomId: string): void {
    this.router.navigate(['/whiteboard', roomId]).catch((error) => {
      console.error('Navigation error:', error);
      this.errorMessage.set('Failed to navigate to room');
    });
  }

  /**
   * Clear all messages
   */
  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}

