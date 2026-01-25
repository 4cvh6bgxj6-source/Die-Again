
import React, { useState } from 'react';
import { processFeedback } from '../services/gemini';
import { Language } from '../types';
import { t } from '../i18n';

interface FeedbackProps {
  username: string;
  onClose: () => void;
  lang: Language;
}

const Feedback: React.FC<FeedbackProps> = ({ username, onClose, lang }) => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Webhook corretto per il feedback
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1464217372951838731/UNCHf8sOTAdqM9B8-5loPMboKJG67LxWaIZ0nBuctTvS8QUDTW1SsLpZPMYKPTcP9WyN";

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsSubmitted(true);
    setIsLoadingAI(true);

    // Invio al Webhook di Discord
    fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "💬 Feedback Inviato",
          color: 0x3498db,
          fields: [
            { name: "Giocatore", value: username, inline: true },
            { name: "Messaggio", value: text },
            { name: "Lingua", value: lang.toUpperCase(), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      }),
    }).catch(err => console.error("Discord Feedback Error:", err));

    // Risposta "Troll" dall'AI
    try {
      const aiResponse = await processFeedback(username, text, lang);
      setResponse(aiResponse);
    } catch (err) {
      setResponse(lang === 'it' ? "Abbiamo letto il tuo feedback e deciso che hai solo bisogno di fare più pratica." : "We read your feedback and decided you just need more practice.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[600] p-4 backdrop-blur-lg">
      <div className="bg-zinc-900 border-4 border-cyan-500 p-6 md:p-10 rounded-lg w-full max-w-xl pixel-shadow flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl text-cyan-400 uppercase tracking-widest font-black italic">{t('feedback', lang)}</h2>
        
        {!isSubmitted ? (
          <>
            <p className="text-[10px] md:text-xs text-zinc-400 uppercase leading-relaxed">{t('feedbackDesc', lang)}</p>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('feedbackPlaceholder', lang)}
              className="w-full h-40 bg-black border-2 border-zinc-800 p-4 text-white font-bold placeholder:text-zinc-800 focus:outline-none focus:border-cyan-600 transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bg-cyan-600 text-white py-5 font-black hover:bg-cyan-500 disabled:bg-zinc-800 uppercase text-lg border-b-8 border-cyan-900 active:translate-y-2 active:border-b-0"
            >
              INVIA SEGNALAZIONE
            </button>
          </>
        ) : (
          <div className="space-y-8 animate-in zoom-in duration-300 text-center py-4">
            <div className="text-green-400 font-black uppercase text-sm border-2 border-green-900 p-4 bg-green-950/30">
              {t('feedbackSent', lang)}
            </div>
            
            <div className="bg-black p-6 border-l-8 border-cyan-500 italic text-cyan-200 text-sm md:text-lg text-left shadow-inner">
              {isLoadingAI ? (
                <div className="w-full flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <span>"{response}"</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-white text-black py-4 font-black uppercase text-xs hover:bg-zinc-200 transition-colors"
            >
              {t('feedbackAcknowledge', lang)}
            </button>
          </div>
        )}

        {!isSubmitted && (
          <button onClick={onClose} className="text-zinc-600 text-[10px] uppercase font-bold hover:text-white">{t('cancel', lang)}</button>
        )}
      </div>
    </div>
  );
};

export default Feedback;
