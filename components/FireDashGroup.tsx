
import React from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface FireDashGroupProps {
  onClose: () => void;
  onGoToIdea: () => void;
  lang: Language;
}

const FireDashGroup: React.FC<FireDashGroupProps> = ({ onClose, onGoToIdea, lang }) => {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[80] p-4">
      <div className="bg-zinc-900 border-4 border-orange-600 p-8 rounded-lg w-full max-w-2xl pixel-shadow flex flex-col gap-8 text-center animate-in zoom-in duration-300">
        <h2 className="text-3xl md:text-5xl text-orange-600 uppercase tracking-tighter font-black italic">
          {t('fireDashGroup', lang)}
        </h2>
        
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl text-white font-bold uppercase underline decoration-orange-600 underline-offset-8">
            {t('whoAreWe', lang)}
          </h3>
          
          <p className="text-zinc-300 text-sm md:text-lg leading-relaxed font-bold uppercase tracking-wide italic">
            "{t('fireDashDesc', lang)}"
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-6">
          <button
            onClick={onGoToIdea}
            className="w-full bg-white text-orange-600 py-6 font-black hover:bg-orange-600 hover:text-white transition-all active:scale-95 uppercase text-xs border-4 border-orange-600 shadow-[0_6px_0_rgba(234,88,12,0.4)]"
          >
            {t('tellUsIdea', lang)} 💡
          </button>
          
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white uppercase text-[10px] font-bold tracking-[0.2em]"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FireDashGroup;
