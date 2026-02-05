
export interface Vector {
  x: number;
  y: number;
}

export enum EntityType {
  PLAYER,
  ENEMY,
  PROJECTILE,
  SHARD,
  HEALTH_DROP,
  AMMO_DROP
}

export enum WeaponType {
  DATA_STREAM = 'DATA_STREAM',
  FIREWALL_RING = 'FIREWALL_RING',
  LOGIC_BOMB = 'LOGIC_BOMB',
  NEURAL_SPIKE = 'NEURAL_SPIKE'
}

export interface Weapon {
  type: WeaponType;
  level: number;
  lastFired: number;
  cooldown: number;
  damage: number;
}

export interface KernelPatch {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'STAT';
  weaponType?: WeaponType;
  statBoost?: {
    speed?: number;
    health?: number;
    magnet?: number;
    crit?: number;
  };
}

export interface GameState {
  score: number;
  kills: number;
  timeElapsed: number;
  isGameOver: boolean;
  level: number;
  experience: number;
  nextLevelExp: number;
  health: number;
  maxHealth: number;
}
