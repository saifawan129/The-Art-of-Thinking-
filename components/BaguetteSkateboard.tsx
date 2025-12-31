
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface BaguetteSkateboardProps {
  exploded: boolean;
  activeSection: string | null;
  hoveredPart: string | null;
  onHover: (part: string | null) => void;
  onClick: () => void;
}

const BaguetteSkateboard: React.FC<BaguetteSkateboardProps> = ({ exploded, activeSection, hoveredPart, onHover, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const sliceRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const wheelRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  
  // Colors & Materials
  const breadColor = "#E6A15C";
  const carbonColor = "#1A1A1A";
  const wheelColorDefault = "#FF3366";
  const wheelColorFlavor = "#00FFFF"; // Neon Cyan for flavor shift
  const highlightColor = "#FFFF00";

  // Initial Entrance Animation
  useEffect(() => {
    if (groupRef.current) {
      gsap.from(groupRef.current.scale, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)"
      });
    }
  }, []);

  // 01 CRAFTSMANSHIP: Material Transformation
  useEffect(() => {
    const isCarbon = activeSection === '01';
    sliceRefs.forEach((ref) => {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat.color, {
          r: new THREE.Color(isCarbon ? carbonColor : breadColor).r,
          g: new THREE.Color(isCarbon ? carbonColor : breadColor).g,
          b: new THREE.Color(isCarbon ? carbonColor : breadColor).b,
          duration: 0.8,
          ease: "power2.inOut"
        });
        gsap.to(mat, {
          metalness: isCarbon ? 0.9 : 0.1,
          roughness: isCarbon ? 0.2 : 0.7,
          duration: 0.8
        });
      }
    });
  }, [activeSection]);

  // 02 AERODYNAMICS: Exploded / Slice View
  useEffect(() => {
    const isAero = activeSection === '02';
    const explosionDist = 1.5;
    const sliceDist = 0.4;

    // Slices Move apart vertically
    sliceRefs.forEach((ref, i) => {
      if (ref.current) {
        const targetY = isAero ? (i - 1) * sliceDist : (i - 1) * 0.23; // Adjusted for thickness
        gsap.to(ref.current.position, {
          y: targetY,
          duration: 0.8,
          ease: "back.out(1.7)"
        });
      }
    });

    // Wheels fly out
    wheelRefs.forEach((ref, i) => {
      if (ref.current) {
        gsap.to(ref.current.position, {
          y: exploded || isAero ? (ref.current.position.y > 0 ? explosionDist : -explosionDist) : (i < 2 ? 0.4 : -0.4),
          x: exploded || isAero ? (ref.current.position.x > 0 ? explosionDist : -explosionDist) : (i % 2 === 0 ? -1.5 : 1.5),
          z: exploded || isAero ? 1.5 : 0.6,
          duration: 0.8,
          ease: "power3.inOut"
        });
      }
    });
  }, [exploded, activeSection]);

  // 03 FLAVOR PROFILE: Wheel Glow
  useEffect(() => {
    const isFlavor = activeSection === '03';
    wheelRefs.forEach((ref) => {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat.color, {
          r: new THREE.Color(isFlavor ? wheelColorFlavor : wheelColorDefault).r,
          g: new THREE.Color(isFlavor ? wheelColorFlavor : wheelColorDefault).g,
          b: new THREE.Color(isFlavor ? wheelColorFlavor : wheelColorDefault).b,
          duration: 0.5
        });
        gsap.to(mat, {
          emissiveIntensity: isFlavor ? 2 : 0,
          duration: 0.5
        });
        mat.emissive.set(isFlavor ? wheelColorFlavor : "#000000");
      }
    });
  }, [activeSection]);

  // 04 STREET WEAR: Kickflip Rotation
  useEffect(() => {
    if (activeSection === '04' && groupRef.current) {
      gsap.to(groupRef.current.rotation, {
        x: groupRef.current.rotation.x + Math.PI * 2,
        z: groupRef.current.rotation.z + Math.PI * 2,
        duration: 1.2,
        ease: "back.inOut(1.4)"
      });
    }
  }, [activeSection]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    wheelRefs.forEach((ref) => {
      if (ref.current && !exploded && activeSection !== '02') {
        ref.current.rotation.x += 0.05;
      }
    });
    // Idle bobbing
    if (groupRef.current && !exploded) {
      groupRef.current.position.y = Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3 Floating Horizontal Slices */}
      <group ref={bodyRef}>
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            ref={sliceRefs[i]} 
            position={[0, (i - 1) * 0.23, 0]} 
            castShadow
            onPointerOver={() => onHover('bread')}
            onPointerOut={() => onHover(null)}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <boxGeometry args={[4.5, 0.22, 1]} />
            <meshStandardMaterial color={breadColor} roughness={0.7} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Crust Details - attached to top slice */}
      <group position={[0, 0.36, 0]}>
        {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.3, 0.05, 0.8]} />
            <meshStandardMaterial color="#B06D30" />
          </mesh>
        ))}
      </group>

      {/* Wheels */}
      <group>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i} 
            ref={wheelRefs[i]} 
            position={[
              i < 2 ? -1.5 : 1.5, 
              -0.4, 
              i % 2 === 0 ? 0.6 : -0.6
            ]} 
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={wheelColorDefault} emissive="#000000" emissiveIntensity={0} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default BaguetteSkateboard;
