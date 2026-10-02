export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3;

export type CellValue = TetrominoType | null;

export type BoardMatrix = CellValue[][]; // 20 rows x 10 cols visible (0-19)

export interface Point {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: RotationState;
  shape: number[][];
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface LineClearEvent {
  rows: number[];
  count: number;
  isTetris: boolean;
  isTSpin: boolean;
  isTSpinMini: boolean;
  isBackToBack: boolean;
  isPerfectClear: boolean;
  combo: number;
  scoreGained: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean;
  tetrisCount: number;
  tSpinCount: number;
  pieceCount: Record<TetrominoType, number>;
}
