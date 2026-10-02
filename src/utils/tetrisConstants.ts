import { TetrominoType, RotationState } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BUFFER_ROWS = 2; // Spawn area above visible board
export const TOTAL_ROWS = BOARD_HEIGHT + BUFFER_ROWS; // 22

export const TETROMINO_COLORS: Record<TetrominoType, {
  primary: string;
  light: string;
  dark: string;
  border: string;
  glow: string;
}> = {
  I: {
    primary: '#06b6d4', // Cyan 500
    light: '#67e8f9',   // Cyan 300
    dark: '#0e7490',    // Cyan 700
    border: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  O: {
    primary: '#eab308', // Yellow 500
    light: '#fde047',   // Yellow 300
    dark: '#a16207',    // Yellow 700
    border: '#facc15',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  T: {
    primary: '#a855f7', // Purple 500
    light: '#d8b4fe',   // Purple 300
    dark: '#7e22ce',    // Purple 700
    border: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  S: {
    primary: '#22c55e', // Green 500
    light: '#86efac',   // Green 300
    dark: '#15803d',    // Green 700
    border: '#4ade80',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  Z: {
    primary: '#ef4444', // Red 500
    light: '#fca5a5',   // Red 300
    dark: '#b91c1c',    // Red 700
    border: '#f87171',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  J: {
    primary: '#3b82f6', // Blue 500
    light: '#93c5fd',   // Blue 300
    dark: '#1d4ed8',    // Blue 700
    border: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  L: {
    primary: '#f97316', // Orange 500
    light: '#fdba74',   // Orange 300
    dark: '#c2410c',    // Orange 700
    border: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
};

// 4-state rotation shapes for each tetromino
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

// Super Rotation System (SRS) Wall Kick Data
// Offsets [dx, dy] where +x is right, +y is down
export const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

export const WALL_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

// Returns drop interval (ms) for a given level
export function getGravityMs(level: number): number {
  // Official standard curve approximation: smooth acceleration
  const speed = Math.pow(0.8 - ((Math.min(level, 15) - 1) * 0.007), Math.min(level, 15) - 1);
  return Math.max(50, Math.round(speed * 1000));
}

export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;
export const ALL_TETROMINOES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
