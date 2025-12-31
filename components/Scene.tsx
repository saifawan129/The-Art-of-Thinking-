
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CoreGeometry from './CoreGeometry';
import { AppState } from '../types';

interface SceneProps {
  exploded: boolean;
  activeSection: string | null;
  hoveredPart: string | null;
  selectedDetail: AppState['selectedDetail'];
  onHover: (part: string | null) => void;
  onDetailSelect: (detail: AppState['selectedDetail']) => void;
  onClick: () => void;
}

const Scene: React.FC<SceneProps> = ({ 
  exploded, 
  activeSection, 
  hoveredPart, 
  selectedDetail,
  onHover, 
  onDetailSelect,
  onClick 
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
      
      if (activeSection === '04') {
        groupRef.current.rotation.y += 0.05;
      } else {
        groupRef.current.rotation.y += 0.005;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <CoreGeometry 
        exploded={exploded} 
        activeSection={activeSection}
        hoveredPart={hoveredPart} 
        selectedDetail={selectedDetail}
        onHover={onHover}
        onDetailSelect={onDetailSelect}
        onClick={onClick}
      />
    </group>
  );
};

export default Scene;
