import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivePiece,
  BoardMatrix,
  GameStats,
  GameStatus,
  TetrominoType,
} from '../types/tetris';
import { sound } from '../utils/audio';
import {
  getGravityMs,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
} from '../utils/tetrisConstants';
import {
  checkCollision,
  checkTSpin,
  createEmptyBoard,
  generateBag,
  getGhostPieceY,
  lockPiece,
  processLineClears,
  spawnPiece,
  tryRotate,
} from '../utils/tetrisLogic';

const STORAGE_HIGH_SCORE_KEY = 'tetris_neo_high_score';

export function useTetris() {
  const [board, setBoard] = useState<BoardMatrix>(createEmptyBoard);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [ghostY, setGhostY] = useState<number | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [recentBanner, setRecentBanner] = useState<{ text: string; subtext?: string; id: number } | null>(null);
  const [shake, setShake] = useState(false);

  const [stats, setStats] = useState<GameStats>(() => {
    let savedHighScore = 0;
    try {
      const stored = localStorage.getItem(STORAGE_HIGH_SCORE_KEY);
      if (stored) savedHighScore = parseInt(stored, 10) || 0;
    } catch {
      // LocalStorage unavailable
    }

    return {
      score: 0,
      highScore: savedHighScore,
      level: 1,
      lines: 0,
      combo: -1,
      backToBack: false,
      tetrisCount: 0,
      tSpinCount: 0,
      pieceCount: {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      },
    };
  });

  // Mutable refs for high-frequency game loop and synchronous state
  const bagRef = useRef<TetrominoType[]>([]);
  const boardRef = useRef<BoardMatrix>(board);
  boardRef.current = board;
  const activePieceRef = useRef<ActivePiece | null>(activePiece);
  activePieceRef.current = activePiece;
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;
  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;
  const canHoldRef = useRef<boolean>(canHold);
  canHoldRef.current = canHold;
  const holdPieceRef = useRef<TetrominoType | null>(holdPiece);
  holdPieceRef.current = holdPiece;
  const nextQueueRef = useRef<TetrominoType[]>(nextQueue);
  nextQueueRef.current = nextQueue;

  // Lock delay and rotation metadata
  const lockTimerRef = useRef<number | null>(null);
  const lockResetCountRef = useRef<number>(0);
  const lastActionWasRotationRef = useRef<boolean>(false);
  const lastKickIndexRef = useRef<number>(0);
  const lastDropTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Line clear animation guard
  const isClearingLinesRef = useRef<boolean>(false);
  const lineClearTimeoutRef = useRef<number | null>(null);

  // Helper: Pull next piece from bag (keeps at least 7 in reserve queue)
  const getNextFromBag = useCallback((): TetrominoType => {
    if (bagRef.current.length <= 7) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    const next = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 5)]);
    return next;
  }, []);

  // Update ghost Y whenever active piece or board changes
  useEffect(() => {
    if (activePiece && status === 'PLAYING') {
      const gy = getGhostPieceY(board, activePiece);
      setGhostY(gy);
    } else {
      setGhostY(null);
    }
  }, [activePiece, board, status]);

  // Check if piece is on floor or rested on another piece
  const isGrounded = useCallback((piece: ActivePiece, curBoard: BoardMatrix): boolean => {
    return checkCollision(curBoard, piece.shape, { x: piece.x, y: piece.y + 1 });
  }, []);

  // Clear lock timer
  const cancelLockTimer = useCallback(() => {
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  // Trigger floating visual banner (snappy display)
  const showBanner = useCallback((text: string, subtext?: string) => {
    setRecentBanner({ text, subtext, id: Date.now() });
    setTimeout(() => {
      setRecentBanner((prev) => (prev?.id === Date.now() || prev?.text === text ? null : prev));
    }, 900);
  }, []);

  // Spawn next piece or trigger game over
  const spawnNextPiece = useCallback((currentBoard: BoardMatrix) => {
    cancelLockTimer();
    const nextType = getNextFromBag();
    const newPiece = spawnPiece(nextType);

    // Reset lock counters
    lockResetCountRef.current = 0;
    lastActionWasRotationRef.current = false;
    lastKickIndexRef.current = 0;
    setCanHold(true);

    // Check game over (cannot place new piece at spawn position)
    if (checkCollision(currentBoard, newPiece.shape, { x: newPiece.x, y: newPiece.y })) {
      sound.playGameOver();
      sound.stopBgm();
      setStatus('GAME_OVER');
      setActivePiece(null);
      activePieceRef.current = null;
      return;
    }

    setActivePiece(newPiece);
    activePieceRef.current = newPiece;
    lastDropTimeRef.current = performance.now();
  }, [cancelLockTimer, getNextFromBag]);

  // Lock and resolve piece
  const commitLockPiece = useCallback((piece: ActivePiece) => {
    // 1. Immediately cancel any pending lock timer
    cancelLockTimer();

    // 2. Immediately clear the active piece so the gravity loop stops targeting it
    setActivePiece(null);
    activePieceRef.current = null;

    sound.playLock();

    const currentBoard = boardRef.current;
    const currentStats = statsRef.current;

    // Check T-spin before placing piece
    const tSpinResult = checkTSpin(
      currentBoard,
      piece,
      lastActionWasRotationRef.current,
      lastKickIndexRef.current
    );

    const lockedBoard = lockPiece(currentBoard, piece);

    // Increment piece stats
    const updatedPieceCount = {
      ...currentStats.pieceCount,
      [piece.type]: currentStats.pieceCount[piece.type] + 1,
    };

    // Process line clears
    const { newBoard, clearEvent, newCombo, newBackToBack } = processLineClears(
      lockedBoard,
      currentStats.level,
      currentStats.combo,
      currentStats.backToBack,
      tSpinResult
    );

    const isLineCleared = Boolean(clearEvent && clearEvent.count > 0);

    // Update banners and sounds
    if (clearEvent) {
      if (clearEvent.isPerfectClear) {
        sound.playLineClear(4);
        showBanner('PERFECT CLEAR!!', `+${clearEvent.scoreGained}`);
      } else if (clearEvent.isTetris) {
        sound.playLineClear(4);
        showBanner(clearEvent.isBackToBack ? 'B2B TETRIS!' : 'TETRIS!', `+${clearEvent.scoreGained}`);
      } else if (clearEvent.isTSpin) {
        sound.playLineClear(3);
        const name = clearEvent.count === 3 ? 'T-SPIN TRIPLE!' : clearEvent.count === 2 ? 'T-SPIN DOUBLE!' : 'T-SPIN SINGLE!';
        showBanner(clearEvent.isBackToBack ? `B2B ${name}` : name, `+${clearEvent.scoreGained}`);
      } else if (clearEvent.isTSpinMini) {
        sound.playLineClear(2);
        showBanner('T-SPIN MINI!', `+${clearEvent.scoreGained}`);
      } else if (clearEvent.count > 0) {
        sound.playLineClear(clearEvent.count);
        if (newCombo >= 2) {
          showBanner(`${newCombo} COMBO!`, `+${clearEvent.scoreGained}`);
        }
      }
    }

    const newLines = currentStats.lines + (clearEvent ? clearEvent.count : 0);
    const newLevel = Math.floor(newLines / 10) + 1;
    if (newLevel > currentStats.level) {
      sound.playLevelUp();
      showBanner(`LEVEL UP! LV ${newLevel}`);
    }

    const newScore = currentStats.score + (clearEvent ? clearEvent.scoreGained : 0);
    const newHighScore = Math.max(newScore, currentStats.highScore);
    if (newHighScore > currentStats.highScore) {
      try {
        localStorage.setItem(STORAGE_HIGH_SCORE_KEY, newHighScore.toString());
      } catch {
        // Storage unavailable
      }
    }

    setStats((prev) => ({
      ...prev,
      score: newScore,
      highScore: newHighScore,
      lines: newLines,
      level: newLevel,
      combo: newCombo,
      backToBack: newBackToBack,
      tetrisCount: prev.tetrisCount + (clearEvent?.isTetris ? 1 : 0),
      tSpinCount: prev.tSpinCount + (clearEvent?.isTSpin ? 1 : 0),
      pieceCount: updatedPieceCount,
    }));

    // If lines cleared, trigger brief flash animation before dropping next piece
    if (isLineCleared && clearEvent && clearEvent.rows.length > 0) {
      isClearingLinesRef.current = true;
      boardRef.current = lockedBoard;
      setBoard(lockedBoard);
      setClearingRows(clearEvent.rows);

      if (lineClearTimeoutRef.current !== null) {
        window.clearTimeout(lineClearTimeoutRef.current);
      }

      lineClearTimeoutRef.current = window.setTimeout(() => {
        lineClearTimeoutRef.current = null;
        isClearingLinesRef.current = false;
        setClearingRows([]);
        boardRef.current = newBoard;
        setBoard(newBoard);
        spawnNextPiece(newBoard);
      }, 160);
    } else {
      boardRef.current = newBoard;
      setBoard(newBoard);
      spawnNextPiece(newBoard);
    }
  }, [cancelLockTimer, showBanner, spawnNextPiece]);

  // Reset lock timer when piece moves or rotates
  const handlePieceStateChange = useCallback((newPiece: ActivePiece, wasRotation = false, kickIndex = 0) => {
    setActivePiece(newPiece);
    activePieceRef.current = newPiece;
    lastActionWasRotationRef.current = wasRotation;
    lastKickIndexRef.current = kickIndex;

    const grounded = isGrounded(newPiece, boardRef.current);
    if (grounded) {
      if (lockResetCountRef.current < MAX_LOCK_RESETS) {
        lockResetCountRef.current++;
        cancelLockTimer();
        lockTimerRef.current = window.setTimeout(() => {
          if (activePieceRef.current && statusRef.current === 'PLAYING') {
            commitLockPiece(activePieceRef.current);
          }
        }, LOCK_DELAY_MS);
      }
    } else {
      cancelLockTimer();
    }
  }, [cancelLockTimer, commitLockPiece, isGrounded]);

  // --- Controls ---
  const moveLeft = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const piece = activePieceRef.current;
    if (!checkCollision(boardRef.current, piece.shape, { x: piece.x - 1, y: piece.y })) {
      sound.playMove();
      handlePieceStateChange({ ...piece, x: piece.x - 1 }, false);
    }
  }, [handlePieceStateChange]);

  const moveRight = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const piece = activePieceRef.current;
    if (!checkCollision(boardRef.current, piece.shape, { x: piece.x + 1, y: piece.y })) {
      sound.playMove();
      handlePieceStateChange({ ...piece, x: piece.x + 1 }, false);
    }
  }, [handlePieceStateChange]);

  const rotateClockwise = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const result = tryRotate(boardRef.current, activePieceRef.current, 'CW');
    if (result) {
      sound.playRotate();
      handlePieceStateChange(result.piece, true, result.kickIndex);
    }
  }, [handlePieceStateChange]);

  const rotateCounterClockwise = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const result = tryRotate(boardRef.current, activePieceRef.current, 'CCW');
    if (result) {
      sound.playRotate();
      handlePieceStateChange(result.piece, true, result.kickIndex);
    }
  }, [handlePieceStateChange]);

  const softDrop = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const piece = activePieceRef.current;

    if (!checkCollision(boardRef.current, piece.shape, { x: piece.x, y: piece.y + 1 })) {
      sound.playMove();
      handlePieceStateChange({ ...piece, y: piece.y + 1 }, false);
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
    } else {
      // Force lock if already grounded and soft-dropping again
      if (lockTimerRef.current === null) {
        lockTimerRef.current = window.setTimeout(() => {
          if (activePieceRef.current && statusRef.current === 'PLAYING') {
            commitLockPiece(activePieceRef.current);
          }
        }, 100);
      }
    }
  }, [commitLockPiece, handlePieceStateChange]);

  const hardDrop = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !activePieceRef.current || isClearingLinesRef.current) return;
    const piece = activePieceRef.current;
    const targetY = getGhostPieceY(boardRef.current, piece);
    const dropDistance = targetY - piece.y;

    sound.playHardDrop();
    setShake(true);
    setTimeout(() => setShake(false), 150);

    const droppedPiece = { ...piece, y: targetY };
    setActivePiece(droppedPiece);
    activePieceRef.current = droppedPiece;

    setStats((prev) => ({
      ...prev,
      score: prev.score + dropDistance * 2,
    }));

    commitLockPiece(droppedPiece);
  }, [commitLockPiece]);

  const hold = useCallback(() => {
    if (
      statusRef.current !== 'PLAYING' ||
      !activePieceRef.current ||
      !canHoldRef.current ||
      isClearingLinesRef.current
    ) {
      return;
    }

    sound.playHold();
    cancelLockTimer();

    const currentPieceType = activePieceRef.current.type;
    const previousHold = holdPieceRef.current;

    setHoldPiece(currentPieceType);
    setCanHold(false);
    lockResetCountRef.current = 0;
    lastActionWasRotationRef.current = false;
    lastKickIndexRef.current = 0;

    if (previousHold) {
      const swappedPiece = spawnPiece(previousHold);
      setActivePiece(swappedPiece);
      activePieceRef.current = swappedPiece;
    } else {
      const nextType = getNextFromBag();
      const newPiece = spawnPiece(nextType);
      setActivePiece(newPiece);
      activePieceRef.current = newPiece;
    }
    lastDropTimeRef.current = performance.now();
  }, [cancelLockTimer, getNextFromBag]);

  // Start new game
  const startGame = useCallback(() => {
    cancelLockTimer();
    if (lineClearTimeoutRef.current !== null) {
      window.clearTimeout(lineClearTimeoutRef.current);
      lineClearTimeoutRef.current = null;
    }
    isClearingLinesRef.current = false;

    const newBoard = createEmptyBoard();
    boardRef.current = newBoard;
    setBoard(newBoard);
    bagRef.current = generateBag();

    const firstPieceType = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 5)]);

    const piece = spawnPiece(firstPieceType);
    setActivePiece(piece);
    activePieceRef.current = piece;
    setHoldPiece(null);
    setCanHold(true);
    setClearingRows([]);
    setRecentBanner(null);

    let savedHighScore = 0;
    try {
      savedHighScore = parseInt(localStorage.getItem(STORAGE_HIGH_SCORE_KEY) || '0', 10) || 0;
    } catch {
      // LocalStorage fallback
    }

    setStats({
      score: 0,
      highScore: savedHighScore,
      level: 1,
      lines: 0,
      combo: -1,
      backToBack: false,
      tetrisCount: 0,
      tSpinCount: 0,
      pieceCount: {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      },
    });

    setStatus('PLAYING');
    sound.startBgm();
    lastDropTimeRef.current = performance.now();
  }, [cancelLockTimer]);

  const pauseGame = useCallback(() => {
    if (statusRef.current === 'PLAYING') {
      setStatus('PAUSED');
      cancelLockTimer();
      sound.stopBgm();
    }
  }, [cancelLockTimer]);

  const resumeGame = useCallback(() => {
    if (statusRef.current === 'PAUSED') {
      setStatus('PLAYING');
      sound.startBgm();
      lastDropTimeRef.current = performance.now();
    }
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // --- Main Gravity & Animation Loop ---
  useEffect(() => {
    if (status !== 'PLAYING') {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }

    const loop = (timestamp: number) => {
      // Pause gravity updates while line clearing animation is executing
      if (isClearingLinesRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const curPiece = activePieceRef.current;
      const curBoard = boardRef.current;
      const curLevel = statsRef.current.level;
      const gravityInterval = getGravityMs(curLevel);

      if (curPiece) {
        const grounded = isGrounded(curPiece, curBoard);

        if (!grounded) {
          // If piece fell off a ledge, cancel any pending lock timer
          cancelLockTimer();

          if (timestamp - lastDropTimeRef.current >= gravityInterval) {
            lastDropTimeRef.current = timestamp;
            const nextY = curPiece.y + 1;
            if (!checkCollision(curBoard, curPiece.shape, { x: curPiece.x, y: nextY })) {
              const updatedPiece = { ...curPiece, y: nextY };
              activePieceRef.current = updatedPiece;
              setActivePiece(updatedPiece);
              lastActionWasRotationRef.current = false;
            }
          }
        } else {
          // If grounded and lock timer not started yet, initiate lock delay
          if (lockTimerRef.current === null) {
            lockTimerRef.current = window.setTimeout(() => {
              if (activePieceRef.current && statusRef.current === 'PLAYING') {
                commitLockPiece(activePieceRef.current);
              }
            }, LOCK_DELAY_MS);
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [cancelLockTimer, commitLockPiece, isGrounded, status]);

  return {
    board,
    activePiece,
    ghostY,
    holdPiece,
    canHold,
    nextQueue,
    status,
    stats,
    recentBanner,
    clearingRows,
    shake,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    moveLeft,
    moveRight,
    rotateClockwise,
    rotateCounterClockwise,
    softDrop,
    hardDrop,
    hold,
  };
}
