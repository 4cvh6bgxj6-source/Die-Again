
import { LevelData, GameObject, Skin, PassReward, Item } from './types';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const PLAYER_SIZE = 30;
export const GRAVITY = 0.6; // Back to original for better balance
export const JUMP_FORCE = -15.0; // Slightly higher jump as requested
export const MOVE_SPEED = 5;

export const NAME_COLORS = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

const NEON_PURPLE = '#6d28d9'; 

export interface WorldDef {
  id: number;
  name: string;
  theme: string;
  desc: string;
  bgStart: string;
  bgEnd: string;
  wallColor: string;
  trapColor: string;
}

export const WORLDS: WorldDef[] = [
  { id: 1, name: "Neon City", theme: "cyber", desc: "La città neon dove tutto è iniziato.", bgStart: "#050b18", bgEnd: "#1e102e", wallColor: "#6d28d9", trapColor: "#ff0000" },
  { id: 2, name: "Foresta Tossica", theme: "toxic", desc: "Verde, acido e mortale.", bgStart: "#0a1a0f", bgEnd: "#113318", wallColor: "#22c55e", trapColor: "#eab308" },
  { id: 3, name: "Deserto Infernale", theme: "desert", desc: "Un caldo infernale tra dune mortali.", bgStart: "#2a0a00", bgEnd: "#1a0500", wallColor: "#ea580c", trapColor: "#dc2626" },
  { id: 4, name: "Ghiacciaio Spezzato", theme: "ice", desc: "Il freddo ti congelerà i riflessi.", bgStart: "#051525", bgEnd: "#00051a", wallColor: "#38bdf8", trapColor: "#818cf8" },
  { id: 5, name: "Cimitero dei Gamer", theme: "spooky", desc: "Qui riposano coloro che hanno quittato.", bgStart: "#1a0a25", bgEnd: "#05000a", wallColor: "#7e22ce", trapColor: "#14b8a6" },
  { id: 6, name: "Abisso Ruggente", theme: "abyss", desc: "Oceani scuri carichi di elettricità.", bgStart: "#001020", bgEnd: "#00000a", wallColor: "#0284c7", trapColor: "#facc15" },
  { id: 7, name: "Vuoto Assoluto", theme: "void", desc: "La fine dello spazio e del tempo.", bgStart: "#000000", bgEnd: "#200000", wallColor: "#475569", trapColor: "#f43f5e" }
];

export const getWorldForLevel = (levelId: number): WorldDef => {
  if (levelId > 350) return WORLDS[6];
  const worldIndex = Math.floor((levelId - 1) / 50);
  return WORLDS[Math.max(0, Math.min(6, worldIndex))];
};

