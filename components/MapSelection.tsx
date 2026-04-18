import React, { useState } from 'react';
import { WORLDS, getWorldForLevel } from '../constants';
import { Language } from '../types';

interface MapSelectionProps {
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  language: Language;
}

export const MapSelection: React.FC<MapSelectionProps> = ({ currentLevelId, onSelectLevel, onBack, language }) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(() => getWorldForLevel(currentLevelId).id);

  const highestWorldId = getWorldForLevel(currentLevelId).id;

  const renderLevels = () => {
    const startLevel = (selectedWorldId - 1) * 50 + 1;
    const levels = [];
    for (let i = 0; i < 50; i++) {
      const levelId = startLevel + i;
      const isUnlocked = levelId <= currentLevelId;
      levels.push(
        <button
          key={levelId}
          disabled={!isUnlocked}
          onClick={() => onSelectLevel(levelId)}
          className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg font-black text-sm sm:text-lg border-2 ${
            isUnlocked
              ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-800 hover:scale-110 text-white shadow-lg'
              : 'bg-zinc-800 border-zinc-900 text-zinc-600 cursor-not-allowed'
          } transition-all`}
        >
          {levelId - startLevel + 1}
        </button>
      );
    }
    return levels;
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-[600] flex flex-col p-4 sm:p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 uppercase">
          {language === 'it' ? 'Mappe' : 'Maps'}
        </h2>
        <button onClick={onBack} className="bg-red-600 border-b-4 border-red-900 text-white px-6 py-2 rounded font-black hover:bg-red-700">
          X
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 min-h-0">
        <div className="w-full md:w-1/3 flex flex-col gap-3 overflow-y-auto max-h-[30vh] md:max-h-[80vh] pb-4 md:pb-10 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{language === 'it' ? 'Mondi' : 'Worlds'}</h3>
          {WORLDS.map(w => {
             const isUnlocked = w.id <= highestWorldId;
             return (
               <button
                 key={w.id}
                 disabled={!isUnlocked}
                 onClick={() => setSelectedWorldId(w.id)}
                 className={`p-4 rounded-xl border-l-8 text-left transition-all ${
                   !isUnlocked ? 'bg-zinc-900 border-zinc-800 text-zinc-600' :
                   selectedWorldId === w.id ? 'bg-zinc-800 border-blue-500 text-white scale-105 shadow-xl shadow-blue-500/20' : 'bg-zinc-800 border-purple-500 text-zinc-300 hover:bg-zinc-700'
                 }`}
               >
                 <div className="font-black text-xl">{w.name}</div>
                 {isUnlocked && <div className="text-sm opacity-80 mt-1">{w.desc}</div>}
                 {!isUnlocked && <div className="text-xs text-red-500 font-bold mt-2">🔒 {language === 'it' ? 'Bloccato' : 'Locked'}</div>}
               </button>
             );
          })}
        </div>

        <div className="w-full md:w-2/3 max-w-3xl bg-zinc-900 rounded-2xl p-4 sm:p-6 border-2 border-zinc-800 overflow-y-auto flex-1 md:flex-none md:max-h-[80vh]">
          <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 flex items-center justify-between">
            <span>{WORLDS.find(w => w.id === selectedWorldId)?.name}</span>
            <span className="text-[10px] md:text-sm font-bold bg-zinc-800 px-2 md:px-3 py-0.5 md:py-1 rounded text-zinc-400">{language === 'it' ? 'Livelli' : 'Levels'} 1-50</span>
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
            {renderLevels()}
          </div>
        </div>
      </div>
    </div>
  );
};
