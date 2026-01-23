
import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface RegistrationProps {
  onRegister: (username: string, lang: Language) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<Language>('it');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      onRegister(username.trim(), lang);
    } else {
      alert(t('usernameTooShort', lang));
    }
  };

  return (
    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-md w-full p-8 bg-zinc-900 border-4 border-red-600 pixel-shadow">
      <div className="flex justify-center gap-4 mb-4">
        <button 
          onClick={() => setLang('it')} 
          className={`px-3 py-1 text-[10px] border-2 font-bold ${lang === 'it' ? 'border-red-600 text-white bg-red-900/50' : 'border-zinc-700 text-zinc-500'}`}
        >
          ITALIANO
        </button>
        <button 
          onClick={() => setLang('en')} 
          className={`px-3 py-1 text-[10px] border-2 font-bold ${lang === 'en' ? 'border-red-600 text-white bg-red-900/50' : 'border-zinc-700 text-zinc-500'}`}
        >
          ENGLISH
        </button>
      </div>

      <h2 className="text-4xl font-black text-red-600 italic uppercase">
        {t('newUser', lang)}
      </h2>
      <p className="text-zinc-400 text-xs uppercase tracking-widest leading-loose">
        {t('registrationDesc', lang)}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('usernamePlaceholder', lang)}
          className="w-full bg-black border-b-4 border-red-900 p-4 text-center text-xl font-bold text-white focus:outline-none focus:border-red-500 transition-colors uppercase"
          maxLength={15}
          autoFocus
        />
        
        <button 
          type="submit"
          className="w-full bg-white text-black py-4 font-black hover:bg-zinc-200 transition-all active:scale-95 border-b-4 border-zinc-400 uppercase"
        >
          {t('registerBtn', lang)}
        </button>
      </form>
    </div>
  );
};

export default Registration;
