
import React from 'react';
import { Skin, Language } from '../types';
import { SKINS } from '../constants';
import { t } from '../i18n';
import PlayerPreview from './PlayerPreview';

interface SkinShopProps {
  userGems: number;
  unlockedSkins: string[];
  activeSkinId: string;
  onBuySkin: (skin: Skin) => void;
  onEquipSkin: (skinId: string) => void;
  onClose: () => void;
  lang: Language;
}

const SkinShop: React.FC<SkinShopProps> = ({ 
  userGems, unlockedSkins, activeSkinId, onBuySkin, onEquipSkin, onClose, lang 
}) => {
  const getSkinName = (skin: Skin) => {
    if (skin.id === 'classic') return t('skinClassic', lang);
    return skin.name;
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start justify-center z-[600] p-2 md:p-4 overflow-y-auto py-10">
      <div className="bg-zinc-900 border-4 border-indigo-500 p-4 md:p-8 rounded-lg w-full max-w-5xl my-auto pixel-shadow relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 flex items-center justify-center border-4 border-white font-black hover:bg-red-500 active:scale-90 transition-all z-10"
        >
          X
        </button>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-white font-black text-2xl uppercase tracking-widest">NEGOZIO SKIN</h2>
          <div className="bg-indigo-950 px-4 py-2 border-2 border-indigo-400 rounded flex items-center gap-2">
            <span className="text-yellow-400 font-black text-xs md:text-sm">💎 {userGems.toLocaleString()} {t('gems', lang)}</span>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
            {SKINS.map((skin) => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isActive = activeSkinId === skin.id;

              return (
                <div 
                  key={skin.id}
                  className={`p-3 md:p-4 border-4 rounded-lg flex flex-col items-center gap-2 md:gap-4 transition-all ${
                    isActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-zinc-700 bg-zinc-800'
                  }`}
                >
                  <div className="mb-2">
                    <PlayerPreview skinId={skin.id} isStatic={true} />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-[8px] md:text-[10px] font-black mb-1 ${skin.isRainbow ? 'animate-rainbow-text' : 'text-white'}`}>
                      {getSkinName(skin)}
                    </div>
                    {!isUnlocked && (
                      <div className="text-[7px] md:text-[8px] text-yellow-500 font-black uppercase">
                        {skin.isVipOnly ? 'SOLO VIP' : skin.isCodeOnly ? 'ESCLUSIVA' : `${skin.price.toLocaleString()} ${t('gems', lang)}`}
                      </div>
                    )}
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onEquipSkin(skin.id)}
                      disabled={isActive}
                      className={`w-full py-2 text-[8px] md:text-[10px] uppercase font-black transition-colors ${
                        isActive 
                          ? 'bg-zinc-700 text-zinc-500 cursor-default' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                      }`}
                    >
                      {isActive ? t('equipped', lang) : t('equip', lang)}
                    </button>
                  ) : (
                    <button
                      disabled={skin.isVipOnly || skin.isCodeOnly || userGems < skin.price}
                      onClick={() => onBuySkin(skin)}
                      className={`w-full py-2 text-[8px] md:text-[10px] uppercase font-black transition-colors ${
                        (!skin.isVipOnly && !skin.isCodeOnly && userGems >= skin.price)
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white active:scale-95'
                          : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {skin.isVipOnly ? 'VIP REQUIRED' : skin.isCodeOnly ? 'PASS/CODE ONLY' : (userGems >= skin.price ? t('buy', lang) : t('insufficientGems', lang))}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        @keyframes rainbow-text { 0% { color: #ff0000; } 20% { color: #ffff00; } 40% { color: #00ff00; } 60% { color: #00ffff; } 80% { color: #0000ff; } 100% { color: #ff00ff; } }
        .animate-rainbow-text { animation: rainbow-text 2s infinite linear; }
      `}</style>
    </div>
  );
};

export default SkinShop;
