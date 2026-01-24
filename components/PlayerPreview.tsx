
import React from 'react';
import { SKINS } from '../constants';

interface PlayerPreviewProps {
  skinId: string;
}

const PlayerPreview: React.FC<PlayerPreviewProps> = ({ skinId }) => {
  const activeSkin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const isAdmin = activeSkin.isAdmin;

  return (
    <div className="w-32 h-32 border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center relative pixel-shadow overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/50" />
      <div className="scale-[2.5] relative">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <g transform="translate(20, 20)">
            {/* Omino Drawing */}
            <circle 
              cx="0" cy="-8" r="6" 
              fill="none" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3"
              className={isAdmin ? "animate-pulse" : ""}
            />
            <line 
              x1="0" y1="-2" x2="0" y2="8" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3" 
            />
            {/* Arms */}
            <line 
              x1="0" y1="0" x2="8" y2="2" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3" 
              className="animate-bounce"
            />
            <line 
              x1="0" y1="0" x2="-8" y2="2" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3" 
              className="animate-bounce"
            />
            {/* Legs */}
            <line 
              x1="0" y1="8" x2="6" y2="14" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3" 
            />
            <line 
              x1="0" y1="8" x2="-6" y2="14" 
              stroke={isAdmin ? "red" : activeSkin.color} 
              strokeWidth="3" 
            />
          </g>
        </svg>
      </div>
      <div className="absolute bottom-1 text-[6px] text-zinc-600 font-bold uppercase tracking-tighter">PREVIEW</div>
    </div>
  );
};

export default PlayerPreview;
