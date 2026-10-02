import React from 'react';
import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface HoldBoxProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
}

export const HoldBox: React.FC<HoldBoxProps> = ({ holdPiece, canHold }) => {
  return (
    <div className="bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800 shadow-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1">
        <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 font-['Chakra_Petch']">
          HOLD (C / Shift)
        </span>
        <span className="text-[9px] text-slate-500 font-mono">
          {canHold ? 'READY' : 'LOCKED'}
        </span>
      </div>

      <div className="h-10 sm:h-12 flex items-center justify-center">
        <PiecePreview type={holdPiece} dimmed={!canHold} size="md" />
      </div>
    </div>
  );
};
