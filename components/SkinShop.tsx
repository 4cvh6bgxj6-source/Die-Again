
import React from 'react';
import { Skin, Language } from '../types';
import { SKINS } from '../constants';
import { t } from '../i18n';

interface SkinShopProps {
  userGems: number;
  unlockedSkins: string[];
  activeSkinId: string;
  onBuy: (skin: Skin) => void;
  onEquip: (skinId: string) => void;
  onClose: () => void;
  lang: Language;
}

const SkinShop: React.FC<SkinShopProps> = ({ userGems, unlockedSkins, activeSkinId, onBuy, onEquip, onClose, lang }) => {
  const getSkinName = (skinId: string) => {
    switch (skinId) {
      case 'classic': return t('skinClassic', lang);
      case 'gold': return t('skinGold', lang);
      case 'ruby': return t('skinRuby', lang);
      case 'emerald': return t('skinEmerald', lang);
      case 'ghost': return t('skinGhost', lang);
      default: return skinId.toUpperCase();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-4 border-indigo-500 p-8 rounded-lg w-full max-w-3xl pixel-shadow">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl text-indigo-400 uppercase tracking-tighter">{t('skinShop', lang)}</h2>
          <div className="bg-indigo-950 px-4 py-2 border-2 border-indigo-400 rounded">
            <span className="text-yellow-400 font-bold">{userGems} {t('gems', lang)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
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
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  style={{ 
                    backgroundColor: skin.color, 
                    boxShadow: `0 0 15px ${skin.color}`
                  }}
                />
                
                <div className="text-center">
                  <div className="text-sm font-bold text-white mb-1">{getSkinName(skin.id)}</div>
                  {!isUnlocked && (
                    <div className="text-[10px] text-yellow-500">{skin.price} {t('gems', lang)}</div>
                  )}
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onEquip(skin.id)}
                    disabled={isActive}
                    className={`w-full py-2 text-[10px] uppercase font-bold ${
                      isActive 
                        ? 'bg-zinc-700 text-zinc-500 cursor-default' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isActive ? t('equipped', lang) : t('equip', lang)}
                  </button>
                ) : (
                  <button
                    onClick={() => onBuy(skin)}
                    disabled={userGems < skin.price}
                    className={`w-full py-2 text-[10px] uppercase font-bold ${
                      userGems >= skin.price
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {userGems >= skin.price ? t('buy', lang) : t('insufficientGems', lang)}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-black py-3 px-10 font-bold hover:bg-zinc-200 uppercase text-xs"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkinShop;
