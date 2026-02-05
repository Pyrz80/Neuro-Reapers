
import { Vector, Weapon, WeaponType, EntityType, GameState } from '../types';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, INITIAL_STATS } from '../constants';
import { AudioEngine } from './AudioEngine';

type EnemyArchetype = 'hollow' | 'bat' | 'fragment' | 'boss';

class Particle {
  pos: Vector; vel: Vector; life: number; maxLife: number; color: string; size: number;
  type: 'pixel' | 'line' | 'square';
  constructor(x: number, y: number, color: string, size?: number, type: 'pixel' | 'line' | 'square' = 'pixel') {
    this.pos = { x, y };
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    this.maxLife = Math.random() * 40 + 20; this.life = this.maxLife;
    this.color = color; this.size = size || Math.random() * 4 + 1; this.type = type;
  }
  update() { this.pos.x += this.vel.x; this.pos.y += this.vel.y; this.life--; }
  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife; ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color; ctx.strokeStyle = this.color;
    if (this.type === 'pixel') ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    else if (this.type === 'square') ctx.strokeRect(this.pos.x, this.pos.y, this.size, this.size);
    else { ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.pos.x, this.pos.y); ctx.lineTo(this.pos.x - this.vel.x * 2, this.pos.y - this.vel.y * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
}

class Entity {
  pos: Vector; vel: Vector; radius: number; type: EntityType; hp: number = 10; maxHp: number = 10;
  color: string; isDead: boolean = false;
  constructor(x: number, y: number, radius: number, type: EntityType, color: string) {
    this.pos = { x, y }; this.vel = { x: 0, y: 0 }; this.radius = radius; this.type = type; this.color = color;
  }
  update() { this.pos.x += this.vel.x; this.pos.y += this.vel.y; }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
}

class Enemy extends Entity {
  speed: number; rotation: number = 0; archetype: EnemyArchetype; hitFlash: number = 0;
  sinOffset: number = Math.random() * Math.PI * 2; glitchValue: number = 0;
  constructor(x: number, y: number, speed: number, color: string, hp: number, archetype: EnemyArchetype) {
    super(x, y, archetype === 'fragment' ? 14 : (archetype === 'boss' ? 80 : 22), EntityType.ENEMY, color);
    this.speed = speed; this.hp = hp; this.maxHp = hp; this.archetype = archetype;
  }
  track(target: Vector) {
    const dx = target.x - this.pos.x; const dy = target.y - this.pos.y; const dist = Math.sqrt(dx * dx + dy * dy);
    let moveX = (dx / dist) * this.speed; let moveY = (dy / dist) * this.speed;
    if (this.archetype === 'boss') {
       if (dist < 400) { moveX = 0; moveY = 0; } // Boss stays at distance
    } else if (this.archetype === 'bat') {
      const sideX = -moveY * 0.8; const sideY = moveX * 0.8;
      const sine = Math.sin((Date.now() / 120) + this.sinOffset); moveX += sideX * sine; moveY += sideY * sine;
    }
    this.vel.x = moveX; this.vel.y = moveY; this.rotation += 0.06;
    if (this.hitFlash > 0) this.hitFlash--;
    if (Math.random() > 0.97) this.glitchValue = Math.random() * 12; else this.glitchValue *= 0.85;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const isFlashing = this.hitFlash > 0; const mainColor = isFlashing ? '#ffffff' : this.color;
    ctx.save();
    const gx = (Math.random() - 0.5) * this.glitchValue; const gy = (Math.random() - 0.5) * this.glitchValue;
    ctx.translate(this.pos.x + gx, this.pos.y + gy);
    ctx.shadowBlur = isFlashing ? 45 : 25; ctx.shadowColor = mainColor; ctx.strokeStyle = mainColor; ctx.lineWidth = this.archetype === 'boss' ? 8 : 3;
    if (this.archetype === 'boss') {
        ctx.rotate(this.rotation * 0.2);
        for(let i=0; i<4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
            ctx.strokeRect(-this.radius*0.7, -this.radius*0.7, this.radius*1.4, this.radius*1.4);
        }
        ctx.fillStyle = mainColor + '33'; ctx.fillRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
    } else if (this.archetype === 'hollow') {
        ctx.rotate(this.rotation); ctx.strokeRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
    } else {
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
    const barWidth = this.archetype === 'boss' ? 200 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.pos.x - barWidth/2, this.pos.y - this.radius - 20, barWidth, 6);
    ctx.fillStyle = mainColor; ctx.fillRect(this.pos.x - barWidth/2, this.pos.y - this.radius - 20, (this.hp / this.maxHp) * barWidth, 6);
  }
}

class Projectile extends Entity {
  damage: number; lifetime: number = 2000; createdAt: number = Date.now();
  constructor(x: number, y: number, vel: Vector, damage: number, color: string) {
    super(x, y, 5, EntityType.PROJECTILE, color); this.vel = vel; this.damage = damage;
  }
  update() { super.update(); if (Date.now() - this.createdAt > this.lifetime) this.isDead = true; }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save(); ctx.translate(this.pos.x, this.pos.y); ctx.rotate(Math.atan2(this.vel.y, this.vel.x));
    ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.fillRect(-10, -2, 20, 4); ctx.restore();
  }
}

