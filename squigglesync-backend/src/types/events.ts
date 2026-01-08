export interface BaseEvent {
  type: string;
  userId: string;
  roomId: string;
  timestamp: number;
  sequence?: number;
}

export interface DrawLineEvent extends BaseEvent {
  type: 'DRAW_LINE';
  points: [number, number][];
  color: string;
  strokeWidth: number;
}

export interface DrawPathEvent extends BaseEvent {
  type: 'DRAW_PATH';
  path: [number, number][];
  color: string;
  strokeWidth: number;
}

export interface EraseEvent extends BaseEvent {
  type: 'ERASE';
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ClearCanvasEvent extends BaseEvent {
  type: 'CLEAR_CANVAS';
}

export interface JoinRoomEvent extends BaseEvent {
  type: 'JOIN_ROOM';
  roomId: string;
}

export interface LeaveRoomEvent extends BaseEvent {
  type: 'LEAVE_ROOM';
  roomId: string;
}

export type WhiteboardEvent = 
  | DrawLineEvent 
  | DrawPathEvent 
  | EraseEvent 
  | ClearCanvasEvent 
  | JoinRoomEvent 
  | LeaveRoomEvent;

export interface ServerMessage {
    type: 'CONNECTED' | 'ROOM_JOINED' | 'ERROR' | 'EVENT';
    payload?: any;
    error?: string;
}
