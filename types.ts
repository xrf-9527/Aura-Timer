export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface Position {
  x: number;
  y: number;
}

export interface GeminiDurationResponse {
  seconds: number;
  reasoning?: string;
}
