
import React, { useState, useEffect } from 'react';
import { GameState, UserStats, LevelData, Skin, Language } from './types';
import { LEVELS, generateProceduralLevel } from './constants';
import GameEngine from './components/GameEngine';
import LuckySpin from './components/LuckySpin';
import DailyRewards from './components/DailyRewards';
import SkinShop from './components/SkinShop';
import Registration from './components/Registration';
import Feedback from './components/Feedback';
import { getLevelAdvice } from './services/gemini';
import { t } from './i18n';

// Chiave definitiva per il salvataggio locale
const SAVE_KEY = 'die_again_permanent_save_v1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.REGISTRATION);
  const [stats, setStats] = useState<UserStats>({
    username: '',
    deaths: 0,
    gems: 500,
    currentLevelId: 1,
    lastDailyClaim: null,
    dailyStreak: 0,
    unlockedSkins: ['classic'],
    activeSkinId: 'classic',
    language: 'it'
  });
  const [currentLevel, setCurrentLevel] = useState<LevelData>(LEVELS[0]);
  const [lastDeathMessage, setLastDeathMessage] = useState<string>("");
  const [levelAdvice, setLevelAdvice] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
       try {
         const parsed = JSON.parse(saved);
         if (parsed && parsed.username) {
           setStats(parsed);
           const savedLvl = LEVELS.find(l => l.id === parsed.currentLevelId) || generateProceduralLevel(parsed.currentLevelId);
           setCurrentLevel(savedLvl);
           setGameState(GameState.MENU);
         }
       } catch (e) {
         console.error("Errore nel caricamento dei dati salvati:", e);
       }
    }
  }, []);

  // Salva automaticamente ogni volta che gli stats cambiano
  useEffect(() => {
    if (stats.username) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const handleRegister = (name: string, lang: Language) => {
    const newStats: UserStats = { ...stats, username: name, language: lang };
    setStats(newStats);
    // Salva immediatamente al momento della registrazione
    localStorage.setItem(SAVE_KEY, JSON.stringify(newStats));
    setGameState(GameState.MENU);

    // Notifica Discord per la registrazione
    const REG_WEBHOOK_URL = "https://discord.com/api/webhooks/1464529974752186422/rOAHvaPEZ2wVbCEz9cizMNJhYooULv8qN4eQenVN3g7fCDmqYCTPH08sHg91_eFo9f5Q";
    fetch(REG_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: "🎯 Nuova Registrazione - Die Again",
          color: 15158332, // Rosso scuro
          fields: [
            { name: "👤 Utente", value: name, inline: true },
            { name: "🌍 Lingua", value: lang.toUpperCase(), inline: true },
            { name: "💎 Gemme Iniziali", value: "500", inline: true }
          ],
          footer: { text: "Die Again System" },
          timestamp: new Date().toISOString()
        }]
      }),
    }).catch(err => console.error("Errore notifica Discord registrazione:", err));
  };

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setLastDeathMessage("");
    updateLevelAdvice(currentLevel.name);
  };

  const updateLevelAdvice = async (name: string) => {
    const advice = await getLevelAdvice(name, stats.language);
    setLevelAdvice(advice);
  };

  const handleDeath = (msg: string) => {
    setStats(prev => ({ ...prev, deaths: prev.deaths + 1 }));
    setLastDeathMessage(msg);
  };

  const handleWin = () => {
    setGameState(GameState.WIN);
    setStats(prev => {
      const nextId = prev.currentLevelId + 1;
      return { ...prev, currentLevelId: nextId, gems: prev.gems + 150 };
    });
  };

  const nextLevel = () => {
    const nextId = stats.currentLevelId;
    const nextLvl = LEVELS.find(l => l.id === nextId) || generateProceduralLevel(nextId);
    setCurrentLevel(nextLvl);
    setGameState(GameState.PLAYING);
    setLastDeathMessage("");
    updateLevelAdvice(nextLvl.name);
  };

  const claimDaily = (amount: number) => {
    setStats(prev => ({
      ...prev,
      gems: prev.gems + amount,
      dailyStreak: (prev.dailyStreak + 1) % 8,
      lastDailyClaim: new Date().toDateString()
    }));
  };

  const buySkin = (skin: Skin) => {
    if (stats.gems >= skin.price) {
      setStats(prev => ({
        ...prev,
        gems: prev.gems - skin.price,
        unlockedSkins: [...prev.unlockedSkins, skin.id],
        activeSkinId: skin.id
      }));
    }
  };

  const equipSkin = (skinId: string) => {
    setStats(prev => ({ ...prev, activeSkinId: skinId }));
  };

  const toggleLanguage = () => {
    setStats(prev => ({ ...prev, language: prev.language === 'it' ? 'en' : 'it' }));
  };

  const isDailyClaimed = stats.lastDailyClaim === new Date().toDateString();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {gameState === GameState.REGISTRATION && (
        <Registration onRegister={handleRegister} />
      )}

      {gameState === GameState.MENU && (
        <div className="text-center space-y-6 md:space-y-12 animate-in fade-in zoom-in duration-500 w-full max-w-lg">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={toggleLanguage}
              className="bg-zinc-900 border-2 border-zinc-700 px-3 py-1 text-[8px] font-bold hover:bg-zinc-800 transition-colors"
            >
              {stats.language.toUpperCase()}
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-9xl font-black text-red-600 tracking-tighter italic drop-shadow-[0_10px_15px_rgba(255,0,0,0.6)]">
              DIE AGAIN
            </h1>
            <p className="text-zinc-500 text-[8px] md:text-[10px] uppercase tracking-[0.4em]">{t('welcomeBack', stats.language)}, {stats.username}.</p>
          </div>
          
          <div className="flex flex-col gap-4 mx-auto w-full">
            <button 
              onClick={startGame}
              className="bg-white text-black py-4 md:py-5 px-6 md:px-10 text-xl md:text-2xl font-bold hover:bg-zinc-200 transition-all hover:scale-105 pixel-shadow border-4 border-zinc-400 uppercase"
            >
              {t('playLevel', stats.language)} {stats.currentLevelId}
            </button>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setGameState(GameState.LUCKY_SPIN)} className="bg-zinc-800 text-yellow-400 py-3 md:py-4 text-[8px] md:text-[10px] font-bold hover:bg-zinc-700 border-b-4 border-yellow-900 uppercase">{t('spin', stats.language)}</button>
               <button onClick={() => setGameState(GameState.DAILY_REWARDS)} className="bg-zinc-800 text-purple-400 py-3 md:py-4 text-[8px] md:text-[10px] font-bold hover:bg-zinc-700 border-b-4 border-purple-900 uppercase">{t('gifts', stats.language)}</button>
               <button onClick={() => setGameState(GameState.SKIN_SHOP)} className="bg-zinc-800 text-indigo-400 py-3 md:py-4 text-[8px] md:text-[10px] font-bold hover:bg-zinc-700 border-b-4 border-indigo-900 uppercase">{t('shop', stats.language)}</button>
               <button onClick={() => setGameState(GameState.FEEDBACK)} className="bg-zinc-800 text-cyan-400 py-3 md:py-4 text-[8px] md:text-[10px] font-bold hover:bg-zinc-700 border-b-4 border-cyan-900 uppercase">{t('feedback', stats.language)}</button>
            </div>
          </div>
          
          <div className="flex justify-center gap-10 text-[8px] md:text-[10px] text-zinc-600 uppercase border-t border-zinc-900 pt-6 md:pt-8">
            <div>{t('deaths', stats.language)}: {stats.deaths}</div>
            <div className="text-yellow-500 font-bold">{t('gems', stats.language)}: {stats.gems}</div>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-[1000px]">
          <GameEngine 
            level={currentLevel} 
            gameState={gameState}
            onDeath={handleDeath}
            onWin={handleWin}
            activeSkinId={stats.activeSkinId}
            lang={stats.language}
          />
          
          <div className="w-full flex justify-between items-start gap-4 min-h-[80px] md:min-h-[100px]">
            <div className="flex-1">
              {lastDeathMessage && (
                <div className="bg-red-900/20 border-l-4 border-red-600 p-2 md:p-4 animate-in fade-in slide-in-from-left duration-300">
                  <p className="text-red-400 text-[8px] md:text-[10px] leading-relaxed italic uppercase font-bold tracking-tight">"{lastDeathMessage}"</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setGameState(GameState.MENU)}
              className="bg-zinc-900 hover:bg-zinc-800 px-4 md:px-6 py-2 md:py-3 text-[8px] md:text-[10px] uppercase border-2 border-zinc-800 transition-colors tracking-widest font-bold"
            >
              {t('menu', stats.language)}
            </button>
            <div className="flex-1 text-right">
              {levelAdvice && (
                <div className="text-[7px] md:text-[9px] text-zinc-500 uppercase leading-tight bg-zinc-900/40 p-2 md:p-3 rounded">
                  <span className="text-zinc-400 font-bold block mb-1">{t('tipTitle', stats.language)}</span> {levelAdvice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.WIN && (
        <div className="text-center space-y-6 md:space-y-10 animate-in zoom-in duration-300 bg-zinc-900/80 p-8 md:p-16 border-4 md:border-8 border-green-500 pixel-shadow max-w-md w-full">
          <h2 className="text-4xl md:text-7xl font-bold text-green-500 animate-bounce tracking-tighter">{t('winTitle', stats.language)}</h2>
          <p className="text-zinc-400 text-[10px] md:text-sm uppercase font-bold">{t('winDesc', stats.language, { n: currentLevel.id })}</p>
          <div className="text-xl md:text-3xl text-yellow-400 font-black">+150 {t('gems', stats.language)}</div>
          <button 
            onClick={nextLevel}
            className="bg-green-600 text-white py-4 md:py-5 px-8 md:px-10 font-bold hover:bg-green-500 transition-all pixel-shadow uppercase text-xs md:text-sm w-full border-b-8 border-green-900"
          >
            {t('nextLevel', stats.language, { n: stats.currentLevelId })}
          </button>
        </div>
      )}

      {gameState === GameState.LUCKY_SPIN && (
        <LuckySpin lang={stats.language} userGems={stats.gems} onWin={(netAmount) => { setStats(prev => ({ ...prev, gems: prev.gems + netAmount })); setGameState(GameState.MENU); }} onClose={() => setGameState(GameState.MENU)} />
      )}

      {gameState === GameState.DAILY_REWARDS && (
        <DailyRewards lang={stats.language} streak={stats.dailyStreak} alreadyClaimed={isDailyClaimed} onClaim={claimDaily} onClose={() => setGameState(GameState.MENU)} />
      )}

      {gameState === GameState.SKIN_SHOP && (
        <SkinShop lang={stats.language} userGems={stats.gems} unlockedSkins={stats.unlockedSkins} activeSkinId={stats.activeSkinId} onBuy={buySkin} onEquip={equipSkin} onClose={() => setGameState(GameState.MENU)} />
      )}

      {gameState === GameState.FEEDBACK && (
        <Feedback lang={stats.language} username={stats.username} onClose={() => setGameState(GameState.MENU)} />
      )}
    </div>
  );
};

export default App;
