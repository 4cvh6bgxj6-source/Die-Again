
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: "💬 Nuovo Feedback Giocatore",
          color: 3447003,
          fields: [
            { name: "Utente", value: username, inline: true },
            { name: "Messaggio", value: text },
            { name: "Lingua", value: lang }
          ],
          timestamp: new Date().toISOString()
        }]
      }),
    }).catch(err => console.error("Errore Discord Feedback:", err));

    // Richiesta a Gemini per la risposta troll
    try {
      const aiResponse = await processFeedback(username, text, lang);
      setResponse(aiResponse);
    } catch (err) {
      setResponse(lang === 'it' ? "Feedback ricevuto. Adesso torna a giocare e smettila di piangere." : "Feedback received. Now go back to playing and stop crying.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4">
      <div className="bg-zinc-900 border-4 border-cyan-500 p-8 rounded-lg w-full max-w-xl pixel-shadow flex flex-col gap-6">
        <h2 className="text-2xl text-cyan-400 uppercase tracking-widest font-black">{t('feedback', lang)}</h2>
        
        {!isSubmitted ? (
          <>
            <p className="text-[10px] text-zinc-500 uppercase">{t('feedbackDesc', lang)}</p>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('feedbackPlaceholder', lang)}
              className="w-full h-32 bg-black border-2 border-zinc-800 p-4 text-white font-bold placeholder:text-zinc-700 focus:outline-none focus:border-cyan-900"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bg-cyan-600 text-white py-4 font-bold hover:bg-cyan-500 disabled:bg-zinc-800 uppercase text-sm"
            >
              INVIA FEEDBACK
            </button>
          </>
        ) : (
          <div className="space-y-6 animate-in zoom-in duration-300 text-center">
            <div className="text-green-400 font-bold uppercase text-[12px] tracking-tight leading-normal border-2 border-green-900 p-2 bg-green-950/20">
              {t('feedbackSent', lang)}
            </div>
            
            <div className="bg-zinc-950 p-6 border-l-4 border-cyan-500 italic text-cyan-200 text-sm text-left min-h-[80px] flex items-center">
              {isLoadingAI ? (
                <div className="w-full flex justify-center">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <span>"{response}"</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-white text-black py-3 font-black uppercase text-xs hover:bg-zinc-200 transition-colors"
            >
              {t('feedbackAcknowledge', lang)}
            </button>
          </div>
        )}

        {!isSubmitted && (
          <button onClick={onClose} className="text-zinc-600 text-[10px] uppercase hover:text-white">{t('cancel', lang)}</button>
        )}
      </div>
    </div>
  );
};

export default Feedback;
