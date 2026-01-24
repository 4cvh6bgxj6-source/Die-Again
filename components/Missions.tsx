
import React from 'react';
import { Language, Mission } from '../types';
import { t } from '../i18n';

interface MissionsProps {
  missions: Mission[];
  onClaim: (missionId: string) => void;
  onClose: () => void;
  lang: Language;
}

const Missions: React.FC<MissionsProps> = ({ missions, onClaim, onClose, lang }) => {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4">
      <div className="bg-zinc-900 border-4 border-white p-8 rounded-lg w-full max-w-2xl pixel-shadow flex flex-col gap-6">
        <h2 className="text-3xl text-white uppercase tracking-tighter font-black text-center">{t('missionsTitle', lang)}</h2>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {missions.map((m) => {
            const isReady = m.current >= m.target && !m.completed;
            return (
              <div key={m.id} className={`p-4 border-2 flex justify-between items-center ${m.completed ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-600 bg-zinc-800'}`}>
                <div className="flex flex-col gap-1">
                  <div className={`text-[10px] font-bold ${m.completed ? 'text-zinc-600 line-through' : 'text-white'}`}>{m.description}</div>
                  <div className="text-[8px] text-zinc-400">Progresso: {Math.min(m.current, m.target)} / {m.target}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-yellow-400 text-[10px] font-black">{m.reward} 💎</div>
                  {m.completed ? (
                    <div className="text-green-500 text-[8px] font-bold uppercase">{t('completed', lang)}</div>
                  ) : (
                    <button
                      onClick={() => onClaim(m.id)}
                      disabled={!isReady}
                      className={`px-4 py-2 text-[8px] font-bold uppercase border-b-4 transition-all ${isReady ? 'bg-yellow-600 border-yellow-900 text-white active:scale-95' : 'bg-zinc-700 border-zinc-900 text-zinc-500 cursor-not-allowed'}`}
                    >
                      {t('claim', lang)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="bg-white text-black py-4 font-black hover:bg-zinc-200 transition-all active:scale-95 uppercase text-xs"
        >
          {t('close', lang)}
        </button>
      </div>
    </div>
  );
};

export default Missions;
