
import React from 'react';
import { SKINS } from '../constants';
import { EquipState } from '../types';

interface PlayerPreviewProps {
  skinId: string;
  equippedItems?: EquipState;
  isDead?: boolean;
  isStatic?: boolean;
}

const PlayerPreview: React.FC<PlayerPreviewProps> = ({ skinId, equippedItems, isDead, isStatic }) => {
  const activeSkin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const isAdmin = activeSkin.isAdmin;
  const isRainbow = activeSkin.isRainbow;

  const hat = equippedItems?.hat;
  const eyewear = equippedItems?.eyewear;
  const shirt = equippedItems?.shirt;
  const pants = equippedItems?.pants;
  const shoes = equippedItems?.shoes;

  const getSkinStroke = () => {
    if (isDead) return "#7f1d1d";
    if (isAdmin) return "red";
    if (isRainbow) return "#ff0000"; // Start with red to avoid being 'white'
    return activeSkin.color;
  };

  const skinStroke = getSkinStroke();

  return (
    <div className={`w-32 h-32 border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center relative pixel-shadow overflow-hidden group ${isDead ? 'bg-red-950/20' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/50" />
      <div className={`scale-[2.5] relative transition-transform duration-500 ${isDead ? 'rotate-90 translate-y-4' : ''}`}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <g transform="translate(20, 20)">
            
            {/* Omino Drawing */}
            <circle 
              cx="0" cy="-8" r="6" 
              fill="none" 
              stroke={skinStroke} 
              strokeWidth="3"
              className={`${isAdmin && !isDead && !isStatic ? "animate-pulse" : ""} ${isRainbow && !isDead ? "animate-rainbow-stroke" : ""}`}
            />
            <line 
              x1="0" y1="-2" x2="0" y2="8" 
              stroke={skinStroke} 
              strokeWidth="3" 
              className={isRainbow && !isDead ? "animate-rainbow-stroke" : ""}
            />
            
            {/* CLOTHING ITEMS */}
            <g>
              {/* Shoes */}
              {shoes && (
                   <g>
                     {(() => {
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

                       return (
                         <>
                           {/* Left Shoe */}
                           <rect x="-9.5" y="17" width="7" height="5" fill={shoeColor} stroke="#000" strokeWidth="0.5" />
                           {isDuck ? (
                             <g>
                               <rect x="-5" y="18" width="1.5" height="1.5" fill="#f97316" />
                               <circle cx="-8" cy="18.5" r="0.5" fill="#000" />
                             </g>
                           ) : (
                             <line x1="-7" y1="18.5" x2="-4" y2="20.5" stroke={logoColor} strokeWidth="0.5" />
                           )}
                           
                           {/* Right Shoe */}
                           <rect x="2.5" y="17" width="7" height="5" fill={shoeColor} stroke="#000" strokeWidth="0.5" />
                           {isDuck ? (
                             <g>
                               <rect x="7" y="18" width="1.5" height="1.5" fill="#f97316" />
                               <circle cx="4" cy="18.5" r="0.5" fill="#000" />
                             </g>
                           ) : (
                             <line x1="4.5" y1="18.5" x2="7.5" y2="20.5" stroke={logoColor} strokeWidth="0.5" />
                           )}
                         </>
                       );
                     })()}
                   </g>
                )}

                {/* Shirt / Duck Shirt */}
                {shirt && (
                   <g>
                     {/* The shirt is now a "stick" layer over the body */}
                     <rect x="-1.5" y="-1" width="3" height="11" fill={shirt === 'shirt_duck' ? '#fbbf24' : '#fff'} stroke="#000" strokeWidth="0.5" />
                     
                     {shirt === 'shirt_duck' && (
                        <g transform="translate(1.5, 4.5) scale(0.6)">
                           <circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
                           <path d="M1,0 L4,-1 L4,1 Z" fill="#f97316" />
                           <circle cx="-1" cy="-1" r="0.5" fill="#000" />
                        </g>
                     )}
                   </g>
                )}

                {/* Hat */}
                {hat && (
                   <g transform="translate(0, -14)">
                     {hat === 'hat_crown' ? (
                        <path d="M-7,0 L-7,-6 L-4,-1 L0,-6 L4,-1 L7,-6 L7,0 Z" fill="#ffd700" stroke="#000" strokeWidth="0.5" />
                     ) : hat === 'hat_duck' ? (
                        <g>
                           <path d="M-6,0 A 6 6 0 0 1 6,0 Z" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
                           <path d="M4,-2 L8,-1 L4,0 Z" fill="#f97316" />
                           <circle cx="2" cy="-3" r="0.8" fill="#000" />
                        </g>
                     ) : (
                        <g>
                           <path d="M-6,0 A 6 6 0 0 1 6,0 Z" fill={hat === 'hat_cap_red' ? '#ef4444' : '#3b82f6'} stroke="#000" strokeWidth="0.5" />
                           <rect x="0" y="-1.5" width="10" height="2" fill={hat === 'hat_cap_red' ? '#ef4444' : '#3b82f6'} stroke="#000" strokeWidth="0.5" />
                        </g>
                     )}
                   </g>
                )}

                {/* Eyewear */}
                {eyewear && (
                   <g transform="translate(0, -9)">
                     <rect x="-4" y="0" width="3" height="2" fill={eyewear === 'eye_sunglasses' ? '#000' : 'none'} stroke={eyewear === 'eye_nerd' ? '#fff' : 'none'} strokeWidth="0.5" />
                     <rect x="1" y="0" width="3" height="2" fill={eyewear === 'eye_sunglasses' ? '#000' : 'none'} stroke={eyewear === 'eye_nerd' ? '#fff' : 'none'} strokeWidth="0.5" />
                     <line x1="-1" y1="1" x2="1" y2="1" stroke={eyewear === 'eye_sunglasses' ? '#000' : '#fff'} strokeWidth="0.5" />
                   </g>
                )}
            </g>

            {/* Arms */}
            <g className="arm-group-right" style={{ animation: (isDead || isStatic) ? 'none' : 'arm-swing-right 1s ease-in-out infinite' }}>
              <line 
                x1="0" y1="2" x2="10" y2="2" 
                stroke={skinStroke} 
                strokeWidth="3" 
                strokeLinecap="round"
                className={isRainbow && !isDead ? "animate-rainbow-stroke" : ""}
              />
            </g>
            <g className="arm-group-left" style={{ animation: (isDead || isStatic) ? 'none' : 'arm-swing-left 1s ease-in-out infinite' }}>
              <line 
                x1="0" y1="2" x2="-10" y2="2" 
                stroke={skinStroke} 
                strokeWidth="3" 
                strokeLinecap="round"
                className={isRainbow && !isDead ? "animate-rainbow-stroke" : ""}
              />
            </g>

            {/* Legs */}
            <g className="leg-group-right" style={{ animation: (isDead || isStatic) ? 'none' : 'leg-swing-right 1s ease-in-out infinite' }}>
              <line 
                x1="0" y1="10" x2="5" y2="20" 
                stroke={skinStroke} 
                strokeWidth="3" 
                strokeLinecap="round"
                className={isRainbow && !isDead ? "animate-rainbow-stroke" : ""}
              />
              {pants && (
                <g>
                   <line 
                     x1="0" y1="10" x2="5" y2="20" 
                     stroke={pants.includes('jeans') ? '#3b82f6' : (pants === 'pants_duck' ? '#fbbf24' : '#666')} 
                     strokeWidth={pants === 'pants_duck' ? "5" : "4.5"} 
                     strokeLinecap="round"
                   />
                   {pants === 'pants_duck' && (
                      <g transform="translate(2.5, 15) scale(0.4)">
                         <circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
                         <path d="M1,0 L4,-1 L4,1 Z" fill="#f97316" />
                         <circle cx="-1" cy="-1" r="0.5" fill="#000" />
                      </g>
                   )}
                </g>
              )}
            </g>
            <g className="leg-group-left" style={{ animation: (isDead || isStatic) ? 'none' : 'leg-swing-left 1s ease-in-out infinite' }}>
              <line 
                x1="0" y1="10" x2="-5" y2="20" 
                stroke={skinStroke} 
                strokeWidth="3" 
                strokeLinecap="round"
                className={isRainbow && !isDead ? "animate-rainbow-stroke" : ""}
              />
              {pants && (
                <g>
                   <line 
                     x1="0" y1="10" x2="-5" y2="20" 
                     stroke={pants.includes('jeans') ? '#3b82f6' : (pants === 'pants_duck' ? '#fbbf24' : '#666')} 
                     strokeWidth={pants === 'pants_duck' ? "5" : "4.5"} 
                     strokeLinecap="round"
                   />
                   {pants === 'pants_duck' && (
                      <g transform="translate(-2.5, 15) scale(0.4)">
                         <circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#000" strokeWidth="0.5" />
                         <path d="M1,0 L4,-1 L4,1 Z" fill="#f97316" />
                         <circle cx="-1" cy="-1" r="0.5" fill="#000" />
                      </g>
                   )}
                </g>
              )}
            </g>
          </g>
        </svg>
        <style>{`
          .arm-group-right { transform-origin: 20px 22px; }
          .arm-group-left { transform-origin: 20px 22px; }
          .leg-group-right { transform-origin: 20px 30px; }
          .leg-group-left { transform-origin: 20px 30px; }
          
          @keyframes arm-swing-right {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(40deg); }
          }
          @keyframes arm-swing-left {
            0%, 100% { transform: rotate(20deg); }
            50% { transform: rotate(-40deg); }
          }
          @keyframes leg-swing-right {
            0%, 100% { transform: rotate(20deg); }
            50% { transform: rotate(-20deg); }
          }
          @keyframes leg-swing-left {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(20deg); }
          }
          @keyframes rainbow-stroke {
            0% { stroke: #ff0000; }
            17% { stroke: #ff8800; }
            33% { stroke: #ffff00; }
            50% { stroke: #00ff00; }
            67% { stroke: #0088ff; }
            83% { stroke: #0000ff; }
            100% { stroke: #ff00ff; }
          }
          .animate-rainbow-stroke { animation: rainbow-stroke 2s infinite linear; }
        `}</style>
      </div>
    </div>
  );
};

export default PlayerPreview;
