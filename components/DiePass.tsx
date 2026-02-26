
import React from 'react';
import { UserStats, PassReward, Language } from '../types';
import { DIE_PASS_REWARDS, SKINS } from '../constants';
import { t } from '../i18n';

interface DiePassProps {
  stats: UserStats;
  onClaim: (level: number, type: 'free' | 'plus') => void;
  onBuyPlus: () => void;
  onClose: () => void;
  lang: Language;
}

const DiePass: React.FC<DiePassProps> = ({ stats, onClaim, onBuyPlus, onClose, lang }) => {
  const currentXP = stats.xp;
  const isPlus = stats.isDiePassPlus;

  const getSkinName = (skinId: string) => {
    return SKINS.find(s => s.id === skinId)?.name || skinId.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[550] p-1 md:p-4 backdrop-blur-xl">
      <div className="bg-zinc-900 border-2 md:border-4 border-orange-500 w-full max-w-5xl h-[85vh] md:h-[80vh] flex flex-col p-2 md:p-6 pixel-shadow overflow-hidden relative">
        
        {/* Pulsante Chiudi Fisso per Mobile */}
        <button 
          onClick={onClose} 
          className="md:hidden absolute top-2 right-2 bg-red-600 text-white w-8 h-8 flex items-center justify-center font-black rounded-sm border-2 border-white z-[600]"
        >
          X
        </button>

        {/* Header - Ultra compatto */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-1 md:gap-4 mb-2 md:mb-6 flex-shrink-0 pt-2 md:pt-0">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-4xl font-black text-orange-600 italic uppercase tracking-tighter leading-none">DIE PASS 🎫</h2>
            <p className="text-zinc-500 text-[7px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1">
              {currentXP.toLocaleString()} XP TOTALI
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {!isPlus ? (
              <button 
                onClick={onBuyPlus}
                disabled={stats.gems < 12500}
                className="bg-gradient-to-r from-yellow-600 to-orange-700 px-2 py-1 md:p-4 border md:border-2 border-white text-white font-black uppercase text-[7px] md:text-[10px] animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.6)]"
              >
                PASS+ (12.500 💎)
              </button>
            ) : (
              <div className="bg-orange-600/20 border border-orange-500 px-2 py-1 md:p-2 md:px-4 rounded text-orange-400 font-black uppercase text-[7px] md:text-[10px]">
                PASS+ ATTIVO ⚡
              </div>
            )}
            <button onClick={onClose} className="hidden md:block text-zinc-500 hover:text-white uppercase font-black text-[10px]">CHIUDI</button>
          </div>
        </div>

        {/* Rewards List - Scorrevolezza migliorata e card più snelle */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-1 md:pb-4 custom-scrollbar touch-pan-x">
          <div className="flex gap-1 md:gap-3 min-w-max px-1 md:px-2 h-full">
            {DIE_PASS_REWARDS.map((reward) => {
              const isLocked = currentXP < reward.xpRequired;
              const freeClaimed = stats.claimedRewards.includes(`${reward.level}_free`);
              const plusClaimed = stats.claimedRewards.includes(`${reward.level}_plus`);
              const isFinal = reward.level === 50;

              return (
                <div key={reward.level} className={`w-28 md:w-48 flex flex-col gap-1 md:gap-2 p-1 md:p-2 border-2 h-full ${isLocked ? 'border-zinc-800 opacity-60' : isFinal ? 'border-yellow-500 bg-yellow-950/20' : 'border-zinc-600 bg-zinc-800/30'}`}>
                  
                  <div className={`text-center py-0.5 md:py-1 border-b md:border-b-2 font-black text-[8px] md:text-[10px] ${isFinal ? 'bg-yellow-600 text-black border-white' : 'bg-zinc-900 border-orange-600'}`}>
                    LIV {reward.level}
                  </div>
                  
                  {/* Plus Reward Slot */}
                  <div className={`flex-1 p-1 md:p-2 border md:border rounded flex flex-col items-center justify-center gap-1 md:gap-2 relative overflow-hidden ${isPlus ? 'border-orange-500 bg-orange-900/10' : 'border-zinc-800 bg-black/40 grayscale opacity-70'}`}>
                    <div className="absolute top-0 left-0 text-[4px] md:text-[5px] font-black text-orange-500 bg-black px-0.5">P+</div>
                    <span className={`text-base md:text-2xl ${isFinal ? 'animate-bounce' : ''}`}>
                      {reward.plusReward?.type === 'gems' ? '💎' : '🎭'}
                    </span>
                    <div className={`text-[6px] md:text-[8px] font-black text-center text-white uppercase leading-tight ${isFinal ? 'text-yellow-400' : ''}`}>
                      {reward.plusReward?.type === 'gems' ? `+${reward.plusReward.amount}` : getSkinName(reward.plusReward?.value)}
                    </div>
                    
                    <button 
                      onClick={() => onClaim(reward.level, 'plus')}
                      disabled={isLocked || !isPlus || plusClaimed}
                      className={`w-full py-0.5 md:py-1 text-[5px] md:text-[7px] font-black uppercase transition-all ${!isPlus ? 'hidden' : plusClaimed ? 'bg-zinc-700 text-zinc-500' : isLocked ? 'bg-zinc-800 text-zinc-600' : 'bg-orange-600 text-white hover:bg-orange-500'}`}
                    >
                      {plusClaimed ? 'OK' : 'PRENDI'}
                    </button>
                  </div>

                  {/* XP Indicator - Piccolo divisore */}
                  <div className="text-[5px] md:text-[7px] text-center text-zinc-600 font-bold uppercase leading-none">
                    {reward.xpRequired.toLocaleString()} XP
                  </div>

                  {/* Free Reward Slot */}
                  <div className={`flex-1 p-1 md:p-2 border md:border border-zinc-700 bg-black/20 rounded flex flex-col items-center justify-center gap-1 md:gap-2 relative`}>
                    <div className="absolute top-0 left-0 text-[4px] md:text-[5px] font-black text-zinc-500 bg-black px-0.5">F</div>
                    <span className="text-base md:text-xl">
                      {reward.freeReward?.type === 'gems' ? '💎' : '🎭'}
                    </span>
                    <div className="text-[6px] md:text-[8px] font-black text-center text-zinc-400 uppercase leading-tight">
                      {reward.freeReward?.type === 'gems' ? `+${reward.freeReward.amount}` : getSkinName(reward.freeReward?.value)}
                    </div>

                    <button 
                      onClick={() => onClaim(reward.level, 'free')}
                      disabled={isLocked || freeClaimed}
                      className={`w-full py-0.5 md:py-1 text-[5px] md:text-[7px] font-black uppercase transition-all ${freeClaimed ? 'bg-zinc-800 text-zinc-500' : isLocked ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-black'}`}
                    >
                      {freeClaimed ? 'OK' : 'PRENDI'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Footer - Compresso */}
        <div className="mt-auto border-t md:border-t-2 border-zinc-800 pt-1 md:pt-4 flex-shrink-0">
          <div className="flex justify-between text-[6px] md:text-[8px] font-black uppercase mb-0.5 md:mb-1">
            <span>PRORESSO PASS</span>
            <span className="text-orange-500">{currentXP.toLocaleString()} / 260.000 XP</span>
          </div>
          <div className="h-1 md:h-2 bg-zinc-950 border md:border border-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-800 via-orange-500 to-yellow-400 transition-all duration-1000"
              style={{ width: `${Math.min(100, (currentXP / 265000) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ea580c; border-radius: 2px; }
        @media (max-width: 768px) {
          .custom-scrollbar {
             -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default DiePass;
