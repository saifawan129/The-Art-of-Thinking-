
import React from 'react';
import { SkateboardState, MENU_ITEMS } from '../types';

interface OverlayProps {
  state: SkateboardState;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onExplode: () => void;
  setActiveSection: (id: string) => void;
}

const Overlay: React.FC<OverlayProps> = ({ state, menuOpen, setMenuOpen, onExplode, setActiveSection }) => {
  const getSectionColor = () => {
    if (state.activeSection === '03') return 'text-orange-400';
    if (state.activeSection === '04') return 'text-pink-400';
    return 'text-cyan-400';
  };

  const getSectionTitle = () => {
    const item = MENU_ITEMS.find(m => m.id === state.activeSection);
    return item ? item.label : 'SYSTEM ONLINE';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 text-white z-10">
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
            Thought<br />
            <span className={`transition-colors duration-500 ${getSectionColor()}`}>Form</span>
          </h1>
          <p className="mt-2 text-sm font-bold opacity-80 uppercase tracking-widest">
            {state.activeSection === '04' ? 'CORE GEOMETRY_HACKED' : 'Est. 2025 • The Art of Thinking'}
          </p>
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="group relative flex flex-col gap-1.5 justify-center items-end"
        >
          <div className={`h-1 bg-white transition-all duration-300 ${menuOpen ? 'w-8 rotate-45 translate-y-2.5' : 'w-10'}`} />
          <div className={`h-1 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : 'w-6'}`} />
          <div className={`h-1 bg-white transition-all duration-300 ${menuOpen ? 'w-8 -rotate-45 -translate-y-2.5' : 'w-8'}`} />
        </button>
      </header>

      {/* Center Feedback */}
      <div className="flex-grow flex items-center justify-center pointer-events-none">
        <div className={`transition-all duration-500 transform ${state.activeSection || state.exploded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className={`px-8 py-4 font-black text-4xl uppercase skew-x-[-12deg] transition-colors duration-500 ${state.activeSection === '03' ? 'bg-orange-400 text-black' : (state.activeSection === '04' ? 'bg-pink-400 text-white' : 'bg-cyan-400 text-[#0066FF]')}`}>
            {getSectionTitle()}
          </div>
        </div>
      </div>

      {/* Bottom Layout */}
      <footer className="flex flex-col md:flex-row justify-between items-end gap-8 pointer-events-auto">
        <div className="flex flex-col gap-2 max-w-sm">
          <h3 className={`text-xl font-black uppercase transition-colors duration-500 ${getSectionColor()}`}>
            {state.activeSection ? `Node_${state.activeSection}` : 'Logic_042'}
          </h3>
          <p className="text-sm font-medium leading-relaxed opacity-90 transition-opacity duration-300">
            {state.activeSection === '01' && "Structural Shift active. Reconfiguring vertex coordinates from Icosahedron to Dodecahedron."}
            {state.activeSection === '02' && "Core Deconstruction initiated. Decoupling polygon faces to visualize the internal logic flow."}
            {state.activeSection === '03' && "Design protocols updated. Iridescent metallic material shift complete. Environment darkened for focus."}
            {state.activeSection === '04' && "Graffiti protocols active. Digital tagging applied to central core. High-energy rotation enabled."}
            {!state.activeSection && "Interact with the core thought form. A central polyhedron mapping the complexity of the human mind."}
          </p>
          <button 
            onClick={onExplode}
            className="mt-4 self-start bg-white text-[#0066FF] px-6 py-2 font-black uppercase tracking-tighter hover:bg-yellow-400 transition-colors"
          >
            {state.exploded ? 'Reassemble' : 'Explode View'}
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
          {MENU_ITEMS.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setActiveSection(item.id)}
              className="group cursor-pointer flex flex-col items-start min-w-[120px]"
            >
              <span className={`text-xs font-bold transition-colors ${state.activeSection === item.id ? 'text-white' : 'text-cyan-400 opacity-60'} mb-1`}>
                {item.id}
              </span>
              <span className={`text-lg font-black italic uppercase transition-colors whitespace-nowrap ${state.activeSection === item.id ? (item.id === '04' ? 'text-pink-400' : (item.id === '03' ? 'text-orange-400' : 'text-cyan-400')) : 'group-hover:text-cyan-400'}`}>
                {item.label}
              </span>
              <div className={`h-1 transition-all duration-300 ${state.activeSection === item.id ? 'w-full bg-white' : 'w-0 bg-cyan-400 group-hover:w-full'}`} />
            </div>
          ))}
        </div>
      </footer>

      {/* Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0066FF] z-50 transition-transform duration-700 pointer-events-auto flex items-center justify-center ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <button 
          onClick={() => setMenuOpen(false)}
          className="absolute top-12 right-12 text-4xl font-black hover:text-yellow-400 transition-colors"
        >
          CLOSE
        </button>
        <nav className="flex flex-col items-center gap-6">
          {['Core', 'Logic', 'Memory', 'Input'].map((item, i) => (
            <a 
              key={i} 
              href="#" 
              className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter hover:text-yellow-400 transition-all hover:skew-x-[-6deg]"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Overlay;
