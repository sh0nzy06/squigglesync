import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

// Services & Stores
import { ConnectionStore } from '../../../core/store/connection.store';

/**
 * ConnectionStatusComponent
 * 
 * PURPOSE: Reusable component for displaying WebSocket connection status
 * 
 * WHY IT MATTERS:
 * Provides a clean, accessible interface for connection status that can be
 * reused across the application. Follows UI/UX best practices with clear
 * visual hierarchy, proper accessibility, and responsive design.
 * 
 * HOW IT WORKS:
 * 1. Reads connection state from ConnectionStore signals
 * 2. Computes display values (status text, severity, icon)
 * 3. Renders PrimeNG Tag and Badge components reactively
 * 4. Updates automatically when connection state changes
 * 
 * EXAMPLE:
 * <app-connection-status />
 * → Displays "Connected" or "Disconnected" with appropriate styling
 * → Updates reactively when connection state changes
 */
@Component({
  selector: 'app-connection-status',
  imports: [
    CommonModule,
    Tag,
    Tooltip
  ],
  templateUrl: './connection-status.component.html',
  styleUrl: './connection-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionStatusComponent {
  // ============================================================================
  // DEPENDENCIES
  // ============================================================================
  private connectionStore = inject(ConnectionStore);

  // ============================================================================
  // COMPUTED SIGNALS
  // ============================================================================
  /**
   * Computed signal: Connection status text
   * 
   * Returns human-readable status text based on connection state.
   * - "Connected" when connected
   * - "Disconnected" when disconnected
   * - "Connecting..." when connecting
   */
  statusText = computed<string>(() => {
    const status = this.connectionStore.connectionStatus();
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  });

  /**
   * Computed signal: Connection status severity
   * 
   * Returns PrimeNG severity level for styling.
   * - "success" when connected
   * - "warn" when connecting (PrimeNG uses "warn" not "warning")
   * - "danger" when disconnected
   */
  severity = computed<'success' | 'warn' | 'danger'>(() => {
    const status = this.connectionStore.connectionStatus();
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warn';
      case 'disconnected':
        return 'danger';
      default:
        return 'danger';
    }
  });

  /**
   * Computed signal: Connection status icon
   * 
   * Returns PrimeIcons icon class based on connection state.
   * - "pi-check-circle" when connected
   * - "pi-spin pi-spinner" when connecting
   * - "pi-times-circle" when disconnected
   */
  icon = computed<string>(() => {
    const status = this.connectionStore.connectionStatus();
    switch (status) {
      case 'connected':
        return 'pi-check-circle';
      case 'connecting':
        return 'pi-spin pi-spinner';
      case 'disconnected':
        return 'pi-times-circle';
      default:
        return 'pi-question-circle';
    }
  });

  /**
   * Computed signal: Whether connection is active
   * 
   * Exposes the isConnected signal for template use.
   */
  isConnected = computed<boolean>(() => this.connectionStore.isConnected());

  /**
   * Computed signal: Whether connection is in progress
   * 
   * Exposes the isConnecting signal for template use.
   */
  isConnecting = computed<boolean>(() => this.connectionStore.isConnecting());

  /**
   * Computed signal: Connection status tooltip text
   * 
   * Provides detailed status information for accessibility.
   */
  tooltipText = computed<string>(() => {
    const status = this.connectionStore.connectionStatus();
    const sessionId = this.connectionStore.sessionId();
    
    switch (status) {
      case 'connected':
        return sessionId 
          ? `Connected to server (Session: ${sessionId})`
          : 'Connected to server';
      case 'connecting':
        return 'Attempting to connect to server...';
      case 'disconnected':
        return 'Not connected to server';
      default:
        return 'Connection status unknown';
    }
  });
}

