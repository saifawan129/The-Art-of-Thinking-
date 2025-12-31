
import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import gsap from 'gsap';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import GraffitiLayer from './components/GraffitiLayer';
import { AppState } from './types';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#0A0A0A] z-[200]">
        <div className="w-48 h-[2px] bg-white/20 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-orange-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white font-black italic tracking-widest uppercase mt-4 text-[10px]">
          Initializing_Core_{Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    exploded: false,
    hoveredPart: null,
    rotating: false,
    activeSection: null,
    selectedDetail: null,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExplode = useCallback(() => {
    setState((prev) => ({ 
      ...prev, 
      exploded: !prev.exploded,
      activeSection: prev.exploded ? null : prev.activeSection,
      selectedDetail: null // Clear detail on explode
    }));
  }, []);

  const setActiveSection = useCallback((id: string) => {
    setState((prev) => {
      const isDeconstruction = id === '02';
      return { 
        ...prev, 
        activeSection: id === prev.activeSection ? null : id,
        exploded: isDeconstruction,
        selectedDetail: null
      };
    });
  }, []);

  const handleDetailSelect = useCallback((detail: AppState['selectedDetail']) => {
    setState(prev => ({ ...prev, selectedDetail: detail }));
  }, []);

  // Theme transitions
  useEffect(() => {
    if (!containerRef.current) return;

    let bgColor = "#0A0A0A"; // Default: Design & Color Spectrum
    if (state.activeSection === '01') bgColor = "#0066FF"; // Structural Blue
    if (state.activeSection === '02') bgColor = "#FFD700"; // Vibrant Gold/Yellow for Deconstruction
    if (state.activeSection === '03') bgColor = "#0A0A0A"; // Deep Charcoal
    if (state.activeSection === '04') bgColor = "#0044CC"; // Street Blue

    gsap.to(containerRef.current, {
      backgroundColor: bgColor,
      duration: 1.2,
      ease: "power3.inOut"
    });
  }, [state.activeSection]);

  const handleHover = useCallback((part: string | null) => {
    setState((prev) => ({ ...prev, hoveredPart: part }));
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-screen h-screen bg-[#0A0A0A] overflow-hidden transition-colors duration-1000 select-none"
    >
      {/* Background Graffiti Layer */}
      <GraffitiLayer active={state.activeSection === '04'} />

      {/* 3D Scene */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
        onPointerDown={() => setState(p => ({ ...p, rotating: true }))}
        onPointerUp={() => setState(p => ({ ...p, rotating: false }))}
        onPointerMissed={() => setState(p => ({ ...p, selectedDetail: null }))}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={<Loader />}>
          <Scene 
            exploded={state.exploded} 
            activeSection={state.activeSection}
            hoveredPart={state.hoveredPart} 
            selectedDetail={state.selectedDetail}
            onHover={handleHover}
            onDetailSelect={handleDetailSelect}
            onClick={toggleExplode}
          />
          <Environment preset="city" />
          <ContactShadows 
            position={[0, -2.5, 0]} 
            opacity={0.3} 
            scale={12} 
            blur={2.5} 
            far={5} 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Interface Overlay */}
      <Overlay 
        state={state} 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        onExplode={toggleExplode}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default App;
