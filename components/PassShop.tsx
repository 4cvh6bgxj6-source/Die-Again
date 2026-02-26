
import React from 'react';
import { Language, UserStats } from '../types';
import { t } from '../i18n';

interface PassShopProps {
  userStats: UserStats;
  onBuyPremium: () => void;
  onBuyVip: () => void;
  onBuyDiePassPlus: () => void;
  onChangeNameColor: (color: string) => void;
  onClose: () => void;
  lang: Language;
}

const PassShop: React.FC<PassShopProps> = ({ userStats, onBuyPremium, onBuyVip, onBuyDiePassPlus, onChangeNameColor, onClose, lang }) => {
  const nameColors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start justify-center z-50 p-4 overflow-y-auto py-10">
      <div className="bg-zinc-900 border-4 border-yellow-500 p-6 md:p-8 rounded-lg w-full max-w-5xl my-auto pixel-shadow relative">
        <h2 className="text-3xl md:text-5xl text-yellow-500 text-center uppercase tracking-tighter font-black mb-10 italic">
          {t('passShop', lang)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* CARD DIE PASS+ */}
          <div className={`p-6 border-4 rounded-xl flex flex-col gap-4 relative overflow-hidden ${userStats.isDiePassPlus ? 'border-orange-500 bg-orange-950/20' : 'border-zinc-700 bg-zinc-800'}`}>
            <h3 className="text-2xl font-black text-orange-500 uppercase italic">DIE PASS+ 🎫</h3>
            <div className="text-[10px] md:text-xs text-zinc-300 leading-relaxed">
              <p className="font-bold text-orange-400 mb-2">VANTAGGI ELITE:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sblocca tutte le ricompense Plus</li>
                <li className="text-yellow-400 font-black">+230.000 GEMME EXTRA</li>
                <li>5 Skin Esclusive (Cyber, Void, etc)</li>
                <li className="text-red-500 font-black">PREMIO FINALE: ADMIN POWER</li>
                <li className="text-[8px] italic text-zinc-500 mt-2">L'Admin Power può creare altre mappe, distruggerle, volare, togliere trappole e finire i livelli istantaneamente!</li>
              </ul>
            </div>
            
            {!userStats.isDiePassPlus ? (
              <button 
                onClick={onBuyDiePassPlus}
                disabled={userStats.gems < 12500}
                className="mt-auto bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white py-4 font-bold uppercase text-xs border-b-4 border-orange-900 active:scale-95 transition-all"
              >
                ACQUISTA (12.500 💎)
              </button>
            ) : (
              <div className="mt-auto text-center py-4 bg-orange-900/40 text-orange-300 font-bold uppercase text-xs border-2 border-orange-500 rounded">
                {t('owned', lang)}
              </div>
            )}
          </div>

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
                className="mt-auto bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white py-4 font-bold uppercase text-xs border-b-4 border-purple-900 active:scale-95 transition-all"
              >
                {t('buyPremium', lang)}
              </button>
            ) : (
              <div className="mt-auto text-center py-4 bg-purple-900/40 text-purple-300 font-bold uppercase text-xs border-2 border-purple-500 rounded">
                {t('owned', lang)}
              </div>
            )}
          </div>

          {/* CARD VIP */}
          <div className={`p-6 border-4 rounded-xl flex flex-col gap-4 relative overflow-hidden ${userStats.membership === 'vip' ? 'border-white bg-gradient-to-br from-red-900/40 via-blue-900/40 to-green-900/40' : 'border-zinc-700 bg-zinc-800'}`}>
            <h3 className="text-2xl font-black uppercase italic" style={{ animation: 'rainbow-text 2s infinite linear' }}>VIP</h3>
            <div className="text-[10px] md:text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {t('vipFeatures', lang)}
            </div>

            {userStats.membership !== 'vip' ? (
              <button 
                onClick={onBuyVip}
                disabled={userStats.gems < 20000}
                className="mt-auto bg-gradient-to-r from-red-600 via-green-600 to-blue-600 hover:brightness-110 disabled:grayscale text-white py-4 font-bold uppercase text-xs border-b-4 border-white/50 active:scale-95 transition-all"
              >
                {t('buyVip', lang)}
              </button>
            ) : (
              <div className="mt-auto text-center py-4 bg-white/10 text-white font-bold uppercase text-xs border-2 border-white rounded" style={{ animation: 'rainbow-text 2s infinite linear' }}>
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
                  className={`px-4 h-10 rounded border-4 font-black text-[8px] transition-transform active:scale-90 ${userStats.nameColor === 'rainbow' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                  style={{ background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta)', animation: 'rainbow-text 2s infinite linear' }}
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
