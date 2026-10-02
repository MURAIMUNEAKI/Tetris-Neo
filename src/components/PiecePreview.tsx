import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TETROMINO_COLORS, TETROMINO_SHAPES } from '../utils/tetrisConstants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  dimmed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  dimmed = false,
  size = 'md',
}) => {
  if (!type) {
    return (
      <div className="w-12 h-9 flex items-center justify-center text-slate-600 text-[10px] font-mono">
        EMPTY
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type][0];
  const color = TETROMINO_COLORS[type];

  const cellSize =
    size === 'sm'
      ? 'w-2.5 h-2.5 sm:w-3 sm:h-3'
      : size === 'lg'
      ? 'w-4 h-4 sm:w-5 sm:h-5'
      : 'w-3 h-3 sm:w-3.5 sm:h-3.5';

  return (
    <div
      className={`inline-grid gap-0.5 p-0.5 transition-opacity ${
        dimmed ? 'opacity-35 grayscale' : 'opacity-100'
      }`}
      style={{
        gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))`,
      }}
    >
      {shape.map((row, rIdx) =>
        row.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`${cellSize} rounded-xs flex items-center justify-center transition-all ${
              cell
                ? 'shadow-xs border'
                : 'bg-transparent border-transparent'
            }`}
            style={{
              backgroundColor: cell ? color.primary : 'transparent',
              borderColor: cell ? color.border : 'transparent',
              boxShadow: cell ? `inset 1px 1px 0px ${color.light}, inset -1px -1px 0px ${color.dark}` : 'none',
            }}
          />
        ))
      )}
    </div>
  );
};
