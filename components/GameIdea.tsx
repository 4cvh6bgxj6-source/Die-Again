
import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface GameIdeaProps {
  username: string;
  onBack: () => void;
  onClose: () => void;
  lang: Language;
}

const GameIdea: React.FC<GameIdeaProps> = ({ username, onBack, onClose, lang }) => {
  const [idea, setIdea] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const WEBHOOK_URL = "https://discord.com/api/webhooks/1464938041373233348/lcWSfGKeyYOPcpw8gswZZGV9wj8yT_1Ft_t6esMk6i-H2pfohMq0HU_8nP7MCn1ZmMeR";

  const handleSend = async () => {
    if (!idea.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "💡 Nuova Idea Gioco Ricevuta!",
            color: 0xf39c12,
            fields: [
              { name: "Da", value: username, inline: true },
              { name: "Lingua", value: lang.toUpperCase(), inline: true },
              { name: "Idea", value: idea }
            ],
            timestamp: new Date().toISOString()
          }]
        }),
      });
      setIsSent(true);
    } catch (err) {
      console.error(err);
      alert("Errore nell'invio. Riprova più tardi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[90] p-4">
      <div className="bg-zinc-900 border-4 border-yellow-500 p-8 rounded-lg w-full max-w-xl pixel-shadow flex flex-col gap-6 animate-in slide-in-from-bottom duration-300">
        <h2 className="text-2xl md:text-3xl text-yellow-500 text-center uppercase tracking-widest font-black italic">
          {t('tellUsIdea', lang)}
        </h2>

        {!isSent ? (
          <>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t('ideaPlaceholder', lang)}
              className="w-full h-48 bg-black border-2 border-zinc-700 p-4 text-white font-bold focus:outline-none focus:border-yellow-500 placeholder:text-zinc-800"
            />
            <div className="flex flex-col gap-4">
              <button
                onClick={handleSend}
                disabled={!idea.trim() || isSending}
                className="w-full bg-yellow-600 text-black py-5 font-black hover:bg-yellow-500 disabled:bg-zinc-800 disabled:text-zinc-600 uppercase border-b-8 border-yellow-900 active:translate-y-2 active:border-b-0"
              >
                {isSending ? '...' : t('sendIdea', lang)}
              </button>
              <button
                onClick={onBack}
                className="text-zinc-600 hover:text-white uppercase text-[10px] font-bold"
              >
                {t('back', lang)}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-8 py-10 animate-in zoom-in">
            <div className="text-4xl">🚀</div>
            <p className="text-green-400 font-black uppercase text-sm tracking-widest leading-loose">
              {t('ideaSent', lang)}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-white text-black py-4 font-black uppercase text-xs"
            >
              {t('close', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameIdea;
