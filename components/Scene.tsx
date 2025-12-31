
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CoreGeometry from './CoreGeometry';

interface SceneProps {
  exploded: boolean;
  activeSection: string | null;
  hoveredPart: string | null;
  onHover: (part: string | null) => void;
  onClick: () => void;
}

const Scene: React.FC<SceneProps> = ({ exploded, activeSection, hoveredPart, onHover, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
      groupRef.current.rotation.y += 0.005;
      
      if (activeSection === '04') {
        groupRef.current.rotation.y += 0.05;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <CoreGeometry 
        exploded={exploded} 
        activeSection={activeSection}
        hoveredPart={hoveredPart} 
        onHover={onHover}
        onClick={onClick}
      />
    </group>
  );
};

export default Scene;
