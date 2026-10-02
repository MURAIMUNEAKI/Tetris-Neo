import React from 'react';
import { GameStats, TetrominoType } from '../types/tetris';
import { TETROMINO_COLORS } from '../utils/tetrisConstants';

interface ScorePanelProps {
  stats: GameStats;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ stats }) => {
  const pieces: TetrominoType[] = ['T', 'J', 'Z', 'O', 'S', 'L', 'I'];

  return (
    <div className="flex flex-col gap-2">
      {/* Primary score card */}
      <div className="bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800 shadow-md space-y-1.5">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 font-['Chakra_Petch'] tracking-wider block">
            SCORE
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-amber-300 tracking-tight leading-tight">
            {stats.score.toLocaleString()}
          </div>
        </div>

        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 font-['Chakra_Petch'] tracking-wider">
            HIGH
          </span>
          <span className="text-sm font-bold font-mono tabular-nums text-amber-400/80 tracking-tight">
            {stats.highScore.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
          <div>
            <span className="text-[9px] font-semibold text-slate-400 font-['Chakra_Petch'] tracking-wider block">
              LEVEL
            </span>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-cyan-400 leading-tight">
              {stats.level}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-semibold text-slate-400 font-['Chakra_Petch'] tracking-wider block">
              LINES
            </span>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-emerald-400 leading-tight">
              {stats.lines}
            </div>
          </div>
        </div>

        {/* Back-to-Back status */}
        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>B2B</span>
          <span className={stats.backToBack ? 'text-amber-400 font-bold' : 'text-slate-600'}>
            {stats.backToBack ? 'ACTIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Piece Distribution Statistics - Compact micro grid */}
      <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 shadow-md">
        <div className="text-[9px] font-semibold text-slate-400 font-['Chakra_Petch'] tracking-wider mb-1">
          PIECES
        </div>
        <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
          {pieces.map((type) => {
            const count = stats.pieceCount[type] || 0;
            const color = TETROMINO_COLORS[type];
            return (
              <div
                key={type}
                className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/60"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-xs"
                    style={{ backgroundColor: color.primary }}
                  />
                  <span className="text-slate-300 font-bold">{type}</span>
                </div>
                <span className="tabular-nums font-semibold text-slate-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
