
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, LevelData, GameObject, Vector2D, Language, UserStats } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, SKINS } from '../constants';
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

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
}

const GameEngine: React.FC<GameEngineProps> = ({ level, onDeath, onWin, gameState, activeSkinId, lang, userStats, releaseGems, gemCount = 0, onJackpot }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakes = useRef<Snowflake[]>([]);
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];
  const isVip = userStats.membership === 'vip';
  const isAdmin = activeSkin.isAdmin;

  const [adminFly, setAdminFly] = useState(false);
  const [adminNoTraps, setAdminNoTraps] = useState(false);

  const [player, setPlayer] = useState({
    pos: { ...level.playerStart },
    vel: { x: 0, y: 0 },
    isGrounded: false,
    deaths: 0,
    facingRight: true
  });

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 }); 
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  const isDeadRef = useRef(false);
  
  const objectsStateRef = useRef<any[]>([]);
  const collectedGemsCount = useRef(0);
  const totalGemsReleased = useRef(0);

  useEffect(() => {
    const snow: Snowflake[] = [];
    for (let i = 0; i < 150; i++) {
      snow.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5,
        drift: Math.random() * 0.5 - 0.25
      });
    }
    snowflakes.current = snow;
  }, []);

  const resetObjects = useCallback(() => {
    const baseObjects = level.objects.map(obj => ({
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
          size: { x: 24, y: 24 },
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
  }, [level, releaseGems, gemCount]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    resetObjects();
    isDeadRef.current = false;
    setPlayer(p => ({ ...p, pos: { ...level.playerStart }, vel: { x: 0, y: 0 }, facingRight: true }));
  }, [level, resetObjects]);

  const triggerDeath = useCallback(() => {
    if (adminNoTraps || isDeadRef.current || gameState !== GameState.PLAYING) return;
    isDeadRef.current = true;
    onDeath();
  }, [onDeath, adminNoTraps, gameState]);

  const checkCollision = (p: Vector2D, objState: any) => {
    if (!objState.active) return false;
    if (!isVip && objState.type === 'opening_floor' && objState.timer > 40) return false;
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

    snowflakes.current.forEach(f => {
      f.y += f.speed;
      f.x += f.drift;
      if (f.y > CANVAS_HEIGHT) { f.y = -10; f.x = Math.random() * CANVAS_WIDTH; }
      if (f.x > CANVAS_WIDTH) f.x = 0;
      if (f.x < 0) f.x = CANVAS_WIDTH;
    });

    setPlayer(prev => {
      let nextPos = { ...prev.pos };
      let nextVel = { ...prev.vel };
      let nextGrounded = false;
      let nextFacing = prev.facingRight;

      if (keys.current['ArrowLeft'] || keys.current['KeyA'] || keys.current['VirtualLeft']) {
        nextVel.x = -MOVE_SPEED; nextFacing = false;
      } else if (keys.current['ArrowRight'] || keys.current['KeyD'] || keys.current['VirtualRight']) {
        nextVel.x = MOVE_SPEED; nextFacing = true;
      } else { nextVel.x = 0; }

      if (adminFly) {
        if (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['VirtualUp']) nextVel.y = -MOVE_SPEED;
        else if (keys.current['ArrowDown'] || keys.current['KeyS'] || keys.current['VirtualDown']) nextVel.y = MOVE_SPEED;
        else nextVel.y = 0;
        nextGrounded = true;
      } else {
        if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space'] || keys.current['VirtualJump']) && prev.isGrounded) {
          nextVel.y = JUMP_FORCE;
        }
        nextVel.y += GRAVITY;
      }

      nextPos.x += nextVel.x;
      nextPos.y += nextVel.y;

      if (nextPos.x < 0) nextPos.x = 0;
      if (nextPos.x > CANVAS_WIDTH - PLAYER_SIZE) nextPos.x = CANVAS_WIDTH - PLAYER_SIZE;
      if (nextPos.y > CANVAS_HEIGHT) { triggerDeath(); return prev; }

      let diedThisFrame = false;

      objectsStateRef.current.forEach((obj) => {
        if (!obj.active) return;

        if (obj.type === 'collectible_gem') {
          obj.timer += 0.15;
          obj.currentPos.y = obj.pos.y + Math.sin(obj.timer) * 12;
          if (checkCollision(nextPos, obj)) {
            obj.active = false;
            collectedGemsCount.current++;
            if (collectedGemsCount.current === totalGemsReleased.current && totalGemsReleased.current > 0) {
              onJackpot?.();
            }
          }
          return;
        }

        if (obj.type === 'opening_floor') {
          const dist = Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x / 2));
          if (dist < 80 && obj.timer === 0) obj.timer = 1;
          if (obj.timer > 0) {
            obj.timer++;
            if (obj.timer < 40) obj.tremble = Math.sin(obj.timer * 0.9) * 2;
            else if (!isVip) { obj.tremble = 0; obj.currentPos.y += 18; if (obj.currentPos.y > CANVAS_HEIGHT + 100) obj.active = false; }
          }
        }
        if (obj.type === 'moving_wall') {
           const range = 250;
           const speed = isVip ? (4 + (level.id * 0.2)) * 0.5 : 4 + (level.id * 0.2);
           obj.currentPos.y += obj.dir * speed;
           if (Math.abs(obj.currentPos.y - obj.initialPos.y) > range) obj.dir *= -1;
        }
        if (obj.type === 'falling_spike') {
           if (obj.dir === 0 && Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x/2)) < 60) obj.dir = 1;
           if (obj.dir === 1) obj.currentPos.y += 20;
        }

        if (checkCollision(nextPos, obj)) {
          if (obj.isLethal || obj.type === 'trap' || obj.type === 'falling_spike') {
            if (!adminNoTraps) diedThisFrame = true;
          } else if (obj.type === 'wall' || obj.type === 'moving_wall' || obj.type === 'disappearing_floor' || obj.type === 'opening_floor') {
            const currentObjY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
            if (prev.pos.y + PLAYER_SIZE <= currentObjY + 12) {
              nextPos.y = currentObjY - PLAYER_SIZE; nextVel.y = 0; nextGrounded = true;
              if (obj.type === 'disappearing_floor' && !isVip) { obj.timer++; if (obj.timer > 25) obj.active = false; }
            } else if (!adminFly) {
              if (prev.pos.y >= currentObjY + obj.size.y - 12) { nextPos.y = currentObjY + obj.size.y; nextVel.y = 1; }
              else if (prev.pos.x + PLAYER_SIZE <= obj.currentPos.x + 12) { nextPos.x = obj.currentPos.x - PLAYER_SIZE; }
              else if (prev.pos.x >= obj.currentPos.x + obj.size.x - 12) { nextPos.x = obj.currentPos.x + obj.size.x; }
            }
          } else if (obj.type === 'goal') { onWin(); }
        }
      });

      if (diedThisFrame) { triggerDeath(); return prev; }
      return { ...prev, pos: nextPos, vel: nextVel, isGrounded: nextGrounded, facingRight: nextFacing };
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, level, onWin, triggerDeath, isVip, adminFly, adminNoTraps, onJackpot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#050b18'); grad.addColorStop(1, '#1a365d');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      snowflakes.current.forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill(); });

      objectsStateRef.current.forEach((obj) => {
        if (!obj.active) return;
        const renderY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
        
        if (obj.type === 'collectible_gem') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 20; ctx.shadowColor = '#fbbf24';
          ctx.beginPath(); 
          ctx.moveTo(obj.currentPos.x + 12, renderY);
          ctx.lineTo(obj.currentPos.x + 24, renderY + 12); 
          ctx.lineTo(obj.currentPos.x + 12, renderY + 24);
          ctx.lineTo(obj.currentPos.x, renderY + 12); 
          ctx.closePath(); 
          ctx.fill();
          ctx.shadowBlur = 0;
          return;
        }

        ctx.fillStyle = (adminNoTraps && (obj.isLethal || obj.type === 'trap' || obj.type === 'falling_spike')) ? '#333' : obj.color;
        ctx.shadowBlur = 6; ctx.shadowColor = ctx.fillStyle as string;
        if (obj.type === 'falling_spike' || obj.type === 'trap') {
           ctx.beginPath(); ctx.moveTo(obj.currentPos.x, renderY + obj.size.y);
           ctx.lineTo(obj.currentPos.x + obj.size.x / 2, renderY); ctx.lineTo(obj.currentPos.x + obj.size.x, renderY + obj.size.y);
           ctx.fill();
        } else {
           ctx.fillRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y);
           if (obj.type === 'wall' || obj.type === 'moving_wall') { ctx.fillStyle = 'white'; ctx.fillRect(obj.currentPos.x, renderY, obj.size.x, 4); }
        }
        ctx.shadowBlur = 0;
      });

      ctx.save();
      ctx.translate(player.pos.x + PLAYER_SIZE/2, player.pos.y + PLAYER_SIZE/2);
      if (!player.facingRight) ctx.scale(-1, 1);
      ctx.strokeStyle = activeSkin.isAdmin ? `hsl(${Date.now() % 360}, 100%, 50%)` : activeSkin.color;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 8); ctx.stroke();
      const armWave = Math.sin(Date.now() / 100) * 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, armWave); ctx.moveTo(0, 0); ctx.lineTo(-8, -armWave); ctx.stroke();
      const legWalk = Math.sin(Date.now() / 100) * 8;
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(legWalk, 14); ctx.moveTo(0, 8); ctx.lineTo(-legWalk, 14); ctx.stroke();
      ctx.restore();
    };
    render();
  }, [player, activeSkinId, adminNoTraps]);

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const joystick = e.currentTarget.getBoundingClientRect();
    const centerX = joystick.left + joystick.width / 2;
    const centerY = joystick.top + joystick.height / 2;
    const diffX = touch.clientX - centerX;
    const diffY = touch.clientY - centerY;
    const distance = Math.sqrt(diffX*diffX + diffY*diffY);
    const maxDist = 40;
    const limitedX = distance > maxDist ? (diffX/distance) * maxDist : diffX;
    const limitedY = distance > maxDist ? (diffY/distance) * maxDist : diffY;
    setJoystickPos({ x: limitedX, y: limitedY });
    keys.current['VirtualLeft'] = diffX < -15; keys.current['VirtualRight'] = diffX > 15;
    if (adminFly) { keys.current['VirtualUp'] = diffY < -15; keys.current['VirtualDown'] = diffY > 15; }
  };

  return (
    <div className="relative border-4 md:border-8 border-indigo-950 rounded-lg overflow-hidden pixel-shadow bg-black touch-none flex flex-col items-center w-full max-w-full">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full h-auto" />
      {isAdmin && (
        <div className="absolute top-20 left-4 flex flex-col gap-2 z-20">
          <button onClick={() => setAdminFly(!adminFly)} className={`p-2 border-2 text-[8px] font-black uppercase ${adminFly ? 'bg-green-600 border-white' : 'bg-black border-red-900 text-red-900'}`}>{t('fly', lang)}</button>
          <button onClick={() => setAdminNoTraps(!adminNoTraps)} className={`p-2 border-2 text-[8px] font-black uppercase ${adminNoTraps ? 'bg-green-600 border-white' : 'bg-black border-red-900 text-red-900'}`}>{t('noTraps', lang)}</button>
          <button onClick={onWin} className="p-2 border-2 border-yellow-500 bg-yellow-900 text-yellow-100 text-[8px] font-black uppercase">{t('finish', lang)}</button>
        </div>
      )}
      
      {totalGemsReleased.current > 0 && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-yellow-600/90 p-3 border-2 border-white text-[10px] font-black text-white uppercase animate-pulse shadow-[0_0_15px_#fbbf24]">
          ADMIN CHALLENGE: {collectedGemsCount.current} / {totalGemsReleased.current}
        </div>
      )}

      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex gap-4 pointer-events-none">
        <div className="text-white text-[8px] md:text-[10px] bg-red-800/60 p-2 rounded border border-white/50">
          <div>{t('zone', lang)}: {level.name} ❄️</div>
          <div>{t('scleri', lang)}: {player.deaths}</div>
        </div>
      </div>
      {isTouchDevice && (
        <div className="absolute inset-x-0 bottom-1 px-1 pointer-events-none flex items-end justify-between md:p-8 md:pb-8">
          <div className="pointer-events-auto w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center relative active:bg-white/20" onTouchStart={handleJoystickMove} onTouchMove={handleJoystickMove} onTouchEnd={() => { keys.current['VirtualLeft'] = false; keys.current['VirtualRight'] = false; keys.current['VirtualUp'] = false; keys.current['VirtualDown'] = false; setJoystickPos({ x: 0, y: 0 }); }}>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/40 rounded-full absolute" style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }} />
          </div>
          {!adminFly && (
            <div className="pointer-events-auto w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-red-400/30 bg-red-400/10 flex items-center justify-center active:scale-90 active:bg-red-400/20 transition-all" onTouchStart={(e) => { e.preventDefault(); keys.current['VirtualJump'] = true; }} onTouchEnd={() => { keys.current['VirtualJump'] = false; }}>
              <span className="text-[10px] md:text-xs text-red-100 font-black uppercase">{t('jump', lang)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameEngine;
