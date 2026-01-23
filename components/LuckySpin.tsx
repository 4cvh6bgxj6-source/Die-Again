
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface LuckySpinProps {
  onWin: (gems: number) => void;
  onClose: () => void;
  userGems: number;
  lang: Language;
}

const LuckySpin: React.FC<LuckySpinProps> = ({ onWin, onClose, userGems, lang }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rewards = [50, 1000, 0, 500, 100, 2500, 0, 200];
  const colors = ['#f44336', '#ffeb3b', '#9c27b0', '#4caf50', '#3f51b5', '#ff9800', '#03a9f4', '#00bcd4'];

  const SPIN_COST = 500;

  useEffect(() => {
    drawWheel();
  }, [rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    const sliceAngle = (2 * Math.PI) / rewards.length;

    rewards.forEach((reward, i) => {
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, i * sliceAngle, (i + 1) * sliceAngle);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(i * sliceAngle + sliceAngle / 2);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px "Press Start 2P"';
      ctx.textAlign = 'right';
      ctx.fillText(reward.toString(), radius - 30, 8);
      ctx.restore();
    });

    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 15, centerY);
    ctx.lineTo(centerX + radius - 10, centerY - 15);
    ctx.lineTo(centerX + radius - 10, centerY + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  };

  const spin = () => {
    if (isSpinning) return;
    if (userGems < SPIN_COST) {
      alert(t('insufficientGemsAlert', lang));
      return;
    }

    setIsSpinning(true);
    const extraSpins = 5 + Math.random() * 8;
    const targetRotation = rotation + extraSpins * 360;
    
    const startTime = performance.now();
    const duration = 4000;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      const currentRot = rotation + (targetRotation - rotation) * easeOut;
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalDeg = (currentRot % 360 + 360) % 360;
        const sliceIndex = rewards.length - 1 - Math.floor(finalDeg / (360 / rewards.length));
        onWin(rewards[sliceIndex] - SPIN_COST);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-4 border-white p-10 rounded-lg text-center max-w-lg w-full pixel-shadow">
        <h2 className="text-3xl text-yellow-400 mb-2 uppercase tracking-widest">{t('luckySpin', lang)}</h2>
        <div className="text-cyan-400 text-[10px] mb-8 uppercase">{t('balance', lang)}: {userGems} {t('gems', lang)}</div>
        
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="mx-auto mb-8 bg-transparent"
        />
        
        <div className="flex flex-col gap-4">
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`py-4 px-6 text-xl font-bold rounded border-4 ${
              isSpinning || userGems < SPIN_COST
                ? 'bg-zinc-800 text-zinc-600 border-zinc-700' 
                : 'bg-red-600 hover:bg-red-500 text-white border-red-900 animate-pulse'
            }`}
          >
            {isSpinning ? t('spinning', lang) : `SPIN (${SPIN_COST} ${t('gems', lang)})`}
          </button>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white uppercase text-xs mt-2"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuckySpin;
