
import React from 'react';
import { GameState } from '../types';
import { t } from '../translations';

interface HUDProps {
  stats: GameState;
  breachLevel: number;
  onSettings: () => void;
}

const HUD: React.FC<HUDProps> = ({ stats, breachLevel, onSettings }) => {
  const xpPercent = (stats.experience / stats.nextLevelExp) * 100;
  const hpPercent = (stats.health / stats.maxHealth) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between text-white orbitron z-30">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="relative pointer-events-auto">
          <div className="bg-cyan-500/10 backdrop-blur-xl px-4 py-3 md:px-6 md:py-4 border border-cyan-400/40 rounded-sm flex items-center gap-4">
            <div>
              <h1 className="text-sm md:text-xl font-black text-cyan-400 tracking-tighter">NEURO_ANTIBODY_01</h1>
              <div className="flex gap-2 md:gap-4 mt-1">
                  <span className="text-[8px] md:text-[10px] text-cyan-200/50">{t('system_sync')}: ACTIVE</span>
                  <span className={`text-[8px] md:text-[10px] font-bold ${breachLevel > 7 ? 'text-red-500' : 'text-cyan-200/50'}`}>
                    {t('virus_breach')}: LVL {breachLevel}
                  </span>
              </div>
            </div>
            <button 
              onClick={onSettings}
              className="p-2 hover:bg-cyan-500/20 transition-colors rounded border border-cyan-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM237.4,142l-18.7-4.7a88.8,88.8,0,0,0,0-18.6L237.4,114a16.1,16.1,0,0,0,12.1-18.7,112,112,0,0,0-21.3-37,16.2,16.2,0,0,0-20.9-4.3l-16,9.2a88.2,88.2,0,0,0-16.1-9.3L171.3,16a16,16,0,0,0-15.5-12,113.1,113.1,0,0,0-55.6,0A16,16,0,0,0,84.7,16L81,34.9a88.2,88.2,0,0,0-16.1,9.3L48.9,35a16.2,16.2,0,0,0-20.9,4.3,112,112,0,0,0-21.3,37A16.1,16.1,0,0,0,18.8,115l18.7,4.7a88.8,88.8,0,0,0,0,18.6l-18.7,4.7a16.1,16.1,0,0,0-12.1,18.7,112,112,0,0,0,21.3,37,16.2,16.2,0,0,0,20.9,4.3l16-9.2a88.2,88.2,0,0,0,16.1,9.3L84.7,240a16,16,0,0,0,15.5,12,113.1,113.1,0,0,0,55.6,0,16,16,0,0,0,15.5-12l3.7-18.9a88.2,88.2,0,0,0,16.1-9.3l16,9.2a16.2,16.2,0,0,0,20.9-4.3,112,112,0,0,0,21.3-37A16.1,16.1,0,0,0,237.4,142Zm-31.5,41.9-18.2-10.5a8,8,0,0,0-10.3,2.4,72.3,72.3,0,0,1-23.7,13.7,8.1,8.1,0,0,0-5.1,6.5L144.4,216a97.1,97.1,0,0,1-32.8,0l-4.2-20a8.1,8.1,0,0,0-5.1-6.5A72.3,72.3,0,0,1,78.6,175.8a8,8,0,0,0-10.3-2.4L50.1,183.9a96.6,96.6,0,0,1-16.4-28.4l18.2-4.5a8,8,0,0,0,5.9-9,73.1,73.1,0,0,1,0-28a8,8,0,0,0-5.9-9l-18.2-4.5A96.6,96.6,0,0,1,50.1,72.1l18.2,10.5a8,8,0,0,0,10.3-2.4,72.3,72.3,0,0,1,23.7-13.7,8.1,8.1,0,0,0,5.1-6.5L111.6,40a97.1,97.1,0,0,1,32.8,0l4.2,20a8.1,8.1,0,0,0,5.1,6.5,72.3,72.3,0,0,1,23.7,13.7,8,8,0,0,0,10.3-2.4L205.9,72.1a96.6,96.6,0,0,1,16.4,28.4l-18.2,4.5a8,8,0,0,0-5.9,9,73.1,73.1,0,0,1,0,28,8,8,0,0,0,5.9,9l18.2,4.5A96.6,96.6,0,0,1,205.9,183.9Z"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">{stats.score.toLocaleString()}</div>
          <div className="text-[7px] md:text-[9px] text-cyan-400 uppercase tracking-widest mt-1">{t('memory_fragments')}</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-2 max-w-sm md:max-w-xl mx-auto w-full mb-20 md:mb-16 px-4">
        <div className="flex justify-between text-[7px] md:text-[9px] font-black text-red-400 tracking-widest uppercase">
            <span>{t('core_integrity')}</span>
            <span>{Math.ceil(stats.health)}%</span>
        </div>
        <div className="relative h-1.5 md:h-2 bg-red-950/20 border border-red-500/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-300"
            style={{ width: `${Math.max(0, hpPercent)}%` }}
          />
        </div>

        <div className="flex justify-between text-[7px] md:text-[9px] font-black text-cyan-400 tracking-widest uppercase mt-1">
            <span>LEVEL_{stats.level}_{t('sync')}</span>
            <span>{Math.floor(xpPercent)}%</span>
        </div>
        <div className="relative h-1.5 md:h-2 bg-cyan-950/20 border border-cyan-500/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Corner */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 flex gap-4 md:gap-12 bg-black/40 backdrop-blur-md px-4 py-2 md:px-8 md:py-4 border border-white/5 skew-x-[-12deg]">
          <div className="text-center skew-x-[12deg]">
            <div className="text-[6px] md:text-[8px] opacity-40 uppercase font-black tracking-widest mb-0.5">{t('erased')}</div>
            <div className="text-lg md:text-2xl font-black text-white italic">{stats.kills}</div>
          </div>
          <div className="w-px h-full bg-white/10" />
          <div className="text-center skew-x-[12deg]">
            <div className="text-[6px] md:text-[8px] opacity-40 uppercase font-black tracking-widest mb-0.5">{t('uptime')}</div>
            <div className="text-lg md:text-2xl font-black text-cyan-400 italic">
              {Math.floor(stats.timeElapsed / 60000).toString().padStart(2, '0')}:
              {Math.floor((stats.timeElapsed % 60000) / 1000).toString().padStart(2, '0')}
            </div>
          </div>
      </div>
    </div>
  );
};

export default HUD;
