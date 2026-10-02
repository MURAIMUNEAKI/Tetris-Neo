import React, { useMemo } from 'react';
import { ActivePiece, BoardMatrix, CellValue } from '../types/tetris';
import { BUFFER_ROWS, TETROMINO_COLORS } from '../utils/tetrisConstants';

interface TetrisBoardProps {
  board: BoardMatrix;
  activePiece: ActivePiece | null;
  ghostY: number | null;
  showGhost?: boolean;
  clearingRows: number[];
  recentBanner: { text: string; subtext?: string; id: number } | null;
  shake?: boolean;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  board,
  activePiece,
  ghostY,
  showGhost = true,
  clearingRows,
  recentBanner,
  shake = false,
}) => {
  // Visible board is from row BUFFER_ROWS (2) to 21
  const visibleRows = 20;
  const visibleCols = 10;

  // Build the rendered grid map for quick lookups
  const renderedCells = useMemo(() => {
    // Start with board state (rows 2 to 21)
    const grid: Array<Array<{
      colorType: CellValue;
      isGhost: boolean;
      isActive: boolean;
      isClearing: boolean;
    }>> = [];

    for (let r = BUFFER_ROWS; r < BUFFER_ROWS + visibleRows; r++) {
      const rowArr = [];
      const isClearing = clearingRows.includes(r);

      for (let c = 0; c < visibleCols; c++) {
        rowArr.push({
          colorType: board[r][c],
          isGhost: false,
          isActive: false,
          isClearing,
        });
      }
      grid.push(rowArr);
    }

    // Overlay Ghost Piece
    if (showGhost && activePiece && ghostY !== null && ghostY !== activePiece.y) {
      for (let pr = 0; pr < activePiece.shape.length; pr++) {
        for (let pc = 0; pc < activePiece.shape[pr].length; pc++) {
          if (activePiece.shape[pr][pc] !== 0) {
            const boardY = ghostY + pr;
            const boardX = activePiece.x + pc;
            const displayY = boardY - BUFFER_ROWS;

            if (displayY >= 0 && displayY < visibleRows && boardX >= 0 && boardX < visibleCols) {
              if (!grid[displayY][boardX].colorType) {
                grid[displayY][boardX] = {
                  colorType: activePiece.type,
                  isGhost: true,
                  isActive: false,
                  isClearing: false,
                };
              }
            }
          }
        }
      }
    }

    // Overlay Active Piece
    if (activePiece) {
      for (let pr = 0; pr < activePiece.shape.length; pr++) {
        for (let pc = 0; pc < activePiece.shape[pr].length; pc++) {
          if (activePiece.shape[pr][pc] !== 0) {
            const boardY = activePiece.y + pr;
            const boardX = activePiece.x + pc;
            const displayY = boardY - BUFFER_ROWS;

            if (displayY >= 0 && displayY < visibleRows && boardX >= 0 && boardX < visibleCols) {
              grid[displayY][boardX] = {
                colorType: activePiece.type,
                isGhost: false,
                isActive: true,
                isClearing: false,
              };
            }
          }
        }
      }
    }

    return grid;
  }, [board, activePiece, ghostY, showGhost, clearingRows]);

  const cellDimensionStyle: React.CSSProperties = {
    width: 'clamp(14px, 2.55vh, 23px)',
    height: 'clamp(14px, 2.55vh, 23px)',
  };

  return (
    <div className={`relative select-none transition-transform duration-75 ${shake ? 'translate-y-0.5' : ''}`}>
      {/* Outer arcade frame with metallic/carbon borders */}
      <div className="relative p-1.5 sm:p-2 bg-slate-900/90 rounded-xl sm:rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
        {/* Subtle grid backdrop container */}
        <div className="relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
          {/* Background grid canvas matrix */}
          <div
            className="grid gap-[1px] bg-slate-900/70 p-[1px]"
            style={{
              gridTemplateColumns: `repeat(${visibleCols}, minmax(0, 1fr))`,
            }}
          >
            {renderedCells.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const colorConfig = cell.colorType ? TETROMINO_COLORS[cell.colorType] : null;

                if (cell.isClearing) {
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={cellDimensionStyle}
                      className="bg-white shadow-[0_0_12px_#ffffff] animate-pulse rounded-xs"
                    />
                  );
                }

                if (cell.isActive && colorConfig) {
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        ...cellDimensionStyle,
                        backgroundColor: colorConfig.primary,
                        boxShadow: `inset 1.5px 1.5px 0px ${colorConfig.light}, inset -1.5px -1.5px 0px ${colorConfig.dark}, 0 0 6px ${colorConfig.glow}`,
                        border: `1px solid ${colorConfig.border}`,
                      }}
                      className="rounded-xs transition-colors"
                    />
                  );
                }

                if (cell.isGhost && colorConfig) {
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        ...cellDimensionStyle,
                        borderColor: colorConfig.light,
                        backgroundColor: `${colorConfig.primary}18`,
                        boxShadow: `0 0 4px ${colorConfig.glow}`,
                      }}
                      className="rounded-xs border border-dashed transition-all"
                    />
                  );
                }

                if (cell.colorType && colorConfig) {
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        ...cellDimensionStyle,
                        backgroundColor: colorConfig.primary,
                        boxShadow: `inset 1.5px 1.5px 0px ${colorConfig.light}, inset -1.5px -1.5px 0px ${colorConfig.dark}`,
                        border: `1px solid ${colorConfig.border}`,
                      }}
                      className="rounded-xs transition-colors"
                    />
                  );
                }

                // Empty cell
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={cellDimensionStyle}
                    className="bg-slate-950/90 rounded-xs border border-slate-900/60"
                  />
                );
              })
            )}
          </div>

          {/* Floating Action Banner Notification - Pure text only, no background box */}
          {recentBanner && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 select-none">
              <div
                key={recentBanner.id}
                className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center pointer-events-none text-center"
              >
                <span className="text-base sm:text-xl font-black tracking-widest text-amber-300 font-['Chakra_Petch'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]">
                  {recentBanner.text}
                </span>
                {recentBanner.subtext && (
                  <span className="text-[11px] sm:text-xs font-bold font-mono text-emerald-300 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                    {recentBanner.subtext}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
