
import React from 'react';
import { AppState, MENU_ITEMS } from '../types';

interface OverlayProps {
  state: AppState;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onExplode: () => void;
  setActiveSection: (id: string) => void;
}

const Overlay: React.FC<OverlayProps> = ({ state, menuOpen, setMenuOpen, onExplode, setActiveSection }) => {
  const getSectionColor = () => {
    if (state.activeSection === '01') return 'text-cyan-400';
    if (state.activeSection === '02') return 'text-black'; // High contrast on yellow
    if (state.activeSection === '03') return 'text-orange-400';
    if (state.activeSection === '04') return 'text-pink-500';
    return 'text-orange-400'; // Default: Design & Color Spectrum
  };

  const currentItem = MENU_ITEMS.find(m => m.id === state.activeSection);
  
  // Logical override for the "STREET WEAR" / Graffiti mode
  const isStreetMode = state.activeSection === '04';
  const isDeconMode = state.activeSection === '02';

  const getBannerText = () => {
    if (isStreetMode) return 'SYSTEM ONLINE';
    return currentItem ? currentItem.label : 'REASSEMBLED';
  };

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10 overflow-hidden transition-colors duration-500 ${isDeconMode ? 'text-black' : 'text-white'}`}>
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase group">
            <span className="block">Thought</span>
            <span className={`transition-colors duration-500 ${getSectionColor()}`}>Form</span>
          </h1>
          <p className="mt-4 text-[10px] md:text-xs font-black opacity-60 uppercase tracking-[0.3em]">
            {isStreetMode ? 'DECRYPTION_IN_PROGRESS' : 'Core_V4.2 // Paris Edition'}
          </p>
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
          className="group relative flex flex-col gap-1.5 justify-center items-end"
        >
          <div className={`h-[3px] transition-all duration-500 ${menuOpen ? 'w-10 rotate-45 translate-y-2' : 'w-12'} ${isDeconMode ? 'bg-black' : 'bg-white'}`} />
          <div className={`h-[3px] transition-all duration-500 ${menuOpen ? 'opacity-0' : 'w-8'} ${isDeconMode ? 'bg-black' : 'bg-white'}`} />
          <div className={`h-[3px] transition-all duration-500 ${menuOpen ? 'w-10 -rotate-45 -translate-y-2' : 'w-10'} ${isDeconMode ? 'bg-black' : 'bg-white'}`} />
        </button>
      </header>

      {/* Modal Status Banner */}
      <div className="flex-grow flex items-center justify-center pointer-events-none">
        <div className={`transition-all duration-700 transform ${state.activeSection || state.exploded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div 
            className={`px-10 py-5 text-3xl md:text-5xl uppercase skew-x-[-12deg] transition-all duration-500 shadow-2xl ${
              isStreetMode 
                ? 'bg-pink-500 text-white font-["Permanent_Marker"] lowercase scale-110 shadow-[0_0_30px_rgba(236,72,153,0.5)]' 
                : state.activeSection === '02'
                  ? 'bg-black text-[#FFD700] font-black'
                  : state.activeSection === '03' 
                    ? 'bg-orange-400 text-black font-black' 
                    : 'bg-orange-400 text-black font-black'
            }`}
          >
            {getBannerText()}
          </div>
        </div>
      </div>

      {/* Main Footer Info & Controls */}
      <footer className="flex flex-col md:flex-row justify-between items-end gap-10 pointer-events-auto">
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${state.activeSection ? 'bg-green-400' : (isDeconMode ? 'bg-black' : 'bg-orange-400')}`} />
            <h3 className={`text-lg font-black uppercase tracking-widest ${getSectionColor()}`}>
              {state.activeSection ? `Node_v${state.activeSection}` : 'Awaiting_Input'}
            </h3>
          </div>
          
          <p className="text-xs md:text-sm font-bold leading-relaxed opacity-80 min-h-[4.5rem]">
            {currentItem?.description || "A generative 3D thought form mapped through geometric complexity. Interact with the core to observe structural and material transitions."}
          </p>

          <button 
            onClick={onExplode}
            className={`self-start px-8 py-3 font-black uppercase tracking-tighter transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              state.exploded ? 'bg-pink-500 text-white' : (isDeconMode ? 'bg-black text-[#FFD700] hover:bg-black/80' : 'bg-white text-black hover:text-orange-400')
            }`}
          >
            {state.exploded ? 'Collapse Core' : 'Explode View'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex gap-4 md:gap-10 overflow-x-auto pb-4 no-scrollbar w-full md:w-auto">
          {MENU_ITEMS.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)}
              className="group flex flex-col items-start min-w-[140px] text-left outline-none"
            >
              <span className={`text-[10px] font-black transition-colors ${state.activeSection === item.id ? (isDeconMode ? 'text-black' : 'text-white') : 'text-white/40'} mb-1`}>
                SYS_{item.id}
              </span>
              <span className={`text-sm md:text-base font-black italic uppercase transition-all duration-300 ${
                state.activeSection === item.id ? getSectionColor() : (isDeconMode ? 'text-black/60 group-hover:text-black' : 'text-white/60 group-hover:text-orange-400')
              }`}>
                {item.label}
              </span>
              <div className={`h-[2px] mt-2 transition-all duration-500 ${
                state.activeSection === item.id ? (isDeconMode ? 'w-full bg-black' : 'w-full bg-white') : (isDeconMode ? 'w-0 bg-black/30 group-hover:w-full' : 'w-0 bg-orange-400 group-hover:w-full')
              }`} />
            </button>
          ))}
        </nav>
      </footer>

      {/* Fullscreen Navigation Overlay */}
      <div className={`fixed inset-0 bg-[#0A0A0A] z-50 transition-all duration-700 pointer-events-auto flex flex-col items-center justify-center gap-8 ${menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <button 
          onClick={() => setMenuOpen(false)}
          className="absolute top-12 right-12 text-2xl font-black hover:text-orange-400 transition-colors uppercase tracking-widest text-white"
        >
          Close [Esc]
        </button>
        <div className="flex flex-col items-center gap-6">
          {['Core_Logic', 'Memory_Bank', 'Heuristic_V02', 'System_Sync'].map((item, i) => (
            <a 
              key={i} 
              href="#" 
              className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter hover:text-orange-400 transition-all hover:skew-x-[-8deg] hover:scale-110 text-white"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="absolute bottom-12 text-[10px] font-black opacity-30 uppercase tracking-[0.5em] text-white">
          Designed for the Art of Thinking // 2025
        </div>
      </div>
    </div>
  );
};

export default Overlay;