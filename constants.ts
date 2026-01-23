
import { LevelData, GameObject, Skin } from './types';

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
];

const createLevel = (id: number, name: string, difficulty: any, objects: GameObject[]): LevelData => ({
  id,
  name,
  difficulty,
  hint: "Molto più fattibile ora, vero?",
  playerStart: { x: 50, y: 600 },
  objects
});

export const LEVELS: LevelData[] = [
  createLevel(1, "Sinfonia Viola", "Hard", [
    { pos: { x: 0, y: 650 }, size: { x: 300, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 300, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    { pos: { x: 400, y: 650 }, size: { x: 600, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 500, y: 630 }, size: { x: 40, y: 20 }, color: NEON_PURPLE, type: 'trap' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(2, "Labirinto di Neon", "Extreme", [
    { pos: { x: 0, y: 650 }, size: { x: 200, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 200, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    { pos: { x: 300, y: 650 }, size: { x: 700, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 350, y: 100 }, size: { x: 80, y: 500 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: true },
    { pos: { x: 650, y: 50 }, size: { x: 80, y: 500 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: true },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(3, "Relax al Neon", "Hard", [
    { pos: { x: 0, y: 650 }, size: { x: 300, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 300, y: 650 }, size: { x: 250, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    // Abbassata a 560 per rendere il salto facilissimo (distanza 90px)
    { pos: { x: 600, y: 560 }, size: { x: 200, y: 30 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 580, y: 100 }, size: { x: 40, y: 250 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: false }, 
    { pos: { x: 820, y: 480 }, size: { x: 180, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 920, y: 430 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
    { pos: { x: 700, y: 0 }, size: { x: 30, y: 60 }, color: NEON_PURPLE, type: 'falling_spike' },
  ]),
  createLevel(4, "Vicinanza Pericolosa", "Hard", [
    // Piattaforma spawn
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    // PRIMA PIATTAFORMA MOLTO PIÙ VICINA (X spostato da 220 a 160, gap di soli 10px!)
    { pos: { x: 160, y: 580 }, size: { x: 200, y: 30 }, color: NEON_PURPLE, type: 'wall' },
    // Trappola spostata più avanti
    { pos: { x: 400, y: 680 }, size: { x: 100, y: 20 }, color: NEON_PURPLE, type: 'trap' },
    // Seconda piattaforma
    { pos: { x: 450, y: 500 }, size: { x: 150, y: 30 }, color: NEON_PURPLE, type: 'opening_floor' },
    // Muro mobile
    { pos: { x: 680, y: 50 }, size: { x: 60, y: 450 }, color: NEON_PURPLE, type: 'moving_wall', isLethal: true },
    // Piattaforma finale
    { pos: { x: 800, y: 560 }, size: { x: 200, y: 30 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 940, y: 510 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
];

export function generateProceduralLevel(levelId: number): LevelData {
  const objects: GameObject[] = [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 900, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ];

  const trapMultiplier = Math.floor(levelId / 3);
  const numPieces = 7 + trapMultiplier;
  let currentX = 150;
  
  for (let i = 0; i < numPieces; i++) {
    const typeRoll = Math.random();
    const width = Math.max(50, 120 - (levelId * 2)) + Math.random() * 100;
    
    if (typeRoll < 0.3) {
      objects.push({ pos: { x: currentX, y: 650 }, size: { x: width, y: 50 }, color: NEON_PURPLE, type: 'wall' });
    } else if (typeRoll < 0.8) {
      objects.push({ pos: { x: currentX, y: 650 }, size: { x: width, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' });
    }

    if (Math.random() > (0.6 - (levelId * 0.01))) {
       objects.push({ pos: { x: currentX + 10, y: 0 }, size: { x: 30, y: 50 }, color: NEON_PURPLE, type: 'falling_spike' });
    }
    
    if (Math.random() > (0.85 - (levelId * 0.01))) {
       const isSpiked = Math.random() > 0.5;
       objects.push({ 
         pos: { x: currentX + 40, y: 100 }, 
         size: { x: 40, y: 400 }, 
         color: NEON_PURPLE, 
         type: 'moving_wall',
         isLethal: isSpiked
       });
    }

    currentX += width + (25 + Math.random() * (40 + levelId)); 
    if (currentX > 850) break;
  }

  return {
    id: levelId,
    name: `Incubo Chiodato ${levelId}`,
    difficulty: levelId > 10 ? "Impossible" : "Extreme",
    hint: "Evita il viola chiodato a ogni costo.",
    playerStart: { x: 50, y: 600 },
    objects
  };
}
