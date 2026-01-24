
import React from 'react';
import { Skin, Language } from '../types';
import { SKINS } from '../constants';
import { t } from '../i18n';

interface SkinShopProps {
  userGems: number;
  unlockedSkins: string[];
  activeSkinId: string;
  membership: string;
  onBuy: (skin: Skin) => void;
  onEquip: (skinId: string) => void;
  onClose: () => void;
  lang: Language;
}

const SkinShop: React.FC<SkinShopProps> = ({ userGems, unlockedSkins, activeSkinId, membership, onBuy, onEquip, onClose, lang }) => {
  const getSkinName = (skinId: string) => {
    switch (skinId) {
      case 'classic': return t('skinClassic', lang);
      case 'gold': return t('skinGold', lang);
      case 'ruby': return t('skinRuby', lang);
      case 'emerald': return t('skinEmerald', lang);
      case 'ghost': return t('skinGhost', lang);
      case 'neon': return 'NEON X';
      case 'inferno': return 'INFERNO';
      case 'admin': return 'ADMIN';
      default: return skinId.toUpperCase();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start justify-center z-50 p-4 overflow-y-auto py-10">
      <div className="bg-zinc-900 border-4 border-indigo-500 p-6 md:p-8 rounded-lg w-full max-w-3xl my-auto pixel-shadow relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl text-indigo-400 uppercase tracking-tighter font-black">{t('skinShop', lang)}</h2>
          <div className="bg-indigo-950 px-4 py-2 border-2 border-indigo-400 rounded">
            <span className="text-yellow-400 font-bold text-xs md:text-sm">{userGems} {t('gems', lang)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isActive = activeSkinId === skin.id;

            return (
              <div 
                key={skin.id}
                className={`p-4 border-4 rounded-lg flex flex-col items-center gap-4 transition-all ${
                  isActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-zinc-700 bg-zinc-800'
                }`}
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg"
                  style={{ 
                    backgroundColor: skin.color, 
                    boxShadow: `0 0 15px ${skin.color}`
                  }}
                />
                
                <div className="text-center">
                  <div className="text-[10px] md:text-sm font-bold text-white mb-1">{getSkinName(skin.id)}</div>
                  {!isUnlocked && (
                    <div className="text-[8px] md:text-[10px] text-yellow-500">
                      {skin.isVipOnly ? 'SOLO VIP' : skin.isCodeOnly ? 'SOLO CODICE' : `${skin.price} ${t('gems', lang)}`}
                    </div>
                  )}
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onEquip(skin.id)}
                    disabled={isActive}
                    className={`w-full py-2 text-[9px] md:text-[10px] uppercase font-bold transition-colors ${
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
                    onClick={() => onBuy(skin)}
                    className={`w-full py-2 text-[9px] md:text-[10px] uppercase font-bold transition-colors ${
                      (!skin.isVipOnly && !skin.isCodeOnly && userGems >= skin.price)
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white active:scale-95'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {skin.isVipOnly ? 'VIP REQUIRED' : skin.isCodeOnly ? 'CODE ONLY' : (userGems >= skin.price ? t('buy', lang) : t('insufficientGems', lang))}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="bg-white text-black py-3 px-10 font-black hover:bg-zinc-200 transition-all active:scale-95 uppercase text-[10px] md:text-xs border-b-4 border-zinc-400"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkinShop;
