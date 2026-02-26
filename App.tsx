
import React, { useState, useEffect } from 'react';
import { GameState, UserStats, LevelData, Skin, Language, Mission } from './types';
import { LEVELS, generateProceduralLevel, SKINS, DIE_PASS_REWARDS } from './constants';
import GameEngine from './components/GameEngine';
import LuckySpin from './components/LuckySpin';
import DailyRewards from './components/DailyRewards';
import SkinShop from './components/SkinShop';
import PassShop from './components/PassShop';
import Registration from './components/Registration';
import Feedback from './components/Feedback';
import SecretCodes from './components/SecretCodes';
import PlayerPreview from './components/PlayerPreview';
import FireDashGroup from './components/FireDashGroup';
import GameIdea from './components/GameIdea';
import Missions from './components/Missions';
import DiePass from './components/DiePass';
import { getLevelAdvice, getRageMessage } from './services/gemini';
import { t } from './i18n';

const SAVE_KEY = 'die_again_permanent_save_v3';
const REGISTRATION_WEBHOOK = "https://discord.com/api/webhooks/1464660275444715800/owqFqGv7Z9hhuUXmHMXVSt7XXE3xbZoZg31Mf-n9fczoH_WrDdewuHLq5FZd_hxaJrCA";

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
    xp: 0,
    isDiePassPlus: false,
    claimedRewards: [],
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
  const [activeGemRain, setActiveGemRain] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
       try {
         const parsed = JSON.parse(saved);
         if (parsed && parsed.username) {
           setStats(prev => ({ 
             ...prev, 
             ...parsed, 
             xp: parsed.xp ?? 0, 
             isDiePassPlus: parsed.isDiePassPlus ?? false,
             claimedRewards: parsed.claimedRewards ?? []
           }));
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
    if (stats.activeSkinId === 'admin_power' && !stats.adminAbuseActive) {
      setStats(prev => ({ ...prev, adminAbuseActive: true }));
    }
  }, [stats]);

  const handleRegister = (name: string, lang: Language) => {
    const newStats: UserStats = { ...stats, username: name, language: lang };
    setStats(newStats);
    setGameState(GameState.MENU);
    fetch(REGISTRATION_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title: "🚀 Nuova Registrazione", color: 0x00ff00, fields: [{ name: "Username", value: name, inline: true }], timestamp: new Date().toISOString() }] }) }).catch(() => {});
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
    setActiveGemRain(0); 
    setStats(prev => {
      const newMissions = prev.missions.map(m => m.id === 'm1' ? { ...m, current: m.current + 1 } : m);
      return { ...prev, deaths: prev.deaths + 1, missions: newMissions, xp: prev.xp + 10 };
    });
    setLastDeathMessage(""); 
    getRageMessage(stats.deaths + 1, stats.language).then(msg => setLastDeathMessage(msg));
  };

  const handleWin = () => {
    setGameState(GameState.WIN);
    setActiveGemRain(0);
    setStats(prev => {
      const nextId = prev.currentLevelId + 1;
      const newMissions = prev.missions.map(m => m.id === 'm2' ? { ...m, current: m.current + 1 } : m);
      return { ...prev, currentLevelId: nextId, gems: prev.gems + 150, missions: newMissions, xp: prev.xp + 100 };
    });
  };

  const handleRedeemCode = (code: string): boolean => {
    if (stats.usedCodes.includes(code)) return false;
    let updatedStats = { ...stats, usedCodes: [...stats.usedCodes, code] };
    let valid = false;
    if (code === '12.500') { updatedStats.gems += 12500; valid = true; }
    else if (code === '261409') { updatedStats.xp += 261409; valid = true; }
    else if (code === '5000') { updatedStats.gems += 5000; valid = true; } 
    else if (code === 'ADMIN') { updatedStats.unlockedSkins = [...new Set([...updatedStats.unlockedSkins, 'admin'])]; valid = true; } 
    else if (code === 'ADMIN ABUSE') { updatedStats.adminAbuseActive = true; valid = true; }
    else if (code === 'PREMIUM') { updatedStats.membership = 'premium'; valid = true; } 
    else if (code === 'MISSION') { updatedStats.missionsUnlocked = true; valid = true; }
    else if (code === 'VIP') { updatedStats.membership = 'vip'; const vipUnlockable = SKINS.filter(s => !s.isCodeOnly).map(s => s.id); updatedStats.unlockedSkins = [...new Set([...updatedStats.unlockedSkins, ...vipUnlockable])]; valid = true; } 
    
    if (valid) setStats(updatedStats);
    return valid;
  };

  const handleClaimMission = (missionId: string) => {
    setStats(prev => {
      const mission = prev.missions.find(m => m.id === missionId);
      if (!mission || mission.completed || mission.current < mission.target) return prev;
      const newMissions = prev.missions.map(m => m.id === missionId ? { ...m, completed: true } : m);
      return { ...prev, gems: prev.gems + mission.reward, missions: newMissions };
    });
  };

  const handleBuyDiePassPlus = () => {
    if (stats.gems >= 12500 && !stats.isDiePassPlus) {
      setStats(prev => ({ ...prev, gems: prev.gems - 12500, isDiePassPlus: true }));
    }
  };

  const handleClaimPassReward = (level: number, type: 'free' | 'plus') => {
    const rewardId = `${level}_${type}`;
    if (stats.claimedRewards.includes(rewardId)) return;
    const rewardData = DIE_PASS_REWARDS.find(r => r.level === level);
    if (!rewardData) return;
    const data = type === 'free' ? rewardData.freeReward : rewardData.plusReward;
    if (!data) return;
    setStats(prev => {
      let newStats = { ...prev, claimedRewards: [...prev.claimedRewards, rewardId] };
      if (data.type === 'gems') { newStats.gems += data.amount || 0; } 
      else if (data.type === 'skin') { newStats.unlockedSkins = [...new Set([...newStats.unlockedSkins, data.value])]; }
      return newStats;
    });
  };

  const handleJackpot = () => { setStats(prev => ({ ...prev, gems: prev.gems + 20000 })); setGlobalBroadcast("🚨 SYSTEM: JACKPOT 20.000 GEMME PRESO! 🚨"); setTimeout(() => setGlobalBroadcast(""), 6000); };
  const isDailyClaimed = stats.lastDailyClaim === new Date().toDateString();

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#050b18] via-[#0a1a3a] to-[#050b18] text-white">
      {globalBroadcast && (
        <div className="fixed top-0 left-0 right-0 bg-red-700 z-[300] py-4 md:py-6 border-b-4 border-white shadow-[0_10px_50px_rgba(255,0,0,0.8)] overflow-hidden">
          <div className="whitespace-nowrap flex animate-marquee">
             <span className="text-lg md:text-3xl font-black uppercase italic text-white px-10">⚠️ {globalBroadcast} ⚠️</span>
             <span className="text-lg md:text-3xl font-black uppercase italic text-white px-10">⚠️ {globalBroadcast} ⚠️</span>
          </div>
        </div>
      )}

      {gameState !== GameState.REGISTRATION && (
        <div className="fixed top-4 right-4 z-[400] flex flex-col items-end gap-2 pointer-events-none">
          {/* Gem HUD */}
          <div className="bg-zinc-900/80 backdrop-blur-md border-2 border-yellow-500 px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-[0_0_20px_rgba(251,191,36,0.3)] pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-sm md:text-2xl">💎</span>
              <span className="text-yellow-500 font-black text-[10px] md:text-lg tracking-widest">{stats.gems.toLocaleString()}</span>
            </div>
          </div>
          {/* XP HUD */}
          <div className="bg-zinc-900/80 backdrop-blur-md border-2 border-orange-500 px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-2xl text-orange-500 font-black">XP</span>
              <span className="text-white font-black text-[10px] md:text-lg tracking-widest">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 15s linear infinite; display: inline-flex; width: 200%; }
        @keyframes burn { 
          0% { transform: translateY(110vh) rotate(0deg) scale(1); opacity: 0.8; } 
          100% { transform: translateY(-20vh) rotate(360deg) scale(0); opacity: 0; } 
        }
        .animate-burn { animation: burn linear infinite; }
        @keyframes rainbow-text { 0% { color: #ff0000; } 20% { color: #ffff00; } 40% { color: #00ff00; } 60% { color: #00ffff; } 80% { color: #0000ff; } 100% { color: #ff00ff; } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(120)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const colors = ['#ef4444', '#f97316', '#eab308', '#dc2626']; // Rosso, Arancio, Giallo, Rosso Scuro
          const color = colors[Math.floor(Math.random() * colors.length)];
          return (
            <div 
              key={i} 
              className="absolute animate-burn" 
              style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                backgroundColor: color,
                left: `${Math.random() * 100}%`, 
                animationDuration: `${Math.random() * 3 + 2}s`, 
                animationDelay: `${Math.random() * 5}s`,
                boxShadow: `0 0 ${size}px ${color}`
              }} 
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center">
        {gameState === GameState.REGISTRATION && (
          <div className="flex items-center justify-center h-full w-full p-4">
            <Registration onRegister={handleRegister} />
          </div>
        )}
        
        {gameState === GameState.MENU && (
          <div className="w-full h-full overflow-y-auto pt-16 md:pt-24 pb-12 flex flex-col items-center">
            <div className="text-center space-y-4 md:space-y-12 animate-in fade-in zoom-in duration-700 w-full max-w-4xl flex flex-col items-center px-4">
              <h1 className="text-4xl md:text-9xl font-black text-red-600 tracking-tighter italic drop-shadow-[0_10px_20px_rgba(255,0,0,0.5)] leading-tight uppercase">DIE AGAIN 🔥</h1>
              
              <div className="flex flex-col items-center gap-3 md:gap-6">
                <div className="scale-75 md:scale-100">
                  <PlayerPreview skinId={stats.activeSkinId} />
                </div>
                <p className="text-[8px] md:text-xs uppercase tracking-[0.3em] font-black" style={{ color: stats.nameColor === 'rainbow' ? undefined : stats.nameColor, animation: stats.nameColor === 'rainbow' ? 'rainbow-text 2s infinite linear' : 'none' }}>
                  {t('welcomeBack', stats.language)}, {stats.username}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 w-full max-w-sm md:max-w-lg">
                <button onClick={startGame} className="bg-red-700 text-white py-4 md:py-6 px-4 md:px-12 text-xl md:text-4xl font-black border-2 md:border-4 border-white/30 uppercase pixel-shadow hover:bg-red-600 transition-all hover:scale-105 active:scale-95 shadow-[0_6px_0_#991b1b] md:shadow-[0_10px_0_#991b1b]">
                  {t('playLevel', stats.language)} {stats.currentLevelId}
                </button>
                
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <button onClick={() => setGameState(GameState.DIE_PASS)} className="bg-orange-600 text-white py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-orange-900 uppercase hover:bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.4)]">DIE PASS 🎫</button>
                  <button onClick={() => setGameState(GameState.LUCKY_SPIN)} className="bg-zinc-800/90 text-yellow-400 py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-yellow-900 uppercase hover:bg-zinc-700">{t('spin', stats.language)}</button>
                  <button onClick={() => setGameState(GameState.DAILY_REWARDS)} className="bg-zinc-800/90 text-purple-400 py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-purple-900 uppercase hover:bg-zinc-700">{t('gifts', stats.language)}</button>
                  <button onClick={() => setGameState(GameState.PASS_SHOP)} className="bg-yellow-600 text-black py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-yellow-900 uppercase hover:bg-yellow-500">{t('pass', stats.language)}</button>
                  <button onClick={() => setGameState(GameState.SKIN_SHOP)} className="bg-zinc-800/90 text-indigo-400 py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-indigo-900 uppercase hover:bg-zinc-700">{t('shop', stats.language)}</button>
                  <button onClick={() => setGameState(GameState.SECRET_CODES)} className="bg-zinc-800/90 text-red-500 py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-red-900 uppercase hover:bg-zinc-700">{t('codes', stats.language)}</button>
                  {stats.missionsUnlocked && <button onClick={() => setGameState(GameState.MISSIONS)} className="bg-zinc-100 text-black py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-zinc-400 uppercase hover:bg-white animate-pulse col-span-2">{t('missions', stats.language)} 🎯</button>}
                </div>

                {!stats.missionsUnlocked && (
                  <button onClick={() => setGameState(GameState.FEEDBACK)} className="w-full bg-zinc-800/90 text-cyan-400 py-3 md:py-4 text-[8px] md:text-xs font-black border-b-2 md:border-b-4 border-cyan-900 uppercase hover:bg-zinc-700">
                    {t('feedback', stats.language)}
                  </button>
                )}
                
                <button onClick={() => setGameState(GameState.FIRE_DASH_GROUP)} className="w-full bg-orange-600 text-white py-3 md:py-4 text-[10px] md:text-xs font-black border-b-2 md:border-b-4 border-orange-900 uppercase hover:bg-orange-500 transition-all shadow-[0_4px_0_rgba(234,88,12,0.5)]">
                  {t('fireDashGroup', stats.language)} 🔥
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {gameState === GameState.PLAYING && (
        <div className="relative w-full h-full max-w-7xl flex flex-col items-center justify-center gap-4 z-20">
          <button onClick={() => setGameState(GameState.MENU)} className="absolute top-4 left-4 z-[100] bg-black/80 hover:bg-red-600 border-2 border-white/30 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all">{t('menu', stats.language)}</button>
          <GameEngine level={currentLevel} gameState={gameState} onDeath={handleDeath} onWin={handleWin} activeSkinId={stats.activeSkinId} lang={stats.language} userStats={stats} releaseGems={activeGemRain > 0} gemCount={activeGemRain} onJackpot={handleJackpot} />
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4">
          <div className="text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 w-full max-w-md bg-zinc-950 p-6 md:p-10 border-8 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <h2 className="text-4xl md:text-6xl font-black text-red-600 italic animate-pulse mb-6 uppercase">SCLERATO! 💀</h2>
            <div className="mb-6 scale-110"><PlayerPreview skinId={stats.activeSkinId} /></div>
            <div className="bg-red-950/40 border-l-4 border-red-600 p-4 mb-8 w-full"><p className="text-red-400 text-xs italic uppercase font-bold">"{lastDeathMessage}"</p></div>
            <div className="flex flex-col gap-4 w-full"><button onClick={startGame} className="bg-red-600 text-white py-5 text-xl font-black border-b-8 border-red-900 uppercase">RIPROVA</button><button onClick={() => setGameState(GameState.MENU)} className="bg-zinc-800 text-white py-4 text-sm font-black border-b-4 border-zinc-950 uppercase">{t('menu', stats.language)}</button></div>
          </div>
        </div>
      )}

      {gameState === GameState.WIN && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4">
          <div className="text-center flex flex-col items-center animate-in zoom-in bg-zinc-900 p-6 md:p-10 border-8 border-green-500 w-full max-w-md shadow-[0_0_50px_rgba(34,197,94,0.5)]">
            <h2 className="text-4xl md:text-6xl font-black text-green-500 animate-bounce mb-6 uppercase tracking-tighter">GRANDE! 🎁</h2>
            <div className="text-2xl text-yellow-400 font-black mb-10 tracking-widest">+150 💎 | +100 XP</div>
            <div className="flex flex-col gap-4 w-full"><button onClick={() => { const nextId = stats.currentLevelId; setCurrentLevel(LEVELS.find(l => l.id === nextId) || generateProceduralLevel(nextId)); setGameState(GameState.PLAYING); }} className="bg-green-600 text-white py-5 px-8 font-black w-full uppercase border-b-8 border-green-900 text-xl">LIVELLO {stats.currentLevelId} →</button><button onClick={() => setGameState(GameState.MENU)} className="bg-zinc-800 text-white py-4 text-sm font-black border-b-4 border-zinc-950 uppercase">{t('menu', stats.language)}</button></div>
          </div>
        </div>
      )}

      {gameState === GameState.DIE_PASS && <DiePass stats={stats} onClaim={handleClaimPassReward} onBuyPlus={handleBuyDiePassPlus} onClose={() => setGameState(GameState.MENU)} lang={stats.language} />}
      {gameState === GameState.LUCKY_SPIN && <LuckySpin lang={stats.language} userGems={stats.gems} onWin={(net) => { setStats(prev => ({ ...prev, gems: prev.gems + net, missions: prev.missions.map(m => m.id === 'm3' ? { ...m, current: m.current + 1 } : m) })); setGameState(GameState.MENU); }} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.SECRET_CODES && <SecretCodes lang={stats.language} onRedeem={handleRedeemCode} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.DAILY_REWARDS && <DailyRewards lang={stats.language} streak={stats.dailyStreak} alreadyClaimed={isDailyClaimed} onClaim={(a) => { setStats(prev => ({ ...prev, gems: prev.gems + a, lastDailyClaim: new Date().toDateString(), dailyStreak: (prev.dailyStreak + 1) % 8 })); setGameState(GameState.MENU); }} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.SKIN_SHOP && <SkinShop lang={stats.language} userGems={stats.gems} unlockedSkins={stats.unlockedSkins} activeSkinId={stats.activeSkinId} membership={stats.membership} onBuy={(s) => setStats(p => ({...p, gems: p.gems - s.price, unlockedSkins: [...p.unlockedSkins, s.id], activeSkinId: s.id}))} onEquip={(id) => setStats(p => ({...p, activeSkinId: id}))} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.PASS_SHOP && <PassShop lang={stats.language} userStats={stats} onBuyDiePassPlus={handleBuyDiePassPlus} onBuyPremium={() => { if(stats.gems >= 5000) setStats(p => ({...p, gems: p.gems - 5000, membership: 'premium'})) }} onBuyVip={() => { if(stats.gems >= 20000) { const vipUnlockable = SKINS.filter(s => !s.isCodeOnly).map(s => s.id); setStats(p => ({...p, gems: p.gems - 20000, membership: 'vip', nameColor: 'rainbow', unlockedSkins: [...new Set([...p.unlockedSkins, ...vipUnlockable])]})); } }} onChangeNameColor={(c) => setStats(p => ({...p, nameColor: c}))} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.FEEDBACK && <Feedback lang={stats.language} username={stats.username} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.FIRE_DASH_GROUP && <FireDashGroup lang={stats.language} onGoToIdea={() => setGameState(GameState.GAME_IDEA)} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.GAME_IDEA && <GameIdea username={stats.username} lang={stats.language} onBack={() => setGameState(GameState.FIRE_DASH_GROUP)} onClose={() => setGameState(GameState.MENU)} />}
      {gameState === GameState.MISSIONS && <Missions missions={stats.missions} onClaim={handleClaimMission} lang={stats.language} onClose={() => setGameState(GameState.MENU)} />}
    </div>
  );
};

export default App;