class Drop extends Entity {
  value: number;
  constructor(x: number, y: number, type: EntityType, color: string, value: number = 10) {
    super(x, y, 12, type, color); this.value = value;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save(); ctx.translate(this.pos.x, this.pos.y); ctx.rotate(Date.now() / 500);
    ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.strokeRect(-8, -8, 16, 16); ctx.restore();
  }
}

export class GameEngine {
  ctx: CanvasRenderingContext2D; audio: AudioEngine; player: Entity; enemies: Enemy[] = []; projectiles: Projectile[] = [];
  shards: any[] = []; drops: Drop[] = []; particles: Particle[] = []; weapons: Weapon[] = [];
  stats: GameState; playerStats = { ...INITIAL_STATS };
  screenShake: number = 0; damageFlash: number = 0; keys: { [key: string]: boolean } = {};
  joystickVector: Vector = { x: 0, y: 0 };
  onLevelUp: (level: number) => void; onGameOver: () => void;
  powerUpTimer: number = 0; powerUpType: 'DAMAGE' | 'FIRE_RATE' | 'NONE' = 'NONE';
  breachLevel: number = 1; bossActive: boolean = false;
  
  glitchTick: number = 0;

  constructor(ctx: CanvasRenderingContext2D, onLevelUp: (level: number) => void, onGameOver: () => void) {
    this.ctx = ctx; this.audio = new AudioEngine(); this.onLevelUp = onLevelUp; this.onGameOver = onGameOver;
    this.player = new Entity(GAME_WIDTH / 2, GAME_HEIGHT / 2, 22, EntityType.PLAYER, COLORS.PLAYER_CORE);
    this.stats = { score: 0, kills: 0, timeElapsed: 0, isGameOver: false, level: 1, experience: 0, nextLevelExp: 80, health: 100, maxHealth: 100 };
    this.weapons.push({ type: WeaponType.DATA_STREAM, level: 1, lastFired: 0, cooldown: 600, damage: 15 });
    window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
  }

  setJoystick(vector: Vector) { this.joystickVector = vector; }

