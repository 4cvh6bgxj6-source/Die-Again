
import React, { useState } from 'react';
import { UserStats, Language } from '../types';
import { t } from '../i18n';
import { NAME_COLORS } from '../constants';

interface ProfileEditProps {
  userStats: UserStats;
  onSave: (newName: string, newColor: string) => void;
  onClose: () => void;
  lang: Language;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ userStats, onSave, onClose, lang }) => {
  const [tempName, setTempName] = useState(userStats.username);
  const [tempColor, setTempColor] = useState(userStats.nameColor);
  const cost = 500;

  const handleSave = () => {
    if (tempName.trim().length < 3) return;
    onSave(tempName, tempColor);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4">
      <div className="bg-zinc-900 border-4 border-indigo-500 p-8 rounded-lg w-full max-w-md pixel-shadow relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-red-600 text-white w-8 h-8 flex items-center justify-center border-4 border-white font-black hover:bg-red-500 active:scale-90 transition-all z-10"
        >
          X
        </button>

        <h3 className="text-2xl font-black text-indigo-400 uppercase italic mb-8 border-b-2 border-zinc-800 pb-2">
          {t('changeName', lang)}
        </h3>

        <div className="space-y-8">
          {/* Nome */}
          <div className="space-y-4">
            <label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest block">
              {t('usernamePlaceholder', lang)}
            </label>
            <input 
              type="text" 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-700 p-4 text-white font-black uppercase text-center focus:border-indigo-500 outline-none transition-all"
              placeholder={t('usernamePlaceholder', lang)}
              maxLength={15}
            />
            <div className="flex items-center justify-between px-1">
               <span className="text-[9px] text-zinc-600 font-bold">{t('nameChangeCost', lang)}</span>
               <span className={`text-[9px] font-black ${userStats.gems < cost ? 'text-red-500' : 'text-yellow-500'}`}>
                 💎 {cost}
               </span>
            </div>
          </div>

          {/* Colore */}
          <div className="space-y-4">
            <label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest block text-center">
              {t('nameColorTitle', lang)}
            </label>
            <div className="flex justify-center gap-3 flex-wrap">
              {NAME_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setTempColor(color)}
                  className={`w-8 h-8 rounded border-2 transition-all ${tempColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {userStats.membership === 'vip' && (
                <button
                  onClick={() => setTempColor('rainbow')}
                  className={`px-3 h-8 rounded border-2 font-black text-[8px] transition-all ${tempColor === 'rainbow' ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  style={{ background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta)', animation: 'rainbow-text 2s infinite linear' }}
                >
                  RAINBOW
                </button>
              )}
            </div>
          </div>

          {/* Azione */}
          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={userStats.gems < cost && tempName !== userStats.username}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm border-b-4 active:scale-95 transition-all
                ${tempName === userStats.username && tempColor === userStats.nameColor
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-900 shadow-[0_4px_0_rgba(79,70,229,0.3)]'
                }`}
            >
              {t('save', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
