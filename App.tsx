
import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import GraffitiLayer from './components/GraffitiLayer';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    exploded: false,
    hoveredPart: null,
    rotating: false,
    activeSection: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExplode = useCallback(() => {
    setState((prev) => ({ 
      ...prev, 
      exploded: !prev.exploded,
      activeSection: prev.exploded ? null : prev.activeSection 
    }));
  }, []);

  const setActiveSection = useCallback((id: string) => {
    setState((prev) => {
      const isDeconstruction = id === '02';
      return { 
        ...prev, 
        activeSection: id === prev.activeSection ? null : id,
        exploded: isDeconstruction
      };
    });
  }, []);

  // Theme transitions
  useEffect(() => {
    if (!containerRef.current) return;

    let bgColor = "#0066FF"; // Default Primary Blue
    if (state.activeSection === '03') bgColor = "#0A0A0A"; // Deep Charcoal
    if (state.activeSection === '04') bgColor = "#0044CC"; // Street Blue

    gsap.to(containerRef.current, {
      backgroundColor: bgColor,
      duration: 1.2,
      ease: "power3.inOut"
    });
  }, [state.activeSection]);

  // Initial loader cleanup
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleHover = useCallback((part: string | null) => {
    setState((prev) => ({ ...prev, hoveredPart: part }));
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-screen h-screen bg-[#0066FF] overflow-hidden transition-colors duration-1000 select-none"
    >
      {/* Loading Screen */}
      <div className={`fixed inset-0 z-[100] bg-[#0066FF] flex items-center justify-center transition-opacity duration-700 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-1 bg-white animate-pulse mb-4" />
          <span className="text-white font-black italic tracking-widest uppercase">Initializing_Core</span>
        </div>
      </div>

      {/* Background Graffiti Layer */}
      <GraffitiLayer active={state.activeSection === '04'} />

      {/* 3D Scene */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true }}
        onPointerDown={() => setState(p => ({ ...p, rotating: true }))}
        onPointerUp={() => setState(p => ({ ...p, rotating: false }))}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Scene 
            exploded={state.exploded} 
            activeSection={state.activeSection}
            hoveredPart={state.hoveredPart} 
            onHover={handleHover}
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
