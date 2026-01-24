
import React, { useState, useEffect } from 'react';
import { GameState, UserStats, LevelData, Skin, Language, Mission } from './types';
import { LEVELS, generateProceduralLevel, SKINS } from './constants';
import GameEngine from './components/GameEngine';
import LuckySpin from './components/LuckySpin';
import DailyRewards from './components/DailyRewards';
import SkinShop from './components/SkinShop';
import PassShop from './components/PassShop';
import Registration from './components/Registration';
import Feedback from './components/Feedback';
import SecretCodes from './components/SecretCodes';
import Missions from './components/Missions';
import PlayerPreview from './components/PlayerPreview';
import { getLevelAdvice, getRageMessage } from './services/gemini';
import { t } from './i18n';

const SAVE_KEY = 'die_again_permanent_save_v3';

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', description: 'Muori 10 volte', target: 10, current: 0, reward: 500, completed: false },
  { id: 'm2', description: 'Supera 3 livelli', target: 3, current: 0, reward: 1000, completed: false },
  { id: 'm3', description: 'Fai 2 Lucky Spin', target: 2, current: 0, reward: 300, completed: false },
];

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
    language: 'it',
    membership: 'none',
    nameColor: '#ffffff',
    missionsUnlocked: false,
    missions: INITIAL_MISSIONS,
    usedCodes: [],
    adminAbuseActive: false
  });
  const [currentLevel, setCurrentLevel] = useState<LevelData>(LEVELS[0]);
  const [lastDeathMessage, setLastDeathMessage] = useState<string>("");
  const [levelAdvice, setLevelAdvice] = useState<string>("");
  const [globalBroadcast, setGlobalBroadcast] = useState<string>("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const [adminGemInput, setAdminGemInput] = useState<number>(50);
  const [activeGemRain, setActiveGemRain] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
       try {
         const parsed = JSON.parse(saved);
         if (parsed && parsed.username) {
           setStats(prev => ({ ...prev, ...parsed }));
           const savedLvl = LEVELS.find(l => l.id === parsed.currentLevelId) || generateProceduralLevel(parsed.currentLevelId);
           setCurrentLevel(savedLvl);
           setGameState(GameState.MENU);
         }
       } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (stats.username) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const handleRegister = (name: string, lang: Language) => {
    const newStats: UserStats = { ...stats, username: name, language: lang };
    setStats(newStats);
    setGameState(GameState.MENU);
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

  const handleDeath = () => {
    setGameState(GameState.GAMEOVER);
    setActiveGemRain(0); // Reset gem rain on death for the challenge
    setStats(prev => {
      const newMissions = prev.missions.map(m => m.id === 'm1' ? { ...m, current: m.current + 1 } : m);
      return { ...prev, deaths: prev.deaths + 1, missions: newMissions };
    });
    
    setLastDeathMessage(""); 
    getRageMessage(stats.deaths + 1, stats.language).then(msg => {
      setLastDeathMessage(msg);
    });
  };

  const handleWin = () => {
    setGameState(GameState.WIN);
    setActiveGemRain(0);
    setStats(prev => {
      const nextId = prev.currentLevelId + 1;
      const newMissions = prev.missions.map(m => m.id === 'm2' ? { ...m, current: m.current + 1 } : m);
      return { ...prev, currentLevelId: nextId, gems: prev.gems + 150, missions: newMissions };
    });
  };

  const claimMission = (id: string) => {
    setStats(prev => {
      const m = prev.missions.find(mi => mi.id === id);
      if (!m || m.completed || m.current < m.target) return prev;
      return {
        ...prev,
        gems: prev.gems + m.reward,
        missions: prev.missions.map(mi => mi.id === id ? { ...mi, completed: true } : mi)
      };
    });
  };

  const handleRedeemCode = (code: string): boolean => {
    if (stats.usedCodes.includes(code)) return false;
    let updatedStats = { ...stats, usedCodes: [...stats.usedCodes, code] };
    let valid = false;
    if (code === '5000') { updatedStats.gems += 5000; valid = true; } 
    else if (code === 'ADMIN') { updatedStats.unlockedSkins = [...new Set([...updatedStats.unlockedSkins, 'admin'])]; valid = true; } 
    else if (code === 'ADMIN ABUSE') { updatedStats.adminAbuseActive = true; valid = true; }
    else if (code === 'PREMIUM') { updatedStats.membership = 'premium'; valid = true; } 
    else if (code === 'VIP') { 
      updatedStats.membership = 'vip'; 
      const vipUnlockable = SKINS.filter(s => !s.isCodeOnly).map(s => s.id);
      updatedStats.unlockedSkins = [...new Set([...updatedStats.unlockedSkins, ...vipUnlockable])]; 
      valid = true; 
    } 
    else if (code === 'MISSION') { updatedStats.missionsUnlocked = true; valid = true; }
    if (valid) setStats(updatedStats);
    return valid;
  };

  const triggerAdminAbuse = () => {
    if (adminMsgInput.trim()) {
      setGlobalBroadcast(adminMsgInput);
      setTimeout(() => setGlobalBroadcast(""), 12000);
    }
    if (adminGemInput > 0) {
      setActiveGemRain(adminGemInput);
      if (!adminMsgInput.trim()) {
        setGlobalBroadcast(`ADMIN ABUSE: ${adminGemInput.toLocaleString()} GEMS RELEASED FOR EVERYONE!`);
        setTimeout(() => setGlobalBroadcast(""), 8000);
      }
    }
    setAdminPanelOpen(false);
    setAdminMsgInput("");
  };

  const handleJackpot = () => {
    setStats(prev => ({ ...prev, gems: prev.gems + 20000 }));
    setGlobalBroadcast("SYSTEM: JACKPOT 20.000 GEMS CLAIMED!");
    setTimeout(() => setGlobalBroadcast(""), 5000);
  };

  const isDailyClaimed = stats.lastDailyClaim === new Date().toDateString();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#050b18] to-[#1a2e4c] text-white flex flex-col items-center justify-center p-4">
      
      {/* GLOBAL BROADCAST BANNER */}
      {globalBroadcast && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 z-[200] py-4 border-b-4 border-white animate-pulse shadow-[0_0_40px_rgba(255,0,0,0.8)]">
          <div className="flex items-center justify-center gap-4 overflow-hidden whitespace-nowrap">
             <span className="text-xl font-black uppercase tracking-tighter italic text-white animate-marquee">
               🚨 {globalBroadcast} 🚨 {globalBroadcast} 🚨 {globalBroadcast} 🚨
             </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 10s linear infinite; }
        @keyframes fall { 0% { transform: translateY(0vh) translateX(0px); } 100% { transform: translateY(120vh) translateX(50px); } }
        .animate-fall { animation: fall linear infinite; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-fall" style={{ width: `${Math.random() * 8 + 2}px`, height: `${Math.random() * 8 + 2}px`, left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, opacity: Math.random() * 0.6 + 0.2, animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `${Math.random() * 10}s` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {gameState === GameState.REGISTRATION && <Registration onRegister={handleRegister} />}

        {gameState === GameState.MENU && (
          <div className="text-center space-y-6 md:space-y-10 animate-in fade-in zoom-in duration-500 w-full flex flex-col items-center">
            <h1 className="text-4xl md:text-8xl font-black text-red-600 tracking-tighter italic drop-shadow-[0_10px_15px_rgba(255,0,0,0.6)]">DIE AGAIN 🎄</h1>
            <div className="flex flex-col items-center gap-4">
              <PlayerPreview skinId={stats.activeSkinId} />
              <p className="text-[8px] uppercase tracking-[0.4em] font-black" style={{ color: stats.nameColor === 'rainbow' ? undefined : stats.nameColor, animation: stats.nameColor === 'rainbow' ? 'rainbow-text 2s infinite linear' : 'none' }}>{t('welcomeBack', stats.language)}, {stats.username}.</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={startGame} className="bg-red-700 text-white py-4 px-10 text-xl font-bold border-4 border-white/20 uppercase pixel-shadow hover:bg-red-600 transition-all">{t('playLevel', stats.language)} {stats.currentLevelId}</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGameState(GameState.LUCKY_SPIN)} className="bg-zinc-800/80 backdrop-blur-sm text-yellow-400 py-3 text-[8px] font-bold border-b-4 border-yellow-900 uppercase">{t('spin', stats.language)}</button>
                <button onClick={() => setGameState(GameState.DAILY_REWARDS)} className="bg-zinc-800/80 backdrop-blur-sm text-purple-400 py-3 text-[8px] font-bold border-b-4 border-purple-900 uppercase">{t('gifts', stats.language)}</button>
                <button onClick={() => setGameState(GameState.PASS_SHOP)} className="bg-yellow-600 text-black py-3 text-[8px] font-black border-b-4 border-yellow-900 uppercase">{t('pass', stats.language)}</button>
                <button onClick={() => setGameState(GameState.SKIN_SHOP)} className="bg-zinc-800/80 backdrop-blur-sm text-indigo-400 py-3 text-[8px] font-bold border-b-4 border-indigo-900 uppercase">{t('shop', stats.language)}</button>
                <button onClick={() => setGameState(GameState.SECRET_CODES)} className="bg-zinc-800/80 backdrop-blur-sm text-red-500 py-3 text-[8px] font-bold border-b-4 border-red-900 uppercase">{t('codes', stats.language)}</button>
                <button onClick={() => setGameState(GameState.FEEDBACK)} className="bg-zinc-800/80 backdrop-blur-sm text-cyan-400 py-3 text-[8px] font-bold border-b-4 border-cyan-900 uppercase">{t('feedback', stats.language)}</button>
              </div>
              
              {stats.adminAbuseActive && (
                <button 
                  onClick={() => setAdminPanelOpen(true)}
                  className="bg-green-600 text-black py-4 text-[10px] font-black border-4 border-black uppercase animate-pulse shadow-[0_0_20px_#22c55e]"
                >
                  CONSOLE ADMIN ABUSE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADMIN PANEL TERMINAL */}
      {adminPanelOpen && (
        <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4">
          <div className="bg-black border-4 border-green-500 p-8 w-full max-w-md font-mono text-green-400 shadow-[0_0_30px_#22c55e]">
            <h2 className="text-xl font-bold mb-8 text-center underline tracking-widest text-green-500">TERMINALE ABUSO POTERE</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[8px] mb-2 font-bold uppercase">Messaggio Global Broadcast:</label>
                <input 
                  value={adminMsgInput}
                  onChange={(e) => setAdminMsgInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-green-900 p-3 text-xs focus:outline-none focus:border-green-400"
                  placeholder="Scrivi a TUTTI i giocatori..."
                />
              </div>

              <div>
                <label className="block text-[8px] mb-2 font-bold uppercase text-yellow-500">Gemme da Rilasciare (Fino all'infinito):</label>
                <input 
                  type="number"
                  value={adminGemInput}
                  onChange={(e) => setAdminGemInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-yellow-900 p-3 text-xs focus:outline-none focus:border-yellow-400 text-yellow-500 font-black"
                  placeholder="Quante gemme pioveranno?"
                />
              </div>

              <button 
                onClick={triggerAdminAbuse}
                className="w-full bg-green-600 text-black py-4 font-black text-[12px] uppercase border-b-8 border-green-900 hover:bg-green-400 transition-all active:translate-y-2 active:border-b-0"
              >
                ESEGUI ABUSO POTERE
              </button>

              <button 
                onClick={() => setAdminPanelOpen(false)}
                className="w-full text-center text-zinc-600 hover:text-white text-[8px] font-bold uppercase mt-4"
              >
                ESCI DAL SISTEMA
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="relative w-full max-w-[1000px] flex flex-col items-center gap-4 z-20">
          <button onClick={() => setGameState(GameState.MENU)} className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black border-2 border-white/20 px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-white transition-all">{t('menu', stats.language)}</button>
          <GameEngine 
            level={currentLevel} 
            gameState={gameState} 
            onDeath={handleDeath} 
            onWin={handleWin} 
            activeSkinId={stats.activeSkinId} 
            lang={stats.language} 
            userStats={stats} 
            releaseGems={activeGemRain > 0}
            gemCount={activeGemRain}
            onJackpot={handleJackpot}
          />
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 w-full max-w-md aspect-square bg-zinc-950 p-8 border-8 border-red-600 pixel-shadow overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-black text-red-600 tracking-tighter italic animate-pulse mb-4 uppercase">SCLERATO! ❄️</h2>
            <div className="mb-4"><PlayerPreview skinId={stats.activeSkinId} /></div>
            <div className={`transition-all duration-500 w-full ${lastDeathMessage ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-red-900/20 border-l-4 border-red-600 p-3 mb-6 w-full overflow-y-auto max-h-24">
                <p className="text-red-400 text-[10px] italic uppercase font-bold tracking-tight">"{lastDeathMessage}"</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={startGame} className="bg-red-600 text-white py-4 px-10 text-lg font-bold border-b-8 border-red-900 hover:bg-red-500 transition-all active:scale-95 uppercase">RIPROVA</button>
              <button onClick={() => setGameState(GameState.MENU)} className="bg-zinc-800 text-zinc-400 py-3 px-10 text-[10px] font-bold border-b-4 border-zinc-950 hover:bg-zinc-700 transition-all active:scale-95 uppercase">{t('menu', stats.language)}</button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.WIN && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="text-center flex flex-col items-center justify-center animate-in zoom-in bg-zinc-900 p-8 border-8 border-green-500 w-full max-w-md aspect-square pixel-shadow overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-bold text-green-500 animate-bounce mb-4 uppercase tracking-tighter">{t('winTitle', stats.language)} 🎁</h2>
            <div className="text-xl text-yellow-400 font-black mb-8 tracking-widest">+150 💎</div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => {
                const nextId = stats.currentLevelId;
                setCurrentLevel(LEVELS.find(l => l.id === nextId) || generateProceduralLevel(nextId));
                setGameState(GameState.PLAYING);
              }} className="bg-green-600 text-white py-4 px-8 font-bold w-full uppercase border-b-8 border-green-900 text-lg hover:bg-green-500 active:scale-95 transition-all">{t('nextLevel', stats.language, { n: stats.currentLevelId })}</button>
              <button onClick={() => setGameState(GameState.MENU)} className="bg-zinc-800 text-zinc-400 py-3 px-10 text-[10px] font-bold border-b-4 border-zinc-950 hover:bg-zinc-700 transition-all uppercase">{t('menu', stats.language)}</button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.LUCKY_SPIN && <LuckySpin lang={stats.language} userGems={stats.gems} onWin={(net) => { setStats(prev => ({ ...prev, gems: prev.gems + net, missions: prev.missions.map(m => m.id === 'm3' ? {...m, current: m.current + 1} : m) })); setGameState(GameState.MENU); }} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.SECRET_CODES && <SecretCodes lang={stats.language} onRedeem={handleRedeemCode} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.DAILY_REWARDS && <DailyRewards lang={stats.language} streak={stats.dailyStreak} alreadyClaimed={isDailyClaimed} onClaim={(a) => { setStats(prev => ({ ...prev, gems: prev.gems + a, lastDailyClaim: new Date().toDateString(), dailyStreak: (prev.dailyStreak + 1) % 8 })); setGameState(GameState.MENU); }} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.SKIN_SHOP && <SkinShop lang={stats.language} userGems={stats.gems} unlockedSkins={stats.unlockedSkins} activeSkinId={stats.activeSkinId} membership={stats.membership} onBuy={(s) => setStats(p => ({...p, gems: p.gems - s.price, unlockedSkins: [...p.unlockedSkins, s.id], activeSkinId: s.id}))} onEquip={(id) => setStats(p => ({...p, activeSkinId: id}))} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.PASS_SHOP && <PassShop lang={stats.language} userStats={stats} onBuyPremium={() => { if(stats.gems >= 5000) setStats(p => ({...p, gems: p.gems - 5000, membership: 'premium'})) }} onBuyVip={() => { if(stats.gems >= 20000) {
        const vipUnlockable = SKINS.filter(s => !s.isCodeOnly).map(s => s.id);
        setStats(p => ({...p, gems: p.gems - 20000, membership: 'vip', nameColor: 'rainbow', unlockedSkins: [...new Set([...p.unlockedSkins, ...vipUnlockable])]}));
      } }} onChangeNameColor={(c) => setStats(p => ({...p, nameColor: c}))} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.FEEDBACK && <Feedback lang={stats.language} username={stats.username} onClose={() => setGameState(GameState.MENU)} />}
    </div>
  );
};

export default App;