const generateSkins = (): Skin[] => {
  const baseSkins: Skin[] = [
    { id: 'classic', name: 'CLASSICO', color: '#00ffff', price: 0 },
    { id: 'rainbow', name: 'ARCOBALENO', color: 'rainbow', price: 5000, isRainbow: true },
    { id: 'gold', name: 'ORO', color: '#ffd700', price: 1000 },
    { id: 'ruby', name: 'RUBINO', color: '#ff0055', price: 1500 },
    { id: 'emerald', name: 'SMERALDO', color: '#00ff88', price: 2000 },
    { id: 'ghost', name: 'FANTASMA', color: '#ffffff', price: 5000 },
    { id: 'neon', name: 'NEON X', color: '#ff00ff', price: 8000 },
    { id: 'inferno', name: 'INFERNO', color: '#ff4500', price: 10000 },
    { id: 'admin', name: 'ADMIN', color: '#ff0000', price: 0, isCodeOnly: true, isAdmin: true, ability: 'fly' },
    { id: 'admin_power', name: 'ADMIN POWER', color: '#ffffff', price: 0, isCodeOnly: true, isAdmin: true, ability: 'fly' },
    { id: 'cyber_ninja', name: 'CYBER NINJA', color: '#00ffcc', price: 12000 },
    { id: 'void_walker', name: 'VOID WALKER', color: '#1a1a1a', price: 15000 },
    { id: 'glitch_master', name: 'GLITCH MASTER', color: '#ff0055', price: 18000 },
    { id: 'dragon_lord', name: 'DRAGON LORD', color: '#ffaa00', price: 25000 },
    { id: 'galaxy_god', name: 'GALAXY GOD', color: '#4400ff', price: 50000, ability: 'fly' },
  ];

  const adjectives = [
    'Oscuro', 'Luminoso', 'Antico', 'Futuristico', 'Mistico', 'Radiante', 'Eterno', 'Spettrale', 'Divino', 'Corrotto', 
    'Galattico', 'Cibernetico', 'Vulcanico', 'Glaciale', 'Tempestoso', 'Silenzioso', 'Leggendario', 'Mitico', 'Arcano', 'Solare',
    'Lunare', 'Stellare', 'Abissale', 'Celestiale', 'Infernale', 'Supremo', 'Primordiale', 'Infinito', 'Ombroso', 'Fiammeggiante',
    'Poppante', 'Sclerato', 'Puzzolente', 'Buffo', 'Goffo', 'Sfigato', 'Potente', 'Incazzato', 'Pigro', 'Goloso'
  ];
  const nouns = [
    'Guerriero', 'Mago', 'Ombra', 'Spirito', 'Cavaliere', 'Demone', 'Angelo', 'Viaggiatore', 'Guardiano', 'Predatore', 
    'Re', 'Signore', 'Maestro', 'Ninja', 'Samurai', 'Drago', 'Titano', 'Avatar', 'Eroe', 'Vagabondo',
    'Assassino', 'Monaco', 'Paladino', 'Stregone', 'Cacciatore', 'Esploratore', 'Ribelle', 'Saggio', 'Profeta', 'Erede',
    'Nabbo', 'Pro', 'Ciccio', 'Bimbo', 'Nonno', 'Tizio', 'Caio', 'Sempronio', 'Pazzo', 'Scemo'
  ];

  const extraSkins: Skin[] = [];
  for (let i = 0; i < 110; i++) {
    const adj = adjectives[i % adjectives.length];
    const noun = nouns[Math.floor(i / adjectives.length) % nouns.length];
    const hue = (i * 137.5) % 360;
    extraSkins.push({
      id: `skin_${i}`,
      name: `${adj} ${noun}`.toUpperCase(),
      color: `hsl(${hue}, 70%, 50%)`,
      price: 500 + (i * 150)
    });
  }

  return [...baseSkins, ...extraSkins];
};

export const SKINS: Skin[] = generateSkins();

export const ITEMS: Item[] = [
  // Hats
  { id: 'hat_cap_red', name: 'Cappellino Rosso', type: 'hat', price: 1000 },
  { id: 'hat_cap_blue', name: 'Cappellino Blu', type: 'hat', price: 1000 },
  { id: 'hat_crown', name: 'Corona d\'Oro', type: 'hat', price: 10000 },
  { id: 'hat_duck', name: 'Cappello Paperella', type: 'hat', price: 5000 },
  // Eyewear
  { id: 'eye_sunglasses', name: 'Occhiali da Sole', type: 'eyewear', price: 1500 },
  { id: 'eye_nerd', name: 'Occhiali Nerd', type: 'eyewear', price: 800 },
  // Shirts
  { id: 'shirt_duck', name: 'Maglia Paperella', type: 'shirt', price: 3000 },
  { id: 'shirt_tshirt_white', name: 'T-Shirt Bianca', type: 'shirt', price: 500 },
  // Pants
  { id: 'pants_jeans', name: 'Pants Jeans', type: 'pants', price: 1200 },
  { id: 'pants_shorts', name: 'Pantaloncini Estivi', type: 'pants', price: 900 },
  { id: 'pants_duck', name: 'Pantaloni Paperella', type: 'pants', price: 3000 },
  // Shoes
  { id: 'shoes_sneakers', name: 'Scarpe Sportive', type: 'shoes', price: 2000 },
  { id: 'shoes_boots', name: 'Stivali di Gomma', type: 'shoes', price: 1500 },
  { id: 'shoes_yellow', name: 'Scarpe Gialle', type: 'shoes', price: 1800 },
  { id: 'shoes_white', name: 'Scarpe Bianche', type: 'shoes', price: 1800 },
  { id: 'shoes_orange', name: 'Scarpe Arancioni', type: 'shoes', price: 1800 },
  { id: 'shoes_duck_vip', name: 'Scarpe Paperella', type: 'shoes', price: 0, isVipOnly: true },
];

