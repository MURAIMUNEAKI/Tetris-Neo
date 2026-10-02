import React from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { GameStats } from '../types/tetris';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart }) => {
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center">
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW HIGH SCORE!!</span>
          </div>
        )}

        <h2 className="text-3xl font-black text-rose-500 font-['Chakra_Petch'] tracking-widest mb-1">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          ゲームオーバー
        </p>

        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3 mb-6">
          <div>
            <span className="text-[11px] text-slate-400 font-mono tracking-wider block">
              FINAL SCORE
            </span>
            <div className="text-3xl font-black font-mono tabular-nums text-amber-300">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">LEVEL</span>
              <span className="text-base font-bold text-cyan-400">{stats.level}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">LINES</span>
              <span className="text-base font-bold text-emerald-400">{stats.lines}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">TETRIS</span>
              <span className="text-base font-bold text-purple-400">{stats.tetrisCount}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>もう一度プレイ (Play Again)</span>
        </button>
      </div>
    </div>
  );
};
