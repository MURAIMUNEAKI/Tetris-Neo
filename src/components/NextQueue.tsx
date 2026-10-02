import React from 'react';
import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface NextQueueProps {
  queue: TetrominoType[];
}

export const NextQueue: React.FC<NextQueueProps> = ({ queue }) => {
  // Show 3 upcoming pieces compactly
  const displayPieces = queue.slice(0, 3);

  return (
    <div className="bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800 shadow-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
        <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 font-['Chakra_Petch']">
          NEXT
        </span>
        <span className="text-[9px] text-slate-500 font-mono">
          QUEUE
        </span>
      </div>

      <div className="flex flex-col gap-1 sm:gap-1.5 items-center w-full">
        {displayPieces.map((piece, index) => (
          <div
            key={index}
            className={`flex items-center justify-center p-0.5 rounded-lg w-full ${
              index === 0 ? 'bg-slate-800/40 border border-slate-700/40' : 'opacity-80'
            }`}
          >
            <PiecePreview type={piece} size={index === 0 ? 'md' : 'sm'} />
          </div>
        ))}
      </div>
    </div>
  );
};