// Generazione dinamica di 50 livelli di ricompense
const generatePassRewards = (): PassReward[] => {
  const rewards: PassReward[] = [];
  const exclusiveSkins = ['cyber_ninja', 'void_walker', 'glitch_master', 'dragon_lord', 'galaxy_god'];
  const exclusiveItems = ['hat_crown_gold', 'eye_laser', 'shirt_rainbow', 'pants_galactic', 'shoes_fire'];
  
  for (let i = 1; i <= 50; i++) {
    const xpRequired = Math.floor(500 * Math.pow(i, 1.6));
    const isSkinLevel = i % 10 === 0;
    const isItemLevel = i % 5 === 0 && !isSkinLevel;
    const skinIndex = (i / 10) - 1;
    const itemIndex = (i / 5) - 1;

    let freeReward: PassReward['freeReward'] = { type: 'gems', amount: 300 + (i * 50), value: null };
    let plusReward: PassReward['plusReward'] = { type: 'gems', amount: 1500 + (i * 200), value: null };

    if (isSkinLevel) {
      if (i === 50) {
        plusReward = { type: 'skin', value: 'admin_power' };
      } else {
        plusReward = { type: 'skin', value: exclusiveSkins[skinIndex] };
      }
    } else if (isItemLevel) {
       plusReward = { type: 'skin', value: exclusiveItems[itemIndex % exclusiveItems.length] }; // value used for items too
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
  objects,
  worldId: 1
});

export const LEVELS: LevelData[] = [
  createLevel(1, "Inizio dello Sclero", "Hard", [
    { pos: { x: 0, y: 650 }, size: { x: 300, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 300, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' }, 
    { pos: { x: 350, y: 630 }, size: { x: 30, y: 20 }, color: '#ff0000', type: 'trap' },
    { pos: { x: 450, y: 650 }, size: { x: 200, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 650, y: 650 }, size: { x: 60, y: 50 }, color: NEON_PURPLE, type: 'wall', isLethal: true }, // Smaller trap
    { pos: { x: 710, y: 650 }, size: { x: 290, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 500, y: 630 }, size: { x: 40, y: 20 }, color: '#ff0000', type: 'trap' },
    { pos: { x: 800, y: 0 }, size: { x: 30, y: 50 }, color: NEON_PURPLE, type: 'falling_spike' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(2, "Ascensione Infernale", "Extreme", [
    { pos: { x: 0, y: 650 }, size: { x: 200, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 200, y: 650 }, size: { x: 150, y: 50 }, color: '#ff4500', type: 'wall', isLethal: true }, 
    { pos: { x: 350, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'opening_floor' },
    { pos: { x: 500, y: 650 }, size: { x: 500, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 350, y: 200 }, size: { x: 80, y: 300 }, color: '#ff0000', type: 'moving_wall', isLethal: true },
    { pos: { x: 650, y: 150 }, size: { x: 80, y: 300 }, color: '#ff0000', type: 'moving_wall', isLethal: true },
    { pos: { x: 500, y: 630 }, size: { x: 40, y: 20 }, color: '#ff0000', type: 'trap' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(3, "Il Labirinto Invisibile", "Extreme", [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 250, y: 550 }, size: { x: 100, y: 30 }, color: NEON_PURPLE, type: 'invisible_wall' },
    { pos: { x: 450, y: 450 }, size: { x: 100, y: 30 }, color: NEON_PURPLE, type: 'invisible_wall' },
    { pos: { x: 650, y: 350 }, size: { x: 100, y: 30 }, color: NEON_PURPLE, type: 'invisible_wall' },
    { pos: { x: 250, y: 600 }, size: { x: 500, y: 20 }, color: '#ff0000', type: 'trap' },
    { pos: { x: 850, y: 300 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(4, "Venti di Sventura", "Impossible", [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 200, y: 400 }, size: { x: 600, y: 250 }, color: 'rgba(255, 255, 255, 0.1)', type: 'wind_zone' }, 
    { pos: { x: 200, y: 630 }, size: { x: 600, y: 20 }, color: '#ff0000', type: 'trap' },
    { pos: { x: 850, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 900, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(5, "Inversione Fatale", "Impossible", [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 250, y: 100 }, size: { x: 400, y: 550 }, color: 'rgba(255, 0, 255, 0.1)', type: 'reverse_controls' },
    { pos: { x: 300, y: 500 }, size: { x: 100, y: 20 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 500, y: 400 }, size: { x: 100, y: 20 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 750, y: 650 }, size: { x: 250, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(6, "La Trappola del Destino", "Impossible", [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 300, y: 600 }, size: { x: 30, y: 30 }, color: '#00ff00', type: 'fake_goal' },
    { pos: { x: 450, y: 650 }, size: { x: 100, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 600, y: 500 }, size: { x: 50, y: 50 }, color: '#ff0000', type: 'teleport_trap' },
    { pos: { x: 750, y: 650 }, size: { x: 250, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
  createLevel(7, "Sogno o Son Desto?", "Impossible", [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 200, y: 500 }, size: { x: 600, y: 40 }, color: NEON_PURPLE, type: 'fake_wall' },
    { pos: { x: 200, y: 540 }, size: { x: 600, y: 20 }, color: '#ff0000', type: 'illusory_trap' },
    { pos: { x: 850, y: 650 }, size: { x: 150, y: 50 }, color: NEON_PURPLE, type: 'wall' },
    { pos: { x: 900, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ]),
];

export function generateProceduralLevel(levelId: number): LevelData {
  const world = getWorldForLevel(levelId);

  const objects: GameObject[] = [
    { pos: { x: 0, y: 650 }, size: { x: 150, y: 50 }, color: world.wallColor, type: 'wall' },
    { pos: { x: 900, y: 650 }, size: { x: 100, y: 50 }, color: world.wallColor, type: 'wall' },
    { pos: { x: 950, y: 600 }, size: { x: 40, y: 40 }, color: '#00ff00', type: 'goal' },
  ];

  const trapMultiplier = Math.floor(levelId / 4); // Increment difficulty
  const numPieces = 6 + trapMultiplier;
  let currentX = 150;
  let currentY = 650;
  let lastType: string = 'wall';
  
  for (let i = 0; i < numPieces; i++) {
    const typeRoll = Math.random();
    const width = Math.max(50, 100 - (levelId * 1)) + Math.random() * 60; // Wider platforms
    
    if (Math.random() > 0.8) {
      const yChange = (Math.random() > 0.5 ? -1 : 1) * 60;
      currentY = Math.max(400, Math.min(650, currentY + yChange));
    }

    let pieceType: 'wall' | 'opening_floor' = 'wall';
    let isLethal = false;
    let color = world.wallColor;

    if (typeRoll < 0.65) {
      pieceType = 'wall';
    } else if (typeRoll < 0.7) { 
      pieceType = 'opening_floor';
    } else if (typeRoll < 0.85) { 
      pieceType = 'wall';
      isLethal = true;
      color = world.trapColor;
    } else {
      pieceType = 'wall';
    }

    objects.push({ 
      pos: { x: currentX, y: currentY }, 
      size: { x: width, y: 50 }, 
      color: color, 
      type: pieceType,
      isLethal: isLethal
    });

    lastType = isLethal ? 'hidden_trap' : pieceType;

    const airTrapRoll = Math.random();
    if (airTrapRoll > 0.5) { 
       if (airTrapRoll > 0.8) {
         objects.push({ pos: { x: currentX + 10, y: currentY - 500 }, size: { x: 30, y: 50 }, color: world.trapColor, type: 'falling_spike' });
       } else {
         objects.push({ 
           pos: { x: currentX + 20, y: currentY - 450 }, 
           size: { x: 60, y: 120 }, 
           color: world.trapColor, 
           type: 'moving_wall', 
           isLethal: true 
         });
       }
    }

    if (Math.random() > 0.6 && !isLethal && pieceType === 'wall') { 
      objects.push({ pos: { x: currentX + width / 4, y: currentY - 20 }, size: { x: 30, y: 20 }, color: world.trapColor, type: 'trap' });
      if (width > 120) {
        objects.push({ pos: { x: currentX + (width * 3) / 4, y: currentY - 20 }, size: { x: 30, y: 20 }, color: world.trapColor, type: 'trap' });
      }
    }

    currentX += width + (15 + Math.random() * (20 + levelId)); 
    if (currentX > 850) break;
  }

  return {
    id: levelId,
    name: `${world.name} - Livello ${levelId - ((world.id - 1) * 50)}`,
    difficulty: levelId > 100 ? "Impossible" : levelId > 50 ? "Extreme" : "Hard",
    hint: world.desc,
    playerStart: { x: 50, y: 600 },
    objects,
    worldId: world.id
  };
}
