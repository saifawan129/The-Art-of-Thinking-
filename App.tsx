
import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import GraffitiLayer from './components/GraffitiLayer';
import { SkateboardState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<SkateboardState>({
    exploded: false,
    hoveredPart: null,
    rotating: false,
    activeSection: null,
  });

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
      // If user clicks DECONSTRUCTION, trigger exploded view automatically
      const shouldExplode = id === '02';
      return { 
        ...prev, 
        activeSection: id,
        exploded: shouldExplode
      };
    });
  }, []);

  // Global Theme Transition
  useEffect(() => {
    if (!containerRef.current) return;

    let bgColor = "#0066FF"; // Default Blue
    if (state.activeSection === '03') bgColor = "#121212"; // Deep Charcoal
    if (state.activeSection === '04') bgColor = "#0044CC"; // Deep Street Blue

    gsap.to(containerRef.current, {
      backgroundColor: bgColor,
      duration: 1,
      ease: "power2.inOut"
    });
  }, [state.activeSection]);

  const handleHover = useCallback((part: string | null) => {
    setState((prev) => ({ ...prev, hoveredPart: part }));
  }, []);

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-[#0066FF] overflow-hidden transition-colors duration-1000">
      {/* Background Graffiti Layer */}
      <GraffitiLayer active={state.activeSection === '04'} />

      {/* 3D Scene Layer */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.5} />
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
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          onStart={() => setState(prev => ({ ...prev, rotating: true }))}
          onEnd={() => setState(prev => ({ ...prev, rotating: false }))}
        />
      </Canvas>

      {/* UI Overlay Layer */}
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
