import React from 'react';
import { Volume2, VolumeX, Music, Eye, X, Keyboard } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showGhost,
  onToggleGhost,
  isMuted,
  onToggleMute,
  isBgmActive,
  onToggleBgm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 font-['Chakra_Petch'] tracking-wide">
            設定・操作方法 (Settings & Controls)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-3.5">
          {/* Audio Master Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
              <div>
                <div className="text-sm font-semibold text-slate-200">マスター消音 (Mute)</div>
                <div className="text-xs text-slate-500">すべての効果音・BGMを消音</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? '消音中 (MUTED)' : '有効 (ACTIVE)'}
            </button>
          </div>

          {/* BGM Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm font-semibold text-slate-200">8-bit BGM (コロブチカ)</div>
                <div className="text-xs text-slate-500">懐かしのチップチューンテーマ曲</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleBgm}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isBgmActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {isBgmActive ? '再生中 (ON)' : '停止中 (OFF)'}
            </button>
          </div>

          {/* Ghost Piece Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-sm font-semibold text-slate-200">ゴースト表示 (Ghost Piece)</div>
                <div className="text-xs text-slate-500">落下予測位置のシルエット表示</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleGhost}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                showGhost
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {showGhost ? '表示 (ON)' : '非表示 (OFF)'}
            </button>
          </div>
        </div>

        {/* Keyboard Controls Guide */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 font-['Chakra_Petch'] mb-2.5">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>キーボード操作 (Keyboard Controls)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">移動 (Move)</span>
              <span className="text-slate-200 font-bold">← / →</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">高速落下 (Soft)</span>
              <span className="text-slate-200 font-bold">↓</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">即時落下 (Hard)</span>
              <span className="text-slate-200 font-bold">Space</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">右回転 (Rotate CW)</span>
              <span className="text-slate-200 font-bold">↑ / X</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">左回転 (Rotate CCW)</span>
              <span className="text-slate-200 font-bold">Z</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">ホールド (Hold)</span>
              <span className="text-slate-200 font-bold">C / Shift</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">一時停止 (Pause)</span>
              <span className="text-slate-200 font-bold">Esc / P</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-slate-400">リスタート (Reset)</span>
              <span className="text-slate-200 font-bold">R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
