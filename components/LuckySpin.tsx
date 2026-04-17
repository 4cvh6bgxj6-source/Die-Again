
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface LuckySpinProps {
  onWin: (gems: number) => void;
  onWinItemChoice: () => void;
  onClose: () => void;
  userGems: number;
  lang: Language;
}

const LuckySpin: React.FC<LuckySpinProps> = ({ onWin, onWinItemChoice, onClose, userGems, lang }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rewards = [50, 1000, 0, 500, 100, 2500, 0, 200, "ITEM"];
  const colors = ['#f44336', '#ffeb3b', '#9c27b0', '#4caf50', '#3f51b5', '#ff9800', '#03a9f4', '#00bcd4', '#ffffff'];

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
      ctx.fillStyle = i === 8 ? '#f00' : '#000'; // Rosso per ITEM
      ctx.font = i === 8 ? '900 12px sans-serif' : 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(reward === 'ITEM' ? 'ITEM 🎁' : reward.toString(), radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();

    // Needle (Lancetta dritta con punta verso il basso)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - radius - 25);
    ctx.lineTo(centerX + 15, centerY - radius - 25);
    ctx.lineTo(centerX, centerY - radius + 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center pin
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const spin = () => {
    if (isSpinning) return;
    if (userGems < SPIN_COST) {
      alert(t('insufficientGemsAlert', lang));
      return;
    }

    setIsSpinning(true);
    
    // Probabilità: 0.01% per ITEM, il resto diviso tra gli altri 8
    const isSuperWin = Math.random() < 0.0001;
    let targetSliceIndex: number;
    if (isSuperWin) {
      targetSliceIndex = 8; // L'ultimo indice è "ITEM"
    } else {
      targetSliceIndex = Math.floor(Math.random() * 8); // Uno degli altri premi
    }

    const sliceAngle = 360 / rewards.length;
    const extraSpins = 5 + Math.random() * 5;
    
    // Calcoliamo la rotazione finale per fermarsi sulla fetta corretta
    // Il puntatore è a 270 degrees (alto). La fetta 0 inizia a 0 (destra).
    // finalRot = offset - (targetSliceIndex * sliceAngle) - (mezza fetta per centrare)
    const baseTarget = (270 - (targetSliceIndex * sliceAngle) - (sliceAngle / 2));
    const targetRotation = rotation + (extraSpins * 360) + (baseTarget - (rotation % 360) + 360) % 360;
    
    const startTime = performance.now();
    const duration = 5000;

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
        if (targetSliceIndex === 8) {
           onWin(-SPIN_COST); // Toppa il costo
           onWinItemChoice();
        } else {
           onWin((rewards[targetSliceIndex] as number) - SPIN_COST);
        }
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
