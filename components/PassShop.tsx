
import React from 'react';
import { Language, UserStats } from '../types';
import { t } from '../i18n';

interface PassShopProps {
  userStats: UserStats;
  onBuyPremium: () => void;
  onBuyVip: () => void;
  onChangeNameColor: (color: string) => void;
  onClose: () => void;
  lang: Language;
}

const PassShop: React.FC<PassShopProps> = ({ userStats, onBuyPremium, onBuyVip, onChangeNameColor, onClose, lang }) => {
  const nameColors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start justify-center z-50 p-4 overflow-y-auto py-10">
      <div className="bg-zinc-900 border-4 border-yellow-500 p-6 md:p-8 rounded-lg w-full max-w-4xl my-auto pixel-shadow relative">
        <h2 className="text-3xl md:text-5xl text-yellow-500 text-center uppercase tracking-tighter font-black mb-10 italic">
          {t('passShop', lang)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* CARD PREMIUM */}
          <div className={`p-6 border-4 rounded-xl flex flex-col gap-4 relative overflow-hidden ${userStats.membership !== 'none' ? 'border-purple-500 bg-purple-950/20' : 'border-zinc-700 bg-zinc-800'}`}>
            <h3 className="text-2xl font-black text-purple-400 uppercase italic">PREMIUM</h3>
            <div className="text-[10px] md:text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {t('premiumFeatures', lang)}
            </div>
            
            {userStats.membership === 'none' ? (
              <button 
                onClick={onBuyPremium}
                disabled={userStats.gems < 5000}
                className="mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white py-4 font-bold uppercase text-xs border-b-4 border-purple-900 active:scale-95 transition-all"
              >
                {t('buyPremium', lang)}
              </button>
            ) : (
              <div className="mt-4 text-center py-4 bg-purple-900/40 text-purple-300 font-bold uppercase text-xs border-2 border-purple-500 rounded">
                {t('owned', lang)}
              </div>
            )}
          </div>

          {/* CARD VIP */}
          <div className={`p-6 border-4 rounded-xl flex flex-col gap-4 relative overflow-hidden animate-pulse-subtle ${userStats.membership === 'vip' ? 'border-white bg-gradient-to-br from-red-900/40 via-blue-900/40 to-green-900/40' : 'border-zinc-700 bg-zinc-800'}`}>
            <style>{`
              @keyframes rainbow-text {
                0% { color: #ff0000; }
                20% { color: #ffff00; }
                40% { color: #00ff00; }
                60% { color: #00ffff; }
                80% { color: #0000ff; }
                100% { color: #ff00ff; }
              }
              .rainbow-vip { animation: rainbow-text 2s infinite linear; }
            `}</style>
            <h3 className="text-2xl font-black rainbow-vip uppercase italic">VIP</h3>
            <div className="text-[10px] md:text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {t('vipFeatures', lang)}
            </div>

            {userStats.membership !== 'vip' ? (
              <button 
                onClick={onBuyVip}
                disabled={userStats.gems < 20000}
                className="mt-4 bg-gradient-to-r from-red-600 via-green-600 to-blue-600 hover:brightness-110 disabled:grayscale text-white py-4 font-bold uppercase text-xs border-b-4 border-white/50 active:scale-95 transition-all"
              >
                {t('buyVip', lang)}
              </button>
            ) : (
              <div className="mt-4 text-center py-4 bg-white/10 text-white font-bold uppercase text-xs border-2 border-white rounded rainbow-vip">
                ULTIMATE VIP
              </div>
            )}
          </div>
        </div>

        {/* SELETTORE COLORE NOME (Solo se Premium o VIP) */}
        {(userStats.membership !== 'none') && (
          <div className="mb-10 p-6 border-2 border-zinc-700 rounded-lg bg-black/40">
            <h4 className="text-center text-zinc-500 uppercase text-[10px] mb-4 font-bold tracking-widest">{t('nameColor', lang)}</h4>
            <div className="flex justify-center gap-4 flex-wrap">
              {nameColors.map(color => (
                <button
                  key={color}
                  onClick={() => onChangeNameColor(color)}
                  className={`w-10 h-10 rounded border-4 transition-transform active:scale-90 ${userStats.nameColor === color ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {userStats.membership === 'vip' && (
                <button
                  onClick={() => onChangeNameColor('rainbow')}
                  className={`px-4 h-10 rounded border-4 font-black text-[8px] rainbow-vip transition-transform active:scale-90 ${userStats.nameColor === 'rainbow' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                  style={{ background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta)' }}
                >
                  RAINBOW
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-black py-4 px-16 font-black hover:bg-zinc-200 transition-all active:scale-95 uppercase text-xs border-b-4 border-zinc-400"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassShop;
