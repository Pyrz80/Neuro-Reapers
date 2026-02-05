
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GameState, KernelPatch, Vector } from './types';
import HUD from './components/HUD';
import LevelUpModal from './components/LevelUpModal';
import { getKernelPatches, getGameLore } from './services/geminiService';
import { GAME_WIDTH, GAME_HEIGHT, VERSION } from './constants';
import { t } from './translations';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [breachLevel, setBreachLevel] = useState<number>(1);
  const [levelUpOptions, setLevelUpOptions] = useState<KernelPatch[] | null>(null);
  const [logs, setLogs] = useState<string[]>([t('system_ready'), t('awaiting_sync')]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bossWarning, setBossWarning] = useState(false);
  
  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    masterVolume: 0.3,
    effectsVolume: 1.0,
    isMuted: false
  });

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-5), `> ${msg}`]);
  }, []);

  const handleLevelUp = useCallback(async (level: number) => {
    addLog(`${t('sync')} ACHIEVEMENT: LEVEL ${level}`);
    const patches = await getKernelPatches(level);
    setLevelUpOptions(patches);
  }, [addLog]);

  const handleGameOver = useCallback(() => {
    addLog(t('data_loss'));
    setIsPlaying(false);
  }, [addLog]);

  const startGame = () => {
    setIsPlaying(true);
    setGameState(null);
    setBreachLevel(1);
    setLevelUpOptions(null);
    setLogs([t('rebooting'), t('antibody_deployed')]);
    setShowSettings(false);
    setShowAbout(false);
  };

  const returnToMenu = () => {
    setIsPlaying(false);
    setGameState(null);
    setShowSettings(false);
  };

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new GameEngine(ctx, handleLevelUp, handleGameOver);
    engineRef.current = engine;
    
    // Initial Audio Apply
    engine.audio.setMasterVolume(audioSettings.masterVolume);
    engine.audio.setEffectsVolume(audioSettings.effectsVolume);
    engine.audio.setMute(audioSettings.isMuted);
    engine.audio.resume();
    
    let requestRef: number;
    const loop = (time: number) => {
      if (!levelUpOptions && !showSettings && !showAbout) {
        engine.update(16);
        engine.draw();
        setGameState({ ...engine.stats });
        setBreachLevel(engine.breachLevel);
        setBossWarning(engine.bossActive);
      } else {
        // Still draw but don't update if paused
        engine.draw();
      }
      requestRef = requestAnimationFrame(loop);
    };
    requestRef = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef);
  }, [isPlaying, levelUpOptions, showSettings, showAbout, handleLevelUp, handleGameOver]);

  const handleSelectPatch = (patch: KernelPatch) => {
    engineRef.current?.applyPatch(patch);
    setLevelUpOptions(null);
    addLog(`PATCH: ${patch.name.toUpperCase()}`);
  };

  const updateAudio = (newSettings: any) => {
    setAudioSettings(newSettings);
    if (engineRef.current) {
      engineRef.current.audio.setMasterVolume(newSettings.masterVolume);
      engineRef.current.audio.setEffectsVolume(newSettings.effectsVolume);
      engineRef.current.audio.setMute(newSettings.isMuted);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none cursor-none touch-none">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="w-full h-full object-contain pointer-events-none" />

      {gameState && isPlaying && <HUD stats={gameState} breachLevel={breachLevel} onSettings={() => setShowSettings(true)} />}

      {bossWarning && !showSettings && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
           <div className="bg-red-600/20 border-y-4 border-red-500 w-full py-8 animate-pulse text-center">
              <h2 className="orbitron text-4xl md:text-7xl font-black text-red-500 tracking-tighter shadow-lg">
                {t('warning_boss')}
              </h2>
              <p className="text-white font-mono text-sm mt-2">{t('threat_eliminate')}</p>
           </div>
        </div>
      )}

      {levelUpOptions && <LevelUpModal options={levelUpOptions} onSelect={handleSelectPatch} />}

      {showSettings && (
        <SettingsModal 
          settings={audioSettings} 
          onUpdate={updateAudio} 
          onClose={() => setShowSettings(false)} 
          onMenu={returnToMenu}
          inGame={isPlaying}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}

      {(!isPlaying || gameState?.isGameOver) && !showSettings && !showAbout && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 p-4 text-center">
          <div className="absolute top-8 left-8 text-cyan-500/50 font-mono text-xs md:text-sm tracking-tighter">
            AvP Games {VERSION}
          </div>
          
          <h1 className="orbitron text-6xl md:text-9xl font-black text-white tracking-tighter mb-4">
            NEURO<span className="text-cyan-400">REAPERS</span>
          </h1>
          <p className="text-cyan-100/60 font-mono text-sm max-w-lg mb-8 uppercase tracking-widest">{t('subtitle')}</p>
          
          {gameState?.isGameOver && (
             <div className="mb-10 text-red-400 orbitron">
                <h3 className="text-2xl font-bold mb-4">{t('data_loss')}</h3>
                <div className="grid grid-cols-3 gap-8 text-xs font-mono">
                   <div>{t('recovered')}: {gameState.score}</div>
                   <div>{t('erased')}: {gameState.kills}</div>
                   <div>{t('stability')}: LVL {breachLevel}</div>
                </div>
             </div>
          )}

          <div className="flex flex-col gap-4">
            <button onClick={startGame} className="group relative px-12 py-6 bg-white text-black orbitron font-black text-2xl hover:bg-cyan-400 transition-all active:scale-95">
              {gameState?.isGameOver ? t('reboot_core') : t('boot_protocol')}
            </button>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setShowSettings(true)} className="px-6 py-3 border border-cyan-500 text-cyan-400 orbitron text-sm font-bold hover:bg-cyan-500/10 transition-colors">
                {t('settings')}
              </button>
              <button onClick={() => setShowAbout(true)} className="px-6 py-3 border border-white/20 text-white/50 orbitron text-sm font-bold hover:bg-white/5 transition-colors">
                {t('about')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Overlay */}
      <div className="absolute top-28 left-8 pointer-events-none space-y-1 z-10 hidden sm:block">
        {logs.map((log, i) => (
          <div key={i} className="text-cyan-400 font-mono text-[11px] bg-cyan-950/20 px-3 py-1 border-l-2 border-cyan-400/50 backdrop-blur-md">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modal Components ---

const SettingsModal = ({ settings, onUpdate, onClose, onMenu, inGame }: any) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border-2 border-cyan-500/50 p-8 orbitron shadow-[0_0_50px_rgba(34,211,238,0.3)]">
        <h2 className="text-3xl font-black text-cyan-400 mb-8 tracking-tighter uppercase">{t('settings')}</h2>
        
        <div className="space-y-8 mb-12">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between mb-2 text-xs font-bold text-white/50">
              <span>{t('master')}</span>
              <span>{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={settings.masterVolume}
              onChange={(e) => onUpdate({...settings, masterVolume: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Effects Volume */}
          <div>
            <div className="flex justify-between mb-2 text-xs font-bold text-white/50">
              <span>{t('effects')}</span>
              <span>{Math.round(settings.effectsVolume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={settings.effectsVolume}
              onChange={(e) => onUpdate({...settings, effectsVolume: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-widest uppercase">{t('audio')}</span>
            <button 
              onClick={() => onUpdate({...settings, isMuted: !settings.isMuted})}
              className={`px-4 py-1 border ${settings.isMuted ? 'border-red-500 text-red-500' : 'border-cyan-500 text-cyan-400'} font-black text-xs transition-colors`}
            >
              {settings.isMuted ? t('off') : t('on')}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onClose} className="w-full py-4 bg-cyan-500 text-black font-black hover:bg-cyan-400 transition-all uppercase tracking-tighter">
            {inGame ? t('resume') : t('back')}
          </button>
          {inGame && (
            <button onClick={onMenu} className="w-full py-4 border border-white/20 text-white font-black hover:bg-white/5 transition-all uppercase tracking-tighter text-sm">
              {t('main_menu')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AboutModal = ({ onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gray-900 border-2 border-white/20 p-8 orbitron relative">
        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-400" />
        <h2 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase">{t('about')}</h2>
        
        <p className="text-cyan-100/70 font-mono text-sm leading-relaxed mb-8 uppercase tracking-widest italic">
          {t('about_text')}
        </p>

        <div className="bg-cyan-950/20 p-4 border-l-4 border-cyan-400 font-mono text-[10px] text-cyan-500 mb-8 space-y-2">
          <div>// PROJECT: NEURO-REAPERS</div>
          <div>// BUILD: {VERSION}</div>
          <div>// DEV_LAB: AvP_GAMES</div>
          <div>// STATUS: STABLE</div>
        </div>

        <button onClick={onClose} className="w-full py-4 border border-cyan-500 text-cyan-400 font-black hover:bg-cyan-500/10 transition-all uppercase tracking-tighter">
          {t('back')}
        </button>
      </div>
    </div>
  );
};

export default App;