  update(dt: number) {
    if (this.stats.isGameOver) return;
    this.stats.timeElapsed += dt; this.updateDifficulty();
    if (this.screenShake > 0) this.screenShake *= 0.9;
    if (this.damageFlash > 0) this.damageFlash *= 0.85;
    if (this.powerUpTimer > 0) { this.powerUpTimer -= dt; if (this.powerUpTimer <= 0) this.powerUpType = 'NONE'; }

    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;
    if (dx === 0 && dy === 0 && (this.joystickVector.x !== 0 || this.joystickVector.y !== 0)) { dx = this.joystickVector.x; dy = this.joystickVector.y; }

    if (dx !== 0 || dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      this.player.vel.x = (dx / mag) * this.playerStats.SPEED;
      this.player.vel.y = (dy / mag) * this.playerStats.SPEED;
    } else { this.player.vel.x *= 0.85; this.player.vel.y *= 0.85; }

    this.player.update();
    this.player.pos.x = Math.max(0, Math.min(GAME_WIDTH, this.player.pos.x));
    this.player.pos.y = Math.max(0, Math.min(GAME_HEIGHT, this.player.pos.y));

    if (!this.bossActive) {
        const baseSpawnRate = 0.03 + (this.breachLevel * 0.015);
        if (Math.random() < Math.min(0.25, baseSpawnRate)) this.spawnEnemy();
    } else {
        // Special Boss Phase Spawn: Add minions less frequently
        if (Math.random() < 0.01) this.spawnEnemy();
    }

    this.handleWeapons();
    this.particles.forEach(p => p.update()); this.particles = this.particles.filter(p => p.life > 0);

    this.enemies.forEach(e => {
      e.track(this.player.pos); e.update();
      const dist = Math.sqrt((e.pos.x - this.player.pos.x)**2 + (e.pos.y - this.player.pos.y)**2);
      if (dist < e.radius + this.player.radius) {
        this.stats.health -= 1.2; this.screenShake = 15; this.damageFlash = 1.0;
        if (this.stats.health <= 0) { this.stats.isGameOver = true; this.onGameOver(); }
      }
      // Boss Bullet Patterns
      if (e.archetype === 'boss' && Math.random() < 0.05) {
          const angle = Math.random() * Math.PI * 2;
          this.projectiles.push(new Projectile(e.pos.x, e.pos.y, { x: Math.cos(angle)*10, y: Math.sin(angle)*10 }, 10, COLORS.BOSS));
      }
    });

    this.projectiles.forEach(p => {
      p.update();
      this.enemies.forEach(e => {
        const dist = Math.sqrt((p.pos.x - e.pos.x)**2 + (p.pos.y - e.pos.y)**2);
        if (dist < p.radius + e.radius) {
          e.hp -= p.damage; e.hitFlash = 7; p.isDead = true; this.audio.playHit();
          if (e.hp <= 0) {
            e.isDead = true; this.stats.kills++; this.stats.score += e.archetype === 'boss' ? 5000 : 100;
            if (e.archetype === 'boss') { 
                this.bossActive = false; 
                for(let i=0; i<100; i++) this.particles.push(new Particle(e.pos.x, e.pos.y, COLORS.BOSS, 10, 'square'));
            }
            this.shards.push({ pos: { ...e.pos }, vel: {x:0,y:0}, isDead: false, exp: e.archetype === 'boss' ? 500 : 25 });
            if (Math.random() < 0.1) this.drops.push(new Drop(e.pos.x, e.pos.y, EntityType.HEALTH_DROP, COLORS.HEALTH_ORB, 20));
          }
        }
      });
    });

    this.drops.forEach(d => {
      const dist = Math.sqrt((d.pos.x - this.player.pos.x)**2 + (d.pos.y - this.player.pos.y)**2);
      if (dist < this.player.radius + 15) { d.isDead = true; this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 20); }
    });

    this.shards.forEach(s => {
      const dist = Math.sqrt((s.pos.x - this.player.pos.x)**2 + (s.pos.y - this.player.pos.y)**2);
      if (dist < this.playerStats.MAGNET_RADIUS) {
        const dx = this.player.pos.x - s.pos.x, dy = this.player.pos.y - s.pos.y; const mag = Math.sqrt(dx*dx + dy*dy);
        s.pos.x += (dx/mag) * 22; s.pos.y += (dy/mag) * 22;
      }
      if (dist < this.player.radius + 18) { s.isDead = true; this.stats.experience += s.exp; if (this.stats.experience >= this.stats.nextLevelExp) this.levelUp(); }
    });

