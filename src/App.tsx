import React, { useEffect, useState } from 'react';
import {
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Pause,
} from 'lucide-react';
import { GameOverModal } from './components/GameOverModal';
import { HoldBox } from './components/HoldBox';
import { NextQueue } from './components/NextQueue';
import { PauseModal } from './components/PauseModal';
import { ScorePanel } from './components/ScorePanel';
import { SettingsModal } from './components/SettingsModal';
import { TetrisBoard } from './components/TetrisBoard';
import { TouchControls } from './components/TouchControls';
import { useTetris } from './hooks/useTetris';
import { sound } from './utils/audio';

export default function App() {
  const {
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
  } = useTetris();

  const [showGhost, setShowGhost] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Sync mute state
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMute(nextMute);
  };

  const handleToggleBgm = () => {
    const active = sound.toggleBgm();
    setIsBgmActive(active);
  };

  const handleToggleGhost = () => {
    setShowGhost((prev) => !prev);
  };

  // Keyboard navigation & controls with prevention of default page scrolls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        if (status === 'PLAYING') {
          pauseGame();
        } else if (status === 'PAUSED') {
          resumeGame();
        }
        return;
      }

      if (status !== 'PLAYING') {
        if ((e.key === 'Enter' || e.key === ' ') && status === 'IDLE') {
          e.preventDefault();
          startGame();
          setIsBgmActive(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'x':
        case 'X':
          e.preventDefault();
          rotateClockwise();
          break;
        case 'z':
        case 'Z':
        case 'Control':
          e.preventDefault();
          rotateCounterClockwise();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          hold();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          restartGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hardDrop,
    hold,
    moveLeft,
    moveRight,
    pauseGame,
    restartGame,
    resumeGame,
    rotateClockwise,
    rotateCounterClockwise,
    softDrop,
    startGame,
    status,
  ]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      {/* Top Bar Contract: Brand title — Nav links — Primary actions */}
      <header className="h-11 sm:h-12 px-3 sm:px-6 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-black tracking-wider text-slate-100 font-['Chakra_Petch']">
            TETRIS NEO
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            テトリス
          </span>
        </div>

        {/* Zone 2: Clean text links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="hover:text-slate-100 transition-colors cursor-pointer"
          >
            遊び方 (Rules)
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="hover:text-slate-100 transition-colors cursor-pointer"
          >
            設定 (Settings)
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? '消音解除' : '消音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Settings"
            title="設定"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {status === 'PLAYING' ? (
            <button
              type="button"
              onClick={pauseGame}
              className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>一時停止</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                startGame();
                setIsBgmActive(true);
              }}
              className="px-3 py-1 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg flex items-center gap-1 transition-all shadow-md shadow-cyan-900/30 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{status === 'IDLE' ? 'スタート' : 'リトライ'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Game Stage - Constrained to 100% of remaining vertical height */}
      <main className="flex-1 flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden min-h-0 w-full max-w-5xl mx-auto">
        {status === 'IDLE' ? (
          /* Title Screen / Intro */
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 text-center shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1.5">
              <span>CLASSIC PUZZLE</span>
              <span aria-hidden="true">·</span>
              <span>SRS GUIDELINE</span>
              <span aria-hidden="true">·</span>
              <span>7-BAG</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 font-['Chakra_Petch'] tracking-wider mb-1.5">
              TETRIS NEO
            </h1>
            <p className="text-xs text-slate-400 mb-4">
              SRS回転・ホールド・ゴースト表示・8-bitチップチューンBGMを搭載した本格テトリス。
            </p>

            {stats.highScore > 0 && (
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 mb-4 inline-flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div className="text-left font-mono">
                  <div className="text-[9px] text-slate-500">CURRENT HIGH SCORE</div>
                  <div className="text-base font-bold text-amber-300 tabular-nums">
                    {stats.highScore.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  startGame();
                  setIsBgmActive(true);
                }}
                className="w-full py-3 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ゲーム開始 (START GAME)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>操作説明・ルールを見る</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Playing Canvas & Grid */
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Desktop & Tablet 3-Column Layout */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Left Column: HOLD & SCORE (on desktop) */}
              <div className="hidden sm:flex flex-col gap-2 w-28 md:w-32 lg:w-36 shrink-0">
                <HoldBox holdPiece={holdPiece} canHold={canHold} />
                <ScorePanel stats={stats} />
              </div>

              {/* Center Column: Mobile Header + Main Matrix */}
              <div className="flex flex-col items-center">
                {/* Mobile Compact Status Header */}
                <div className="flex sm:hidden items-center justify-between w-full px-2 py-0.5 mb-1 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">SCORE:</span>
                    <span className="text-amber-300 font-bold tabular-nums">{stats.score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-slate-500">LV:</span>{' '}
                      <span className="text-cyan-400 font-bold">{stats.level}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">LINES:</span>{' '}
                      <span className="text-emerald-400 font-bold">{stats.lines}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Hold/Next compact inline strip */}
                <div className="flex sm:hidden items-center justify-between w-full max-w-[260px] mb-1 px-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400">HOLD</span>
                    <div className="scale-70 origin-left">
                      <HoldBox holdPiece={holdPiece} canHold={canHold} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400">NEXT</span>
                    <div className="scale-70 origin-right">
                      <NextQueue queue={nextQueue.slice(0, 1)} />
                    </div>
                  </div>
                </div>

                {/* 10x20 Matrix Board */}
                <TetrisBoard
                  board={board}
                  activePiece={activePiece}
                  ghostY={ghostY}
                  showGhost={showGhost}
                  clearingRows={clearingRows}
                  recentBanner={recentBanner}
                  shake={shake}
                />
              </div>

              {/* Right Column: NEXT QUEUE & CONTROLS */}
              <div className="hidden sm:flex flex-col gap-2 w-28 md:w-32 lg:w-36 shrink-0">
                <NextQueue queue={nextQueue} />

                {/* Quick Restart Action */}
                <button
                  type="button"
                  onClick={restartGame}
                  className="w-full py-1.5 px-2 bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>リセット (R)</span>
                </button>
              </div>
            </div>

            {/* Mobile Touch Controller (Visible on touch/small viewports) */}
            <div className="w-full mt-1 block sm:hidden shrink-0">
              <TouchControls
                onMoveLeft={moveLeft}
                onMoveRight={moveRight}
                onRotateCW={rotateClockwise}
                onRotateCCW={rotateCounterClockwise}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
                onHold={hold}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {status === 'PAUSED' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={restartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {status === 'GAME_OVER' && (
        <GameOverModal stats={stats} onRestart={restartGame} />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        showGhost={showGhost}
        onToggleGhost={handleToggleGhost}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isBgmActive={isBgmActive}
        onToggleBgm={handleToggleBgm}
      />

      {/* Rules & Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] mb-2.5">
              ルールとテクニック (Rules)
            </h3>
            <div className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                <strong>・ライン消去とレベルアップ:</strong> 10本のラインを消去するごとにレベルが1上昇し落下速度が加速します。
              </p>
              <p>
                <strong>・T-Spin (Tスピン):</strong> Tミノを回転させて隙間に滑り込ませると高得点ボーナスを獲得できます。
              </p>
              <p>
                <strong>・Back-to-Back (B2B):</strong> テトリスやTスピンを連続で達成するとスコアが1.5倍になります。
              </p>
              <p>
                <strong>・ホールド (C / Shift):</strong> 現在のミノを1つまで保留できます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Slim Quiet Footer */}
      <footer className="py-1 px-3 border-t border-slate-900 text-center text-[10px] text-slate-500 shrink-0 font-mono">
        <span>TETRIS NEO</span>
        <span aria-hidden="true" className="mx-1.5">·</span>
        <span>Keyboard & Touch</span>
        <span aria-hidden="true" className="mx-1.5">·</span>
        <span>SRS Rules</span>
      </footer>
    </div>
  );
}
