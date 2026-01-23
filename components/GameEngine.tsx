
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, LevelData, GameObject, Vector2D, Language } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, GRAVITY, JUMP_FORCE, MOVE_SPEED, SKINS } from '../constants';
import { getRageMessage } from '../services/gemini';
import { t } from '../i18n';

interface GameEngineProps {
  level: LevelData;
  onDeath: (msg: string) => void;
  onWin: () => void;
  gameState: GameState;
  activeSkinId: string;
  lang: Language;
}

const GameEngine: React.FC<GameEngineProps> = ({ level, onDeath, onWin, gameState, activeSkinId, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];

  const [player, setPlayer] = useState({
    pos: { ...level.playerStart },
    vel: { x: 0, y: 0 },
    isGrounded: false,
    deaths: 0,
    facingRight: true
  });

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [deathFlash, setDeathFlash] = useState(0); 
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 }); 
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  
  const objectsStateRef = useRef<any[]>([]);

  const resetObjects = useCallback(() => {
    objectsStateRef.current = level.objects.map(obj => ({
      ...obj,
      currentPos: { ...obj.pos },
      initialPos: { ...obj.pos },
      dir: obj.type === 'moving_wall' ? 1 : 0,
      active: true,
      timer: 0,
      tremble: 0
    }));
  }, [level]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    resetObjects();
    setPlayer(p => ({ ...p, pos: { ...level.playerStart }, vel: { x: 0, y: 0 }, facingRight: true }));
  }, [level, resetObjects]);

  const restartLevel = useCallback(async () => {
    setDeathFlash(0.8);
    setTimeout(() => setDeathFlash(0), 150);
    
    resetObjects();
    setPlayer(prev => ({
      ...prev,
      pos: { ...level.playerStart },
      vel: { x: 0, y: 0 },
      deaths: prev.deaths + 1
    }));
    
    const msg = await getRageMessage(player.deaths + 1, lang);
    onDeath(msg);
  }, [level, player.deaths, onDeath, resetObjects, lang]);

  const checkCollision = (p: Vector2D, objState: any) => {
    if (!objState.active) return false;
    if (objState.type === 'opening_floor' && objState.timer > 40) return false;
    if (objState.type === 'disappearing_floor' && !objState.active) return false;

    const renderY = objState.currentPos.y + (objState.type === 'opening_floor' ? objState.tremble : 0);

    return (
      p.x < objState.currentPos.x + objState.size.x &&
      p.x + PLAYER_SIZE > objState.currentPos.x &&
      p.y < renderY + objState.size.y &&
      p.y + PLAYER_SIZE > renderY
    );
  };

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    setPlayer(prev => {
      let nextPos = { ...prev.pos };
      let nextVel = { ...prev.vel };
      let nextGrounded = false;
      let nextFacing = prev.facingRight;

      if (keys.current['ArrowLeft'] || keys.current['KeyA'] || keys.current['VirtualLeft']) {
        nextVel.x = -MOVE_SPEED;
        nextFacing = false;
      } else if (keys.current['ArrowRight'] || keys.current['KeyD'] || keys.current['VirtualRight']) {
        nextVel.x = MOVE_SPEED;
        nextFacing = true;
      } else {
        nextVel.x = 0;
      }

      if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space'] || keys.current['VirtualJump']) && prev.isGrounded) {
        nextVel.y = JUMP_FORCE;
      }

      nextVel.y += GRAVITY;
      nextPos.x += nextVel.x;
      nextPos.y += nextVel.y;

      if (nextPos.x < 0) nextPos.x = 0;
      if (nextPos.x > CANVAS_WIDTH - PLAYER_SIZE) nextPos.x = CANVAS_WIDTH - PLAYER_SIZE;
      
      if (nextPos.y > CANVAS_HEIGHT) {
        restartLevel();
        return prev;
      }

      let diedThisFrame = false;

      objectsStateRef.current.forEach((obj) => {
        if (!obj.active) return;

        if (obj.type === 'opening_floor') {
          const dist = Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x / 2));
          if (dist < 80 && obj.timer === 0) obj.timer = 1;
          if (obj.timer > 0) {
            obj.timer++;
            if (obj.timer < 40) {
              obj.tremble = Math.sin(obj.timer * 0.9) * 2;
            } else {
              obj.tremble = 0;
              obj.currentPos.y += 18;
              if (obj.currentPos.y > CANVAS_HEIGHT + 100) obj.active = false;
            }
          }
        }

        if (obj.type === 'moving_wall') {
           const range = 250;
           const speed = 4 + (level.id * 0.2);
           obj.currentPos.y += obj.dir * speed;
           if (Math.abs(obj.currentPos.y - obj.initialPos.y) > range) obj.dir *= -1;
        }
        
        if (obj.type === 'falling_spike') {
           if (obj.dir === 0 && Math.abs(prev.pos.x - (obj.currentPos.x + obj.size.x/2)) < 60) obj.dir = 1;
           if (obj.dir === 1) obj.currentPos.y += 20;
        }

        if (checkCollision(nextPos, obj)) {
          if (obj.isLethal || obj.type === 'trap' || obj.type === 'falling_spike') {
            diedThisFrame = true;
          } else if (obj.type === 'wall' || obj.type === 'moving_wall' || obj.type === 'disappearing_floor' || obj.type === 'opening_floor') {
            const currentObjY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
            
            if (prev.pos.y + PLAYER_SIZE <= currentObjY + 12) {
              nextPos.y = currentObjY - PLAYER_SIZE;
              nextVel.y = 0;
              nextGrounded = true;
              if (obj.type === 'disappearing_floor') {
                obj.timer++;
                if (obj.timer > 25) obj.active = false;
              }
            } else if (prev.pos.y >= currentObjY + obj.size.y - 12) {
              nextPos.y = currentObjY + obj.size.y;
              nextVel.y = 1;
            } else if (prev.pos.x + PLAYER_SIZE <= obj.currentPos.x + 12) {
              nextPos.x = obj.currentPos.x - PLAYER_SIZE;
            } else if (prev.pos.x >= obj.currentPos.x + obj.size.x - 12) {
              nextPos.x = obj.currentPos.x + obj.size.x;
            }
          } else if (obj.type === 'goal') {
            onWin();
          }
        }
      });

      if (diedThisFrame) {
        restartLevel();
        return prev;
      }

      return { ...prev, pos: nextPos, vel: nextVel, isGrounded: nextGrounded, facingRight: nextFacing };
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, level, onWin, restartLevel]);

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
      
      const grad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 600);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      objectsStateRef.current.forEach((obj) => {
        if (!obj.active) return;
        const renderY = obj.currentPos.y + (obj.type === 'opening_floor' ? obj.tremble : 0);
        
        ctx.fillStyle = obj.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = obj.color;

        if (obj.type === 'falling_spike' || obj.type === 'trap') {
           ctx.beginPath();
           ctx.moveTo(obj.currentPos.x, renderY + obj.size.y);
           ctx.lineTo(obj.currentPos.x + obj.size.x / 2, renderY);
           ctx.lineTo(obj.currentPos.x + obj.size.x, renderY + obj.size.y);
           ctx.fill();
        } else {
           ctx.fillRect(obj.currentPos.x, renderY, obj.size.x, obj.size.y);
        }

        if (obj.type === 'moving_wall' && obj.isLethal) {
           ctx.fillStyle = '#f0f';
           for(let i=0; i<obj.size.x; i+=10) {
             ctx.beginPath();
             ctx.moveTo(obj.currentPos.x+i, renderY);
             ctx.lineTo(obj.currentPos.x+i+5, renderY-8);
             ctx.lineTo(obj.currentPos.x+i+10, renderY);
             ctx.fill();
           }
        }
        ctx.shadowBlur = 0;
      });

      ctx.save();
      ctx.translate(player.pos.x + PLAYER_SIZE/2, player.pos.y + PLAYER_SIZE/2);
      if (!player.facingRight) ctx.scale(-1, 1);
      ctx.strokeStyle = activeSkin.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 8); ctx.stroke();
      const armWave = Math.sin(Date.now() / 100) * 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, armWave); ctx.moveTo(0, 0); ctx.lineTo(-8, -armWave); ctx.stroke();
      const legWalk = Math.sin(Date.now() / 100) * 8;
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(legWalk, 14); ctx.moveTo(0, 8); ctx.lineTo(-legWalk, 14); ctx.stroke();
      ctx.restore();

      if (deathFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${deathFlash})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    };
    render();
  }, [player, activeSkinId, deathFlash]);

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

    if (diffX < -15) {
      keys.current['VirtualLeft'] = true;
      keys.current['VirtualRight'] = false;
    } else if (diffX > 15) {
      keys.current['VirtualRight'] = true;
      keys.current['VirtualLeft'] = false;
    } else {
      keys.current['VirtualLeft'] = false;
      keys.current['VirtualRight'] = false;
    }
  };

  const stopJoystick = () => {
    keys.current['VirtualLeft'] = false;
    keys.current['VirtualRight'] = false;
    setJoystickPos({ x: 0, y: 0 });
  };

  return (
    <div className="relative border-4 md:border-8 border-indigo-950 rounded-lg overflow-hidden pixel-shadow bg-black touch-none flex flex-col items-center">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full h-auto" />
      
      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex gap-4">
        <div className="text-cyan-400 text-[8px] md:text-[10px] bg-black/60 p-2 rounded border border-cyan-900/50">
          <div>{t('zone', lang)}: {level.name}</div>
          <div>{t('scleri', lang)}: {player.deaths}</div>
        </div>
      </div>

      {isTouchDevice && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-between p-4 md:p-8 pb-4 md:pb-16">
          <div 
            className="pointer-events-auto w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center relative active:bg-white/10"
            onTouchStart={handleJoystickMove}
            onTouchMove={handleJoystickMove}
            onTouchEnd={stopJoystick}
          >
            <div 
              className="w-10 h-10 md:w-14 md:h-14 bg-white/30 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] absolute transition-transform duration-75" 
              style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
            />
          </div>

          <div 
            className="pointer-events-auto w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center active:scale-90 active:bg-cyan-400/20 transition-all shadow-lg"
            onTouchStart={(e) => { e.preventDefault(); keys.current['VirtualJump'] = true; }}
            onTouchEnd={() => { keys.current['VirtualJump'] = false; }}
          >
            <span className="text-[10px] md:text-xs text-cyan-400 font-black uppercase tracking-widest">{t('jump', lang)}</span>
          </div>
        </div>
      )}

      {!isTouchDevice && (
        <div className="absolute bottom-4 right-4 text-indigo-400 text-[10px] bg-black/60 p-1 px-2 uppercase border border-indigo-900/50">
          Arrows: Run | Space: Jump
        </div>
      )}
    </div>
  );
};

export default GameEngine;
