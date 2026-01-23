
export enum GameState {
  REGISTRATION,
  MENU,
  LUCKY_SPIN,
  DAILY_REWARDS,
  SKIN_SHOP,
  FEEDBACK,
  PLAYING,
  GAMEOVER,
  WIN
}

export type Language = 'it' | 'en';

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  pos: Vector2D;
  size: Vector2D;
  color: string;
  type: 'player' | 'wall' | 'trap' | 'goal' | 'moving_wall' | 'falling_spike' | 'disappearing_floor' | 'opening_floor';
  isLethal?: boolean;
  state?: any;
}

export interface LevelData {
  id: number;
  name: string;
  objects: GameObject[];
  playerStart: Vector2D;
  difficulty: 'Hard' | 'Extreme' | 'Impossible';
  hint: string;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface UserStats {
  username: string;
  deaths: number;
  gems: number;
  currentLevelId: number;
  lastDailyClaim: string | null;
  dailyStreak: number;
  unlockedSkins: string[];
  activeSkinId: string;
  language: Language;
}
