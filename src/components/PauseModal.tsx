import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        <h2 className="text-2xl font-black text-slate-100 font-['Chakra_Petch'] tracking-widest mb-1">
          PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          ゲーム一時停止中
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>再開する (Resume)</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>最初からやり直す (Restart)</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'ミュート解除 (Unmute)' : '消音 (Mute)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
