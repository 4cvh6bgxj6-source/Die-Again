
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, LevelData, GameObject, Vector2D, Language, UserStats } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, SKINS, generateProceduralLevel, getWorldForLevel } from '../constants';
import { t } from '../i18n';

interface GameEngineProps {
  level: LevelData;
  onDeath: () => void;
  onWin: () => void;
  gameState: GameState;
  activeSkinId: string;
  lang: Language;
  userStats: UserStats;
  releaseGems?: boolean;
  gemCount?: number;
  onJackpot?: () => void;
}

interface FireParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  life: number;
}

const GameEngine: React.FC<GameEngineProps> = ({ level: initialLevel, onDeath, onWin, gameState, activeSkinId, lang, userStats, releaseGems, gemCount = 0, onJackpot }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<FireParticle[]>([]);
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];
  const isVip = userStats.membership === 'vip';
  const isUltimateAdmin = activeSkinId === 'admin_power';
  const isAdmin = activeSkin.isAdmin || isUltimateAdmin;
  
  const equippedItems = userStats.equippedItems;

  const [level, setLevel] = useState(initialLevel);
  const [adminFly, setAdminFly] = useState(isUltimateAdmin || activeSkin.ability === 'fly');
  const [adminNoTraps, setAdminNoTraps] = useState(isUltimateAdmin);

  const playerRef = useRef({
    pos: { ...initialLevel.playerStart },
    vel: { x: 0, y: 0 },
    isGrounded: false,
    deaths: 0,
    facingRight: true,
    isMoving: false
  });

  const [player, setPlayer] = useState(playerRef.current);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 }); 
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  const isDeadRef = useRef(false);
  
  const objectsStateRef = useRef<any[]>([]);
  const collectedGemsCount = useRef(0);
  const totalGemsReleased = useRef(0);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      checkTouch();
    });
  }, []);

  const resetObjects = useCallback((targetLevel: LevelData) => {
    const baseObjects = targetLevel.objects.map(obj => ({
      ...obj,
      currentPos: { ...obj.pos },
      initialPos: { ...obj.pos },
      dir: obj.type === 'moving_wall' ? 1 : 0,
      active: true,
      timer: 0,
      tremble: 0
    }));

    if (releaseGems && gemCount > 0) {
      collectedGemsCount.current = 0;
      totalGemsReleased.current = gemCount;
      for (let i = 0; i < gemCount; i++) {
        baseObjects.push({
          type: 'collectible_gem',
          pos: { 
            x: 50 + Math.random() * (CANVAS_WIDTH - 100), 
            y: 50 + Math.random() * (CANVAS_HEIGHT - 150) 
          },
          currentPos: { x: 0, y: 0 },
          initialPos: { x: 0, y: 0 },
          size: { x: 30, y: 30 },
          color: '#fbbf24',
          active: true,
          timer: Math.random() * 10,
          tremble: 0,
          dir: 0
        });
        const last = baseObjects[baseObjects.length - 1];
        last.currentPos = { ...last.pos };
      }
    } else {
      totalGemsReleased.current = 0;
    }

    objectsStateRef.current = baseObjects;
  }, [releaseGems, gemCount]);

  useEffect(() => {
    setLevel(initialLevel);
    resetObjects(initialLevel);
    isDeadRef.current = false;
    const initialPlayer = { ...playerRef.current, pos: { ...initialLevel.playerStart }, vel: { x: 0, y: 0 }, facingRight: true, isMoving: false };
    playerRef.current = initialPlayer;
    setPlayer(initialPlayer);
    if (isUltimateAdmin) {
      setAdminFly(true);
      setAdminNoTraps(true);
    }
  }, [initialLevel, resetObjects, isUltimateAdmin]);

  const triggerDeath = useCallback(() => {
    if (adminNoTraps || isDeadRef.current || gameState !== GameState.PLAYING) return;
    isDeadRef.current = true;
    onDeath();
  }, [onDeath, adminNoTraps, gameState]);

  const destroyMap = () => {
    if (!isUltimateAdmin) return;
    objectsStateRef.current = objectsStateRef.current.filter(obj => 
      obj.type === 'goal' || obj.type === 'collectible_gem' || obj.type === 'wall'
    );
  };

  const createNewMap = () => {
    if (!isUltimateAdmin) return;
    const newLvl = generateProceduralLevel(level.id);
    setLevel(newLvl);
    resetObjects(newLvl);
    const resetPlayer = { ...playerRef.current, pos: { ...newLvl.playerStart }, vel: { x: 0, y: 0 }, isMoving: false };
    playerRef.current = resetPlayer;
    setPlayer(resetPlayer);
  };

  const checkCollision = (p: Vector2D, objState: any) => {
    if (!objState.active) return false;
    if (!isVip && !isAdmin && objState.type === 'opening_floor' && objState.timer > 40) return false;
    const renderY = objState.currentPos.y + (objState.type === 'opening_floor' ? objState.tremble : 0);
    return (
      p.x < objState.currentPos.x + objState.size.x &&
      p.x + PLAYER_SIZE > objState.currentPos.x &&
      p.y < renderY + objState.size.y &&
      p.y + PLAYER_SIZE > renderY
    );
  };

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING || isDeadRef.current) return;

    // Update Fire Particles
    particles.current.forEach(p => {
      p.y -= p.speed;
      p.x += (Math.random() - 0.5) * 2; // Tremolio orizzontale
      p.life -= 0.01;
      
      if (p.y < 0 || p.life <= 0) {
        p.y = CANVAS_HEIGHT + 10;
        p.x = Math.random() * CANVAS_WIDTH;
        p.life = 1;
        p.speed = Math.random() * 3 + 1;
        
        // Randomize fire color on reset
        const colors = ['#ef4444', '#f97316', '#eab308', '#dc2626'];
        p.color = colors[Math.floor(Math.random() * colors.length)];
      }
    });

    const prev = playerRef.current;
    let nextPos = { ...prev.pos };
    let nextVel = { ...prev.vel };
    let nextGrounded = false;
    let nextFacing = prev.facingRight;
    let moving = false;

    if (keys.current['ArrowLeft'] || keys.current['KeyA'] || keys.current['VirtualLeft']) {
      nextVel.x = -MOVE_SPEED; nextFacing = false; moving = true;
    } else if (keys.current['ArrowRight'] || keys.current['KeyD'] || keys.current['VirtualRight']) {
      nextVel.x = MOVE_SPEED; nextFacing = true; moving = true;
    } else { nextVel.x = 0; }

    // Ability: Fly
    if (adminFly) {
      if (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['VirtualUp']) { nextVel.y = -MOVE_SPEED; moving = true; }
      else if (keys.current['ArrowDown'] || keys.current['KeyS'] || keys.current['VirtualDown']) { nextVel.y = MOVE_SPEED; moving = true; }
      else nextVel.y = 0;
      nextGrounded = true;
    } else {
      if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space'] || keys.current['VirtualJump']) && prev.isGrounded) {
        nextVel.y = JUMP_FORCE;
      }
      nextVel.y += GRAVITY;
    }

    nextPos.x += nextVel.x; nextPos.y += nextVel.y;

    if (nextPos.x < 0) nextPos.x = 0;
    if (nextPos.x > CANVAS_WIDTH - PLAYER_SIZE) nextPos.x = CANVAS_WIDTH - PLAYER_SIZE;
    
    if (nextPos.y > CANVAS_HEIGHT) { 
      triggerDeath(); 
      requestRef.current = requestAnimationFrame(update);
      return; 
    }

    let diedThisFrame = false;
    let wonThisFrame = false;

    objectsStateRef.current.forEach((obj) => {
      if (!obj.active) return;

      if (obj.type === 'wind_zone') {
        if (checkCollision(nextPos, obj)) {
          nextPos.x += 1.5; // Spinta del vento
        }
      }

      if (obj.type === 'reverse_controls') {
        if (checkCollision(nextPos, obj)) {
          // handled implicitly if we modify the input logic, 
          // but here we can just apply a force in opposite direction of movement
          if (nextVel.x > 0) nextPos.x -= 8;
          else if (nextVel.x < 0) nextPos.x += 8;
        }
      }

      if (obj.type === 'collectible_gem') {
        obj.timer += 0.15;
        obj.currentPos.y = obj.pos.y + Math.sin(obj.timer) * 15;
        if (checkCollision(nextPos, obj)) {
          obj.active = false; collectedGemsCount.current++;
          if (collectedGemsCount.current === totalGemsReleased.current && totalGemsReleased.current > 0) onJackpot?.();
        }
        return;
      }
      if (obj.type === 'opening_floor') {
        const dist = Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x / 2));
        if (dist < 100 && obj.timer === 0) obj.timer = 1;
        if (obj.timer > 0) {
          obj.timer++;
          if (obj.timer < 40) obj.tremble = Math.sin(obj.timer * 0.8) * 3;
          else if (!isVip && !isAdmin) { obj.tremble = 0; obj.currentPos.y += 20; if (obj.currentPos.y > CANVAS_HEIGHT + 200) obj.active = false; }
        }
      }
      if (obj.type === 'moving_wall') {
         const range = 300;
         const speed = (isVip || isAdmin) ? (5 + (level.id * 0.2)) * 0.5 : 5 + (level.id * 0.2);
         obj.currentPos.y += obj.dir * speed;
         if (Math.abs(obj.currentPos.y - obj.initialPos.y) > range) obj.dir *= -1;
      }
      if (obj.type === 'falling_spike') {
         if (obj.dir === 0 && Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x/2)) < 80) obj.dir = 1;
         if (obj.dir === 1) obj.currentPos.y += 25;
      }
      if (checkCollision(nextPos, obj)) {
        if (obj.isLethal || obj.type === 'trap' || obj.type === 'falling_spike' || obj.type === 'teleport_trap' || obj.type === 'fake_goal') {
          if (!adminNoTraps) {
            if (obj.type === 'teleport_trap') {
               nextPos = { x: 50, y: 600 }; // Reset position without dying
            } else if (obj.type === 'fake_goal') {
               diedThisFrame = true;
            } else {
               diedThisFrame = true;
            }
          }
        } else if (obj.type === 'wall' || obj.type === 'moving_wall' || obj.type === 'disappearing_floor' || obj.type === 'opening_floor') {
          const currentObjY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
          if (prev.pos.y + PLAYER_SIZE <= currentObjY + 15) {
            nextPos.y = currentObjY - PLAYER_SIZE; nextVel.y = 0; nextGrounded = true;
            if (obj.type === 'disappearing_floor' && !isVip && !isAdmin) { obj.timer++; if (obj.timer > 30) obj.active = false; }
          } else if (!adminFly) {
            if (prev.pos.y >= currentObjY + obj.size.y - 15) { nextPos.y = currentObjY + obj.size.y; nextVel.y = 1; }
            else if (prev.pos.x + PLAYER_SIZE <= obj.currentPos.x + 15) { nextPos.x = obj.currentPos.x - PLAYER_SIZE; }
            else if (prev.pos.x >= obj.currentPos.x + obj.size.x - 15) { nextPos.x = obj.currentPos.x + obj.size.x; }
          }
        } else if (obj.type === 'goal') { wonThisFrame = true; }
      }
    });

    if (diedThisFrame) { 
      triggerDeath(); 
    } else if (wonThisFrame) {
      onWin();
    } else {
      const nextPlayerState = { ...prev, pos: nextPos, vel: nextVel, isGrounded: nextGrounded, facingRight: nextFacing, isMoving: moving };
      playerRef.current = nextPlayerState;
      setPlayer(nextPlayerState);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, level, onWin, triggerDeath, isVip, isAdmin, adminFly, adminNoTraps, onJackpot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(update);
    
    // Init fire particles
    const initParticles: FireParticle[] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#dc2626'];
    for (let i = 0; i < 200; i++) {
      initParticles.push({ 
        x: Math.random() * CANVAS_WIDTH, 
        y: Math.random() * CANVAS_HEIGHT + CANVAS_HEIGHT/2, // Start mostly near bottom
        size: Math.random() * 4 + 2, 
        speed: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random()
      });
    }
    particles.current = initParticles;

    return () => {
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      const worldTheme = getWorldForLevel(level.id);
      
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, worldTheme.bgStart); grad.addColorStop(1, worldTheme.bgEnd);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Render Fire Particles
      particles.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size); // Draw squares (pixels)
      });
      ctx.globalAlpha = 1.0;

      objectsStateRef.current.forEach((obj) => {
        if (!obj.active) return;
        const renderY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
        
        // Hidden Trap Visibility Logic
        let finalColor = obj.color;
        if (obj.isLethal && obj.type === 'wall' && !adminNoTraps) {
          const dist = Math.sqrt(Math.pow(player.pos.x - obj.currentPos.x, 2) + Math.pow(player.pos.y - obj.currentPos.y, 2));
          if (dist < 150) {
            // Start showing red tint when close
            const intensity = Math.max(0, 1 - (dist / 150));
            finalColor = `rgb(${Math.floor(109 + intensity * 146)}, ${Math.floor(40 - intensity * 40)}, ${Math.floor(217 - intensity * 217)})`;
          }
        }

        ctx.fillStyle = (adminNoTraps && (obj.isLethal || obj.type === 'trap' || obj.type === 'falling_spike')) ? '#222' : finalColor;
        
        if (obj.type === 'falling_spike' || obj.type === 'trap' || obj.type === 'illusory_trap') {
           ctx.beginPath(); 
           if (obj.type === 'falling_spike') { ctx.moveTo(obj.currentPos.x, renderY); ctx.lineTo(obj.currentPos.x + obj.size.x / 2, renderY + obj.size.y); ctx.lineTo(obj.currentPos.x + obj.size.x, renderY); } 
           else { ctx.moveTo(obj.currentPos.x, renderY + obj.size.y); ctx.lineTo(obj.currentPos.x + obj.size.x / 2, renderY); ctx.lineTo(obj.currentPos.x + obj.size.x, renderY + obj.size.y); }
           ctx.fill();
        } else if (obj.type === 'wind_zone' || obj.type === 'reverse_controls') {
           ctx.globalAlpha = 0.2;
           ctx.fillRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y);
           ctx.globalAlpha = 1.0;
           if (obj.type === 'wind_zone') {
              ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
              for(let i=0; i<3; i++) {
                const yOff = (Date.now() / 10 + i * 20) % obj.size.y;
                ctx.beginPath(); ctx.moveTo(obj.currentPos.x, renderY + yOff); ctx.lineTo(obj.currentPos.x + obj.size.x, renderY + yOff); ctx.stroke();
              }
           }
        } else { 
           ctx.fillRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y); 
           if (obj.type === 'wall' || obj.type === 'fake_wall' || obj.type === 'moving_wall') {
              ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.strokeRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y);
           }
           if (obj.type === 'goal' || obj.type === 'fake_goal') {
              ctx.shadowBlur = 20; ctx.shadowColor = obj.color;
              ctx.strokeRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y);
              ctx.shadowBlur = 0;
           }
        }
      });

      // Player Render
      ctx.save(); ctx.translate(player.pos.x + PLAYER_SIZE/2, player.pos.y + PLAYER_SIZE/2);
      if (!player.facingRight) ctx.scale(-1, 1);
      
      let skinColor = activeSkin.color;
      if (activeSkin.isRainbow) {
         const hue = (Date.now() / 10) % 360;
         skinColor = `hsl(${hue}, 100%, 50%)`;
      } else if (isUltimateAdmin) {
         skinColor = `hsl(${Date.now() % 360}, 100%, 70%)`;
      } else if (activeSkin.isAdmin) {
         skinColor = `hsl(${Date.now() % 360}, 100%, 50%)`;
      }

      ctx.strokeStyle = skinColor; ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      if (isUltimateAdmin || activeSkin.isRainbow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = skinColor;
      }

      // Testa
      ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.stroke();
      // Corpo
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 10); ctx.stroke();
      
      // Items Rendering (COSMETICS)
      const hat = equippedItems.hat;
      const eyewear = equippedItems.eyewear;
      const shirt = equippedItems.shirt;
      const pants = equippedItems.pants;
      const shoes = equippedItems.shoes;

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#000';

      if (shoes) {
        const isBoots = shoes === 'shoes_boots';
        const isDuck = shoes === 'shoes_duck_vip';
        let shoeColor = '#111';
        let logoColor = '#fff';

        if (shoes.includes('yellow') || isBoots || isDuck) shoeColor = '#fbbf24';
        else if (shoes.includes('white')) {
          shoeColor = '#fff';
          logoColor = '#000';
        }
        else if (shoes.includes('sneakers')) {
          shoeColor = '#111';
          logoColor = '#888';
        }
        else if (shoes.includes('orange')) shoeColor = '#f97316';

        if (isBoots || isDuck) logoColor = '#f97316';

        // Left Shoe
        ctx.fillStyle = shoeColor;
        ctx.fillRect(-9, 17, 7, 5);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.strokeRect(-9, 17, 7, 5);
        
        if (isDuck) {
          ctx.fillStyle = '#f97316'; // Beak
          ctx.fillRect(-4, 18, 2, 2);
          ctx.fillStyle = '#000'; // Eye
          ctx.fillRect(-8, 18, 1, 1);
        } else {
          ctx.strokeStyle = logoColor;
          ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(-4, 20); ctx.stroke();
        }
        
        // Right Shoe
        ctx.fillStyle = shoeColor;
        ctx.fillRect(2, 17, 7, 5);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.strokeRect(2, 17, 7, 5);
        
        if (isDuck) {
          ctx.fillStyle = '#f97316'; // Beak
          ctx.fillRect(7, 18, 2, 2);
          ctx.fillStyle = '#000'; // Eye
          ctx.fillRect(3, 18, 1, 1);
        } else {
          ctx.strokeStyle = logoColor;
          ctx.beginPath(); ctx.moveTo(4, 18); ctx.lineTo(7, 20); ctx.stroke();
        }
      }

      if (shirt) {
        ctx.fillStyle = shirt === 'shirt_duck' ? '#fbbf24' : '#fff';
        ctx.fillRect(-1.5, -1, 3, 11);
        ctx.strokeRect(-1.5, -1, 3, 11);

        if (shirt === 'shirt_duck') {
           ctx.save();
           ctx.translate(1.5, 4);
           ctx.scale(0.8, 0.8);
           ctx.fillStyle = '#fbbf24';
           ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
           ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
           ctx.fillStyle = '#f97316';
           ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(4, -1); ctx.lineTo(4, 1); ctx.fill();
           ctx.fillStyle = '#000';
           ctx.beginPath(); ctx.arc(-1, -1, 0.5, 0, Math.PI * 2); ctx.fill();
           ctx.restore();
        }
      }

      if (hat) {
        ctx.save();
        ctx.translate(0, -14);
        if (hat === 'hat_crown') {
           ctx.fillStyle = '#ffd700';
           ctx.beginPath();
           ctx.moveTo(-7, 0); ctx.lineTo(-7, -6); ctx.lineTo(-4, -1); ctx.lineTo(0, -6); ctx.lineTo(4, -1); ctx.lineTo(7, -6); ctx.lineTo(7, 0); 
           ctx.closePath(); ctx.fill();
           ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
        } else if (hat === 'hat_duck') {
           // Duck Hat
           ctx.fillStyle = '#fbbf24';
           ctx.beginPath(); ctx.arc(0, 0, 6, Math.PI, 0); ctx.fill();
           ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
           // Beak
           ctx.fillStyle = '#f97316';
           ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(8, -1); ctx.lineTo(4, 0); ctx.fill();
           // Eye
           ctx.fillStyle = '#000';
           ctx.beginPath(); ctx.arc(2, -3, 0.8, 0, Math.PI * 2); ctx.fill();
        } else {
           // Classic Cap with Brim
           ctx.fillStyle = hat === 'hat_cap_red' ? '#ef4444' : '#3b82f6';
           // Hat base (dome)
           ctx.beginPath(); ctx.arc(0, 0, 6, Math.PI, 0); ctx.fill();
           ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
           // Brim
           ctx.fillRect(0, -1, 10, 2);
           ctx.strokeRect(0, -1, 10, 2);
        }
        ctx.restore();
      }

      if (eyewear) {
        ctx.save();
        ctx.translate(0, -9);
        ctx.lineWidth = 0.8;
        if (eyewear === 'eye_sunglasses') {
           ctx.fillStyle = '#000';
           ctx.fillRect(-5, 0, 4, 3); ctx.fillRect(1, 0, 4, 3);
           ctx.strokeStyle = '#000';
           ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(1, 1); ctx.stroke();
        } else {
           ctx.strokeStyle = '#fff';
           ctx.strokeRect(-5, 0, 4, 3); ctx.strokeRect(1, 0, 4, 3);
           ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(1, 1); ctx.stroke();
           // Draw eyes behind nerd glasses
           ctx.fillStyle = '#000';
           ctx.beginPath(); ctx.arc(-3, 1.5, 0.5, 0, Math.PI * 2); ctx.fill();
           ctx.beginPath(); ctx.arc(3, 1.5, 0.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // Animazione Braccia e Gambe
      const time = Date.now() / 150;
      const armWave = player.isMoving ? Math.sin(time) * 15 : Math.sin(time * 0.5) * 2;
      const legWalk = player.isMoving ? Math.sin(time) * 12 : 4; // 4 is idle leg spread

      ctx.lineWidth = 4;
      ctx.strokeStyle = skinColor;

      // Braccia (Omino base)
      ctx.lineWidth = 4;
      ctx.strokeStyle = skinColor;
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(10, 2 + armWave); ctx.stroke(); 
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-10, 2 - armWave); ctx.stroke(); 
      
      // Gambe (Omino base)
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legWalk, 22); ctx.stroke(); 
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legWalk, 22); ctx.stroke(); 

      // Pantaloni (Sopra l'omino)
      if (pants) {
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = pants.includes('jeans') ? '#3b82f6' : (pants === 'pants_duck' ? '#fbbf24' : '#666');
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legWalk, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legWalk, 22); ctx.stroke();

        if (pants === 'pants_duck') {
          // Logo Paperella sulle gambe
          const drawMiniDuck = (lx: number, ly: number) => {
            ctx.save();
            ctx.translate(lx, ly);
            ctx.scale(0.5, 0.5);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 0.5; ctx.stroke();
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(4, -1); ctx.lineTo(4, 1); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(-1, -1, 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          };
          drawMiniDuck(legWalk / 2, 16);
          drawMiniDuck(-legWalk / 2, 16);
        }
        ctx.restore();
      }

      ctx.restore();
    };
    render();
  }, [player, activeSkinId, adminNoTraps, isUltimateAdmin]);

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0]; const joystick = e.currentTarget.getBoundingClientRect();
    const centerX = joystick.left + joystick.width / 2; const centerY = joystick.top + joystick.height / 2;
    const diffX = touch.clientX - centerX; const diffY = touch.clientY - centerY;
    const distance = Math.sqrt(diffX*diffX + diffY*diffY); const maxDist = 50;
    const limitedX = distance > maxDist ? (diffX/distance) * maxDist : diffX;
    const limitedY = distance > maxDist ? (diffY/distance) * maxDist : diffY;
    setJoystickPos({ x: limitedX, y: limitedY });
    keys.current['VirtualLeft'] = diffX < -20; keys.current['VirtualRight'] = diffX > 20;
    if (adminFly) { keys.current['VirtualUp'] = diffY < -20; keys.current['VirtualDown'] = diffY > 20; }
  };

  const handleJoystickEnd = () => {
    keys.current['VirtualLeft'] = false; 
    keys.current['VirtualRight'] = false; 
    keys.current['VirtualUp'] = false; 
    keys.current['VirtualDown'] = false; 
    setJoystickPos({ x: 0, y: 0 });
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center bg-black overflow-hidden border-4 border-indigo-900 ${isPortrait ? 'justify-between pb-8' : 'justify-center'}`}>
      <div className="flex-1 w-full flex items-center justify-center">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-auto object-contain max-h-[70vh]" />
      </div>

      {isAdmin && (
        <div className={`absolute top-24 left-4 flex gap-2 z-50 ${isPortrait ? 'flex-row' : 'flex-col'}`}>
          <button onClick={() => setAdminFly(!adminFly)} className={`p-2 border-2 text-[8px] font-black uppercase ${adminFly ? 'bg-green-600 text-white' : 'bg-black text-red-900 border-red-900'}`}>{t('fly', lang)}</button>
          <button onClick={() => setAdminNoTraps(!adminNoTraps)} className={`p-2 border-2 text-[8px] font-black uppercase ${adminNoTraps ? 'bg-green-600 text-white' : 'bg-black text-red-900 border-red-900'}`}>{t('noTraps', lang)}</button>
          <button onClick={onWin} className="p-2 border-2 border-yellow-500 bg-yellow-900 text-yellow-100 text-[8px] font-black uppercase">{t('finish', lang)}</button>
          {isUltimateAdmin && (
            <>
              <button onClick={destroyMap} className="p-2 border-2 border-red-500 bg-red-900 text-white text-[8px] font-black uppercase">DISTRUGGI</button>
              <button onClick={createNewMap} className="p-2 border-2 border-cyan-500 bg-cyan-900 text-white text-[8px] font-black uppercase">NUOVA</button>
            </>
          )}
        </div>
      )}

      {/* Controlli Touch per Mobile */}
      {isTouchDevice && (
        <div className={`w-full px-6 flex items-center justify-between pb-4 pointer-events-none ${isPortrait ? 'h-40' : 'absolute bottom-4'}`}>
          <div 
            className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center relative pointer-events-auto touch-none" 
            onTouchStart={handleJoystickMove} 
            onTouchMove={handleJoystickMove} 
            onTouchEnd={handleJoystickEnd}
          >
            <div className="w-10 h-10 bg-white/40 rounded-full absolute" style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }} />
          </div>
          
          <div className="flex gap-4 pointer-events-auto">
            {!adminFly && (
              <div 
                className="w-24 h-24 rounded-full border-4 border-red-500/40 bg-red-500/20 flex items-center justify-center touch-none active:scale-90 transition-transform" 
                onTouchStart={(e) => { e.preventDefault(); keys.current['VirtualJump'] = true; }} 
                onTouchEnd={() => { keys.current['VirtualJump'] = false; }}
              >
                <span className="text-[10px] text-red-100 font-black uppercase">{t('jump', lang)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
