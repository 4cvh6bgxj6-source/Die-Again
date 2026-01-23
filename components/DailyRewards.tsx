
import React from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface DailyRewardsProps {
  streak: number;
  onClaim: (amount: number) => void;
  onClose: () => void;
  alreadyClaimed: boolean;
  lang: Language;
}

const DailyRewards: React.FC<DailyRewardsProps> = ({ streak, onClaim, onClose, alreadyClaimed, lang }) => {
  const days = [
    { day: 1, reward: 50 },
    { day: 2, reward: 100 },
    { day: 3, reward: 200 },
    { day: 4, reward: 500 },
    { day: 5, reward: 1000 },
    { day: 6, reward: 2500 },
    { day: 7, reward: 10000 },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-4 border-white p-8 rounded-lg w-full max-w-2xl pixel-shadow">
        <h2 className="text-3xl text-purple-400 mb-8 text-center uppercase tracking-tighter">{t('dailyRewards', lang)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-8">
          {days.map((d, i) => (
            <div 
              key={i} 
              className={`p-4 border-2 rounded flex flex-col items-center justify-center gap-2 ${
                i < streak 
                  ? 'bg-zinc-800 border-green-500 opacity-50' 
                  : i === streak && !alreadyClaimed
                    ? 'bg-zinc-700 border-yellow-400 animate-bounce cursor-pointer'
                    : 'bg-zinc-900 border-zinc-700'
              }`}
              onClick={() => i === streak && !alreadyClaimed && onClaim(d.reward)}
            >
              <span className="text-[10px] text-zinc-500">{t('day', lang)} {d.day}</span>
              <span className="text-sm font-bold text-white">${d.reward}</span>
              {i < streak && <span className="text-green-500 text-xs">✓</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-black py-2 px-8 font-bold hover:bg-zinc-200 uppercase"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
