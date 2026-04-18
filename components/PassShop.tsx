
import React, { useState } from 'react';
import { Language, UserStats, Item, EquipState } from '../types';
import { t } from '../i18n';
import { ITEMS, NAME_COLORS } from '../constants';
import PlayerPreview from './PlayerPreview';

interface PassShopProps {
  userStats: UserStats;
  onBuyPremium: () => void;
  onBuyVip: () => void;
  onBuyDiePassPlus: () => void;
  onBuyItem: (item: Item) => void;
  onEquipItem: (item: Item) => void;
  onChangeNameColor: (color: string) => void;
  onClose: () => void;
  lang: Language;
  freeChoice?: boolean;
}

const PassShop: React.FC<PassShopProps> = ({ userStats, onBuyPremium, onBuyVip, onBuyDiePassPlus, onBuyItem, onEquipItem, onChangeNameColor, onClose, lang, freeChoice }) => {
  const [activeTab, setActiveTab] = useState<'membership' | 'items'>(freeChoice ? 'items' : 'membership');

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start justify-center z-[500] p-4 overflow-y-auto py-10">
      <div className="bg-zinc-900 border-4 border-yellow-500 p-6 md:p-8 rounded-lg w-full max-w-6xl my-auto pixel-shadow relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 flex items-center justify-center border-4 border-white font-black hover:bg-red-500 active:scale-90 transition-all z-10"
        >
          X
        </button>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b-4 border-zinc-800 pb-6">
          <div className="flex gap-4 sm:gap-16">
             <button 
               onClick={() => setActiveTab('membership')}
               className={`text-sm sm:text-2xl md:text-3xl font-black uppercase italic transition-all ${activeTab === 'membership' ? 'text-yellow-500 scale-105 md:scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
               ABBONAMENTI
             </button>
             <button 
               onClick={() => setActiveTab('items')}
               className={`text-sm sm:text-2xl md:text-3xl font-black uppercase italic transition-all ${activeTab === 'items' ? 'text-cyan-500 scale-105 md:scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
               COSMETICI
             </button>
          </div>
          <div className="bg-zinc-950 px-4 py-1.5 border-2 border-yellow-500 rounded-lg flex items-center gap-2">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">BILANCIO:</span>
             <span className="text-yellow-400 font-black text-sm md:text-lg">💎 {userStats.gems > 90000000 ? '∞' : userStats.gems.toLocaleString()}</span>
          </div>
        </div>

        {activeTab === 'membership' ? (
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
        ) : (
              <div className="flex flex-col xl:flex-row gap-6 mb-10 min-h-[400px]">
              {/* Profile Preview Table */}
               <div className="w-full xl:w-80 flex flex-col items-center gap-6 bg-black/40 p-4 md:p-8 border-4 border-zinc-700 rounded-xl">
                 <h4 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest border-b-2 border-zinc-700 pb-2 w-full text-center">ANTEPRIMA LIVE</h4>
                 <div className="scale-100 md:scale-150 py-4 md:py-10">
                    <PlayerPreview skinId={userStats.activeSkinId} equippedItems={userStats.equippedItems} isStatic={true} />
                 </div>
                 <div className="w-full grid grid-cols-1 gap-2">
                    {Object.entries(userStats.equippedItems)
                      .filter(([type]) => ['hat', 'eyewear', 'shirt', 'pants', 'shoes'].includes(type))
                      .map(([type, itemId]) => (
                       <div key={type} className="flex justify-between items-center bg-zinc-800/50 p-2 border-2 border-zinc-700 rounded text-[10px] font-mono">
                          <span className="text-zinc-500 uppercase">{type}:</span>
                          <span className="text-cyan-400 font-bold">{itemId ? ITEMS.find(i=>i.id===itemId)?.name : 'VUOTO'}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Items Grid */}
              <div className="flex-1 max-h-[60vh] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {freeChoice && (
                      <div className="col-span-full bg-cyan-900/30 border-2 border-cyan-500 p-4 rounded-lg flex items-center justify-between mb-2 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">🎁</span>
                          <div>
                            <h4 className="text-cyan-400 font-black uppercase text-sm tracking-tighter">PREMIO LUCKY SPIN: ITEM A SCELTA</h4>
                            <p className="text-white text-[10px] font-bold italic">Puoi riscattare 1 oggetto QUALSIASI gratuitamente!</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-cyan-600 text-white font-black text-xs uppercase animate-pulse rounded border-2 border-cyan-400">GRATUITO</div>
                      </div>
                    )}
                    {ITEMS.map(item => {
                       const isUnlocked = userStats.unlockedItems.includes(item.id);
                       const isEquipped = userStats.equippedItems[item.type as keyof EquipState] === item.id;
                       return (
                          <div key={item.id} className={`p-4 border-4 rounded-lg flex flex-col gap-4 transition-all ${isEquipped ? 'border-cyan-500 bg-cyan-950/20' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'}`}>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-zinc-500">{item.type}</span>
                                <span className="text-xs md:text-sm font-black text-white uppercase leading-tight">{item.name}</span>
                             </div>

                             {/* Item mini-preview */}
                             <div className="bg-zinc-950/50 border-2 border-zinc-700 h-40 rounded flex items-center justify-center overflow-hidden relative">
                                <div className="">
                                   <PlayerPreview 
                                     skinId={userStats.activeSkinId} 
                                     equippedItems={{
                                       ...userStats.equippedItems,
                                       [item.type]: item.id
                                     }} 
                                     isStatic={true} 
                                   />
                                </div>
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold text-zinc-400 border border-zinc-800">
                                   PREVIEW
                                </div>
                             </div>

                             {isUnlocked ? (
                                <button 
                                  onClick={() => onEquipItem(item)}
                                  className={`w-full py-2 font-black uppercase text-[10px] transition-all border-b-4 active:scale-95 ${isEquipped ? 'bg-red-600 border-red-900 text-white' : 'bg-cyan-600 border-cyan-900 text-white'}`}
                                >
                                   {isEquipped ? 'TOGLI' : 'EQUIPAGGIA'}
                                </button>
                             ) : (item.isVipOnly && userStats.membership !== 'vip') ? (
                                <div className="w-full py-3 bg-zinc-900 border-2 border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-1 overflow-hidden">
                                   <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-tighter">ESCLUSIVA</span>
                                   <span className="text-[10px] text-white font-black uppercase italic" style={{ animation: 'rainbow-text 2s infinite linear' }}>VIP ONLY</span>
                                </div>
                             ) : (
                                <button 
                                  onClick={() => onBuyItem(item)}
                                  disabled={!freeChoice && userStats.gems < item.price}
                                  className={`w-full py-2 font-black uppercase text-[10px] border-b-4 active:scale-95 transition-all ${freeChoice ? 'bg-cyan-600 border-cyan-800 text-white hover:bg-cyan-500' : 'bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-700 text-black border-yellow-800'}`}
                                >
                                   {freeChoice ? 'RISCATTA ORA' : (item.price === 0 ? 'GRATIS' : `💎 ${item.price.toLocaleString()}`)}
                                </button>
                             )}
                          </div>
                       );
                    })}
                 </div>
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eab308; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #facc15; }
      `}</style>
    </div>
  );
};

export default PassShop;
