import {
  ActivePiece,
  BoardMatrix,
  CellValue,
  LineClearEvent,
  Point,
  RotationState,
  TetrominoType,
} from '../types/tetris';
import {
  ALL_TETROMINOES,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BUFFER_ROWS,
  TETROMINO_SHAPES,
  TOTAL_ROWS,
  WALL_KICKS_I,
  WALL_KICKS_JLSTZ,
} from './tetrisConstants';

// Generates an empty board (22 rows x 10 cols)
export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: TOTAL_ROWS }, () => Array(BOARD_WIDTH).fill(null));
}

// 7-Bag Randomizer
export function generateBag(): TetrominoType[] {
  const bag = [...ALL_TETROMINOES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Collision detection
export function checkCollision(
  board: BoardMatrix,
  shape: number[][],
  pos: Point
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const targetX = pos.x + c;
        const targetY = pos.y + r;

        // Wall collisions
        if (targetX < 0 || targetX >= BOARD_WIDTH) {
          return true;
        }

        // Floor collision
        if (targetY >= TOTAL_ROWS) {
          return true;
        }

        // Board piece collision (if targetY >= 0)
        if (targetY >= 0 && targetY < TOTAL_ROWS && targetX >= 0 && targetX < BOARD_WIDTH) {
          if (board[targetY] && board[targetY][targetX] !== null) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Spawn a new active piece at top of visible board
export function spawnPiece(type: TetrominoType): ActivePiece {
  const shape = TETROMINO_SHAPES[type][0];
  // Calculate center x
  const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
  // Spawn such that the topmost filled block is at row BUFFER_ROWS (2)
  const y = type === 'I' ? 1 : 2;

  return {
    type,
    x,
    y,
    rotation: 0,
    shape,
  };
}

// Super Rotation System (SRS) attempt
export function tryRotate(
  board: BoardMatrix,
  currentPiece: ActivePiece,
  direction: 'CW' | 'CCW'
): { piece: ActivePiece; kickIndex: number } | null {
  const currentRotation = currentPiece.rotation;
  const newRotation: RotationState = direction === 'CW'
    ? ((currentRotation + 1) % 4) as RotationState
    : ((currentRotation + 3) % 4) as RotationState;

  const newShape = TETROMINO_SHAPES[currentPiece.type][newRotation];

  // For 'O', rotation is trivial
  if (currentPiece.type === 'O') {
    return {
      piece: { ...currentPiece, rotation: newRotation, shape: newShape },
      kickIndex: 0,
    };
  }

  // Lookup wall kick table
  const kickKey = `${currentRotation}->${newRotation}`;
  const kicks = currentPiece.type === 'I' ? WALL_KICKS_I[kickKey] : WALL_KICKS_JLSTZ[kickKey];

  if (!kicks) {
    if (!checkCollision(board, newShape, { x: currentPiece.x, y: currentPiece.y })) {
      return {
        piece: { ...currentPiece, rotation: newRotation, shape: newShape },
        kickIndex: 0,
      };
    }
    return null;
  }

  // Test each kick offset: note standard offsets are [dx, dy] where +dy is UP in SRS guidelines
  // In our grid where +y is DOWN, we invert dy: testX = x + dx, testY = y - dy
  for (let i = 0; i < kicks.length; i++) {
    const [dx, dy] = kicks[i];
    const testPos: Point = {
      x: currentPiece.x + dx,
      y: currentPiece.y - dy,
    };

    if (!checkCollision(board, newShape, testPos)) {
      return {
        piece: {
          ...currentPiece,
          x: testPos.x,
          y: testPos.y,
          rotation: newRotation,
          shape: newShape,
        },
        kickIndex: i,
      };
    }
  }

  return null;
}

// Calculate ghost piece (hard drop landing position)
export function getGhostPieceY(board: BoardMatrix, piece: ActivePiece): number {
  let ghostY = piece.y;
  while (!checkCollision(board, piece.shape, { x: piece.x, y: ghostY + 1 })) {
    ghostY++;
  }
  return ghostY;
}

// Check 3-corner T-Spin rule
export function checkTSpin(
  board: BoardMatrix,
  piece: ActivePiece,
  lastActionWasRotation: boolean,
  kickIndex: number
): { isTSpin: boolean; isMini: boolean } {
  if (piece.type !== 'T' || !lastActionWasRotation) {
    return { isTSpin: false, isMini: false };
  }

  // The 4 diagonal corners around the T-piece center (1, 1 relative to piece matrix)
  const centerPos = { x: piece.x + 1, y: piece.y + 1 };
  const corners = [
    { x: centerPos.x - 1, y: centerPos.y - 1 }, // Top-Left
    { x: centerPos.x + 1, y: centerPos.y - 1 }, // Top-Right
    { x: centerPos.x + 1, y: centerPos.y + 1 }, // Bottom-Right
    { x: centerPos.x - 1, y: centerPos.y + 1 }, // Bottom-Left
  ];

  let occupiedCorners = 0;
  for (const c of corners) {
    if (c.x < 0 || c.x >= BOARD_WIDTH || c.y >= TOTAL_ROWS || (c.y >= 0 && board[c.y][c.x] !== null)) {
      occupiedCorners++;
    }
  }

  if (occupiedCorners < 3) {
    return { isTSpin: false, isMini: false };
  }

  // If 5th kick was used (index 4), it's always standard T-Spin
  if (kickIndex === 4) {
    return { isTSpin: true, isMini: false };
  }

  // Check front two corners based on rotation
  // Rotation 0: front is Top-Left (0) and Top-Right (1)
  // Rotation 1: front is Top-Right (1) and Bottom-Right (2)
  // Rotation 2: front is Bottom-Right (2) and Bottom-Left (3)
  // Rotation 3: front is Bottom-Left (3) and Top-Left (0)
  const frontIndices: Record<RotationState, [number, number]> = {
    0: [0, 1],
    1: [1, 2],
    2: [2, 3],
    3: [3, 0],
  };

  const [f1, f2] = frontIndices[piece.rotation];
  const isOcc = (idx: number) => {
    const c = corners[idx];
    return c.x < 0 || c.x >= BOARD_WIDTH || c.y >= TOTAL_ROWS || (c.y >= 0 && board[c.y][c.x] !== null);
  };

  const frontOcc = (isOcc(f1) ? 1 : 0) + (isOcc(f2) ? 1 : 0);

  // If both front corners are occupied, it's a full T-Spin; if only 1 front corner is occupied, it's a T-Spin Mini
  const isMini = frontOcc < 2;

  return { isTSpin: true, isMini };
}

// Lock active piece onto board
export function lockPiece(board: BoardMatrix, piece: ActivePiece): BoardMatrix {
  const newBoard = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== 0) {
        const boardY = piece.y + r;
        const boardX = piece.x + c;
        if (boardY >= 0 && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }
  return newBoard;
}

// Process full rows, line clears, and calculate scoring details
export function processLineClears(
  board: BoardMatrix,
  level: number,
  currentCombo: number,
  wasBackToBack: boolean,
  tSpinResult: { isTSpin: boolean; isMini: boolean }
): {
  newBoard: BoardMatrix;
  clearEvent: LineClearEvent | null;
  newCombo: number;
  newBackToBack: boolean;
} {
  const fullRowIndices: number[] = [];

  for (let r = 0; r < TOTAL_ROWS; r++) {
    if (board[r].every((cell) => cell !== null)) {
      fullRowIndices.push(r);
    }
  }

  const linesCleared = fullRowIndices.length;

  if (linesCleared === 0) {
    if (tSpinResult.isTSpin) {
      // T-Spin 0 lines
      const scoreGained = (tSpinResult.isMini ? 100 : 400) * level;
      return {
        newBoard: board,
        clearEvent: {
          rows: [],
          count: 0,
          isTetris: false,
          isTSpin: !tSpinResult.isMini,
          isTSpinMini: tSpinResult.isMini,
          isBackToBack: wasBackToBack,
          isPerfectClear: false,
          combo: -1,
          scoreGained,
        },
        newCombo: -1,
        newBackToBack: wasBackToBack,
      };
    }

    return {
      newBoard: board,
      clearEvent: null,
      newCombo: -1,
      newBackToBack: wasBackToBack,
    };
  }

  // Remove full rows and insert empty rows at top
  const remainingRows = board.filter((_, idx) => !fullRowIndices.includes(idx));
  const newEmptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(null));
  const newBoard: BoardMatrix = [...newEmptyRows, ...remainingRows];

  // Check Perfect Clear (is board completely empty now?)
  const isPerfectClear = newBoard.every((row) => row.every((cell) => cell === null));

  const isTetris = linesCleared === 4;
  const isTSpin = tSpinResult.isTSpin && !tSpinResult.isMini;
  const isTSpinMini = tSpinResult.isTSpin && tSpinResult.isMini;
  const isDifficult = isTetris || isTSpin || isTSpinMini;

  const isBackToBack = isDifficult && wasBackToBack;
  const b2bMultiplier = isBackToBack ? 1.5 : 1;

  // Base score calculation
  let baseScore = 0;
  if (tSpinResult.isTSpin) {
    if (isTSpinMini) {
      baseScore = linesCleared === 1 ? 200 : 400;
    } else {
      if (linesCleared === 1) baseScore = 800;
      else if (linesCleared === 2) baseScore = 1200;
      else if (linesCleared === 3) baseScore = 1600;
    }
  } else {
    if (linesCleared === 1) baseScore = 100;
    else if (linesCleared === 2) baseScore = 300;
    else if (linesCleared === 3) baseScore = 500;
    else if (linesCleared === 4) baseScore = 800;
  }

  let scoreGained = Math.floor(baseScore * level * b2bMultiplier);

  // Combo bonus: 50 * combo * level
  const newCombo = currentCombo + 1;
  if (newCombo > 0) {
    scoreGained += 50 * newCombo * level;
  }

  // Perfect clear bonus
  if (isPerfectClear) {
    const pcBonus = [0, 800, 1200, 1800, 2000][linesCleared] || 2000;
    scoreGained += pcBonus * level;
  }

  const clearEvent: LineClearEvent = {
    rows: fullRowIndices,
    count: linesCleared,
    isTetris,
    isTSpin,
    isTSpinMini,
    isBackToBack,
    isPerfectClear,
    combo: newCombo,
    scoreGained,
  };

  return {
    newBoard,
    clearEvent,
    newCombo,
    newBackToBack: isDifficult,
  };
}
