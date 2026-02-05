
import React from 'react';
import { KernelPatch } from '../types';
import { t } from '../translations';

interface LevelUpModalProps {
  options: KernelPatch[];
  onSelect: (patch: KernelPatch) => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 z-[200] overflow-y-auto">
      <div className="max-w-4xl w-full my-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="orbitron text-3xl md:text-5xl font-black text-cyan-400 mb-2">{t('kernel_patch')}</h2>
          <p className="text-gray-400 text-xs md:text-sm font-mono uppercase tracking-widest">{t('opt_required')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {options.map((patch) => (
            <button
              key={patch.id}
              onClick={() => onSelect(patch)}
              className="group relative bg-gray-900 border-2 border-cyan-900 hover:border-cyan-400 p-6 md:p-8 rounded-xl transition-all duration-300 text-left flex flex-col pointer-events-auto"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-cyan-400" />
              </div>
              
              <div className="mb-3 md:mb-4">
                <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase px-2 py-1 bg-cyan-950/50 rounded">
                  {patch.type}
                </span>
              </div>
              
              <h3 className="orbitron text-lg md:text-xl font-bold text-white mb-2 md:mb-4 group-hover:text-cyan-300 transition-colors">
                {patch.name}
              </h3>
              
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 flex-grow">
                {patch.description}
              </p>

              <div className="text-[10px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <span>[ {t('execute')} ]</span>
                <span className="animate-pulse">_</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
