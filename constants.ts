
import { LevelData, GameObject, Skin, PassReward } from './types';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 700;
export const PLAYER_SIZE = 30;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -13;
export const MOVE_SPEED = 5;

const NEON_PURPLE = '#6d28d9'; 

export const SKINS: Skin[] = [
  { id: 'classic', name: 'CLASSICO', color: '#00ffff', price: 0 },
  { id: 'gold', name: 'ORO', color: '#ffd700', price: 1000 },
  { id: 'ruby', name: 'RUBINO', color: '#ff0055', price: 1500 },
  { id: 'emerald', name: 'SMERALDO', color: '#00ff88', price: 2000 },
  { id: 'ghost', name: 'FANTASMA', color: '#ffffff', price: 5000 },
  { id: 'neon', name: 'NEON X', color: '#ff00ff', price: 0, isVipOnly: true },
  { id: 'inferno', name: 'INFERNO', color: '#ff4500', price: 0, isVipOnly: true },
  { id: 'admin', name: 'ADMIN', color: '#ff0000', price: 0, isCodeOnly: true, isAdmin: true },
  { id: 'admin_power', name: 'ADMIN POWER', color: '#ffffff', price: 0, isCodeOnly: true, isAdmin: true },
  // Esclusive Pass
  { id: 'cyber_ninja', name: 'CYBER NINJA', color: '#00ffcc', price: 0, isCodeOnly: true },
  { id: 'void_walker', name: 'VOID WALKER', color: '#1a1a1a', price: 0, isCodeOnly: true },
  { id: 'glitch_master', name: 'GLITCH MASTER', color: '#ff0055', price: 0, isCodeOnly: true },
  { id: 'dragon_lord', name: 'DRAGON LORD', color: '#ffaa00', price: 0, isCodeOnly: true },
  { id: 'galaxy_god', name: 'GALAXY GOD', color: '#4400ff', price: 0, isCodeOnly: true },
];

// Generazione dinamica di 50 livelli di ricompense
const generatePassRewards = (): PassReward[] => {
  const rewards: PassReward[] = [];
  const exclusiveSkins = ['cyber_ninja', 'void_walker', 'glitch_master', 'dragon_lord', 'galaxy_god'];
  
  for (let i = 1; i <= 50; i++) {
    // XP richiesto cresce esponenzialmente fino a circa 260.000 per il liv 50
    const xpRequired = Math.floor(500 * Math.pow(i, 1.6));
    const isSkinLevel = i % 10 === 0;
    const skinIndex = (i / 10) - 1;

    let freeReward: PassReward['freeReward'] = { type: 'gems', amount: 150 + (i * 30), value: null };
    let plusReward: PassReward['plusReward'] = { type: 'gems', amount: 800 + (i * 150), value: null };

    if (isSkinLevel) {
      if (i === 50) {
        // PREMIO FINALE: ADMIN POWER
        plusReward = { type: 'skin', value: 'admin_power' };
      } else {
        plusReward = { type: 'skin', value: exclusiveSkins[skinIndex] };
      }
    }

    rewards.push({
      level: i,
      xpRequired,
      freeReward,
      plusReward
    });
  }
  return rewards;
};

export const DIE_PASS_REWARDS: PassReward[] = generatePassRewards();

const createLevel = (id: number, name: string, difficulty: any, objects: GameObject[]): LevelData => ({
  id,
  name,
  difficulty,
  hint: "Usa i tuoi poteri se puoi.",
  playerStart: { x: 50, y: 600 },
  objects
});

export const LEVELS: LevelData[] = [
  createLevel(1, "Inizio dello Sclero", "Hard", [
    { pos: { x: 0, y: 650 }, size: { x: 300, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 300, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    { pos: { x: 400, y: 650 }, size: { x: 600, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 500, y: 630 }, size: { x: 40, y: 20 }, color: NEON_PURPLE, type: 'trap' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(2, "Ascensione Neve", "Extreme", [
    { pos: { x: 0, y: 650 }, size: { x: 200, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 200, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    { pos: { x: 300, y: 650 }, size: { x: 700, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 350, y: 100 }, size: { x: 80, y: 500 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: true },
    { pos: { x: 650, y: 50 }, size: { x: 80, y: 500 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: true },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
];

export function generateProceduralLevel(levelId: number): LevelData {
  const objects: GameObject[] = [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 900, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ];

  const trapMultiplier = Math.floor(levelId / 2);
  const numPieces = 8 + trapMultiplier;
  let currentX = 150;
  
  for (let i = 0; i < numPieces; i++) {
    const typeRoll = Math.random();
    const width = Math.max(40, 100 - (levelId * 2)) + Math.random() * 80;
    
    if (typeRoll < 0.4) {
      objects.push({ pos: { x: currentX, y: 650 }, size: { x: width, y: 50 }, color: NEON_PURPLE, type: 'wall' });
    } else {
      objects.push({ pos: { x: currentX, y: 650 }, size: { x: width, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' });
    }

    if (Math.random() > 0.5) {
       objects.push({ pos: { x: currentX + 10, y: 0 }, size: { x: 30, y: 50 }, color: NEON_PURPLE, type: 'falling_spike' });
    }

    currentX += width + (30 + Math.random() * (40 + levelId)); 
    if (currentX > 850) break;
  }

  return {
    id: levelId,
    name: `Caos Procedurale ${levelId}`,
    difficulty: levelId > 15 ? "Impossible" : "Extreme",
    hint: "L'ADMIN POWER non teme il caos.",
    playerStart: { x: 50, y: 600 },
    objects
  };
}