    this.enemies = this.enemies.filter(e => !e.isDead); this.projectiles = this.projectiles.filter(p => !p.isDead);
    this.shards = this.shards.filter(s => !s.isDead); this.drops = this.drops.filter(d => !d.isDead);
  }

  updateDifficulty() {
    const nextLevel = Math.floor(this.stats.timeElapsed / 45000) + 1;
    if (nextLevel !== this.breachLevel && nextLevel <= 10) {
      this.breachLevel = nextLevel;
      if (this.breachLevel === 5 || this.breachLevel === 10) {
          this.spawnBoss();
      }
    }
  }

  spawnBoss() {
    this.bossActive = true;
    const x = GAME_WIDTH/2, y = -100;
    this.enemies.push(new Enemy(x, y, 2, COLORS.BOSS, 2000 * (this.breachLevel/5), 'boss'));
  }

  spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const x = this.player.pos.x + Math.cos(angle) * 1400;
    const y = this.player.pos.y + Math.sin(angle) * 1400;
    this.enemies.push(new Enemy(x, y, 3 + this.breachLevel * 0.2, COLORS.ENEMY_BASIC, 50 + this.breachLevel * 10, 'hollow'));
  }

  handleWeapons() {
    const now = Date.now();
    this.weapons.forEach(w => {
      let cd = w.cooldown; if (this.powerUpType === 'FIRE_RATE') cd *= 0.5;
      if (now - w.lastFired > cd) {
        const target = this.getClosestEnemy();
        if (target) {
          const dx = target.pos.x - this.player.pos.x, dy = target.pos.y - this.player.pos.y; const mag = Math.sqrt(dx*dx + dy*dy);
          this.projectiles.push(new Projectile(this.player.pos.x, this.player.pos.y, { x: (dx/mag)*20, y: (dy/mag)*20 }, w.damage, COLORS.DATA_STREAM));
          w.lastFired = now;
        }
      }
    });
  }

  getClosestEnemy() {
    let minD = Infinity, closest = null;
    this.enemies.forEach(e => { const d = (e.pos.x - this.player.pos.x)**2 + (e.pos.y - this.player.pos.y)**2; if (d < minD) { minD = d; closest = e; } });
    return closest;
  }

  levelUp() {
    this.stats.level++; this.stats.experience -= this.stats.nextLevelExp;
    this.stats.nextLevelExp *= 1.4; this.onLevelUp(this.stats.level);
  }

  applyPatch(patch: any) {
    if (patch.type === 'WEAPON') {
      const w = this.weapons.find(w => w.type === patch.weaponType);
      if (w) { w.level++; w.damage *= 1.4; w.cooldown *= 0.8; }
      else { this.weapons.push({ type: patch.weaponType, level: 1, lastFired: 0, cooldown: 1000, damage: 20 }); }
    } else { this.playerStats.SPEED += 0.5; }
  }

  draw() {
    this.ctx.save();
    if (this.screenShake > 0.5) this.ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    
    this.ctx.fillStyle = COLORS.BACKGROUND; this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Render logic
    this.particles.forEach(p => p.draw(this.ctx));
    this.shards.forEach(s => {
      this.ctx.fillStyle = COLORS.SHARD; this.ctx.fillRect(s.pos.x-4, s.pos.y-4, 8, 8);
    });
    this.enemies.forEach(e => e.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.drops.forEach(d => d.draw(this.ctx));

    // Player draw (Simplified for this update block)
    this.ctx.fillStyle = COLORS.PLAYER_CORE;
    this.ctx.beginPath(); this.ctx.arc(this.player.pos.x, this.player.pos.y, this.player.radius, 0, Math.PI*2); this.ctx.fill();

    this.ctx.restore();

    // Post Process Glitch
    this.applyGlitchEffects();
  }

  applyGlitchEffects() {
    this.glitchTick++;
    const intensity = (100 - this.stats.health) / 100 + (this.breachLevel * 0.05);
    
    if (Math.random() < intensity * 0.2) {
        const y = Math.random() * GAME_HEIGHT;
        const h = Math.random() * 20 + 5;
        const shift = (Math.random() - 0.5) * 50 * intensity;
        const imageData = this.ctx.getImageData(0, y, GAME_WIDTH, h);
        this.ctx.putImageData(imageData, shift, y);
    }

    if (this.damageFlash > 0.1) {
        this.ctx.fillStyle = `rgba(255, 0, 85, ${this.damageFlash * 0.2})`;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }
}
