
import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface SecretCodesProps {
  onRedeem: (code: string) => boolean;
  onClose: () => void;
  lang: Language;
}

const SecretCodes: React.FC<SecretCodesProps> = ({ onRedeem, onClose, lang }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });

  const handleRedeem = () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const success = onRedeem(cleanCode);
    if (success) {
      setStatus({ msg: t('codeSuccess', lang), type: 'success' });
      setCode('');
    } else {
      setStatus({ msg: t('codeInvalid', lang), type: 'error' });
    }

    setTimeout(() => setStatus({ msg: '', type: null }), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4">
      <div className="bg-zinc-900 border-4 border-red-500 p-8 rounded-lg w-full max-w-md pixel-shadow flex flex-col gap-6 text-center">
        <h2 className="text-3xl text-red-500 uppercase tracking-tighter font-black italic">{t('secretCodesTitle', lang)}</h2>
        
        <div className="space-y-4">
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('enterCode', lang)}
            className="w-full bg-black border-2 border-zinc-800 p-4 text-center text-xl font-bold text-white focus:outline-none focus:border-red-600 uppercase"
          />
          
          <button
            onClick={handleRedeem}
            className="w-full bg-red-600 text-white py-4 font-black hover:bg-red-500 active:scale-95 transition-all border-b-4 border-red-900 uppercase text-sm"
          >
            {t('redeem', lang)}
          </button>
        </div>

        {status.msg && (
          <div className={`p-2 text-[10px] font-bold uppercase border-2 ${status.type === 'success' ? 'border-green-600 text-green-400 bg-green-950/20' : 'border-red-900 text-red-500 bg-red-950/20'}`}>
            {status.msg}
          </div>
        )}

        <div className="mt-4">
          <a 
            href="https://discord.gg/e79xKKyC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-[10px] uppercase font-bold underline decoration-indigo-800 underline-offset-4 animate-pulse"
          >
            {t('noCodesText', lang)}
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-zinc-600 hover:text-white uppercase text-[10px] font-bold"
        >
          {t('close', lang)}
        </button>
      </div>
    </div>
  );
};

export default SecretCodes;
