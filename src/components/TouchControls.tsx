import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  RotateCcw,
  RotateCw,
  Repeat,
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotateCW,
  onRotateCCW,
  onSoftDrop,
  onHardDrop,
  onHold,
}) => {
  const repeatTimerRef = useRef<number | null>(null);

  const startRepeating = (action: () => void, interval = 90) => {
    action();
    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    repeatTimerRef.current = window.setInterval(action, interval);
  };

  const stopRepeating = () => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-2 gap-2 px-2 py-1 select-none touch-manipulation">
      {/* Direction Pad (Left, Right, Soft Drop, Hard Drop) */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Hard Drop Button */}
        <button
          type="button"
          onClick={onHardDrop}
          className="w-11 h-9 flex items-center justify-center gap-1 bg-cyan-600/30 active:bg-cyan-500/50 border border-cyan-500/50 rounded-lg text-cyan-300 shadow-sm transition-transform active:scale-95 cursor-pointer"
          aria-label="Hard Drop"
        >
          <ChevronsDown className="w-4 h-4" />
          <span className="text-[9px] font-bold tracking-tight">HARD</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Left Button */}
          <button
            type="button"
            onPointerDown={() => startRepeating(onMoveLeft, 110)}
            onPointerUp={stopRepeating}
            onPointerLeave={stopRepeating}
            className="w-11 h-11 flex items-center justify-center bg-slate-800/90 active:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Soft Drop Button */}
          <button
            type="button"
            onPointerDown={() => startRepeating(onSoftDrop, 65)}
            onPointerUp={stopRepeating}
            onPointerLeave={stopRepeating}
            className="w-11 h-11 flex flex-col items-center justify-center bg-slate-800/90 active:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Soft Drop"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-[8px] font-bold text-slate-400">SOFT</span>
          </button>

          {/* Right Button */}
          <button
            type="button"
            onPointerDown={() => startRepeating(onMoveRight, 110)}
            onPointerUp={stopRepeating}
            onPointerLeave={stopRepeating}
            className="w-11 h-11 flex items-center justify-center bg-slate-800/90 active:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons (Hold, Rotate CCW, Rotate CW) */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Hold Button */}
        <button
          type="button"
          onClick={onHold}
          className="w-11 h-9 flex items-center justify-center gap-1 bg-amber-600/30 active:bg-amber-500/50 border border-amber-500/50 rounded-lg text-amber-300 shadow-sm transition-transform active:scale-95 cursor-pointer"
          aria-label="Hold Piece"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold tracking-tight">HOLD</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Rotate CCW */}
          <button
            type="button"
            onClick={onRotateCCW}
            className="w-11 h-11 flex flex-col items-center justify-center bg-slate-800/90 active:bg-slate-700 border border-slate-700 rounded-lg text-indigo-300 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Rotate Counter-Clockwise"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[7px] font-bold text-slate-400">CCW</span>
          </button>

          {/* Rotate CW */}
          <button
            type="button"
            onClick={onRotateCW}
            className="w-11 h-11 flex flex-col items-center justify-center bg-indigo-600/40 active:bg-indigo-500/60 border border-indigo-500/60 rounded-lg text-indigo-200 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Rotate Clockwise"
          >
            <RotateCw className="w-4 h-4 text-indigo-300" />
            <span className="text-[7px] font-bold text-indigo-300">CW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
