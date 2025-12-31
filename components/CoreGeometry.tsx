
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CoreGeometryProps {
  exploded: boolean;
  activeSection: string | null;
  hoveredPart: string | null;
  onHover: (part: string | null) => void;
  onClick: () => void;
}

const CoreGeometry: React.FC<CoreGeometryProps> = ({ exploded, activeSection, hoveredPart, onHover, onClick }) => {
  const mainGroupRef = useRef<THREE.Group>(null);
  const icosahedronRef = useRef<THREE.Group>(null);
  const dodecahedronRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  
  // High-performance materials
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    thickness: 0.8,
    roughness: 0.05,
    transmission: 0.95,
    ior: 1.6,
    color: '#ffffff',
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    envMapIntensity: 1,
  }), []);

  const iridescentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ffff',
    metalness: 1,
    roughness: 0.05,
    emissive: '#0044ff',
    emissiveIntensity: 0.6,
  }), []);

  const deconMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff00ff', // Vibrant Magenta
    metalness: 0.8,
    roughness: 0.2,
    emissive: '#440044',
    emissiveIntensity: 0.5,
  }), []);

  // Pre-generate geometry faces
  const faceMeshes = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 0);
    const posAttr = geo.getAttribute('position');
    const meshes: { geometry: THREE.BufferGeometry, center: THREE.Vector3, randomAxis: THREE.Vector3 }[] = [];
    
    for (let i = 0; i < posAttr.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);
      
      const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
      v1.sub(center); v2.sub(center); v3.sub(center);
      
      const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2, v3]);
      geometry.computeVertexNormals();
      
      meshes.push({ 
        geometry, 
        center, 
        randomAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize() 
      });
    }
    return meshes;
  }, []);

  const faceRefs = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (mainGroupRef.current) {
      gsap.from(mainGroupRef.current.scale, {
        x: 0, y: 0, z: 0,
        duration: 2,
        ease: "elastic.out(1, 0.4)"
      });
    }
  }, []);

  useEffect(() => {
    const isShift = activeSection === '01';
    const isDecon = activeSection === '02';
    const isDesign = activeSection === '03';
    const isStreet = activeSection === '04';

    // Dodecahedron Morph
    if (dodecahedronRef.current) {
      gsap.to(dodecahedronRef.current.scale, {
        x: isShift ? 1.3 : 0,
        y: isShift ? 1.3 : 0,
        z: isShift ? 1.3 : 0,
        duration: 0.8,
        ease: "expo.out"
      });
    }

    // Explode Transitions
    faceRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const { center } = faceMeshes[i];
      
      // Determine explosion multiplier
      let mult = 1;
      if (isDecon) mult = 2.8; // Deconstruction is more aggressive
      else if (exploded) mult = 2.2; // Regular exploded view
      
      gsap.to(mesh.position, {
        x: center.x * mult,
        y: center.y * mult,
        z: center.z * mult,
        duration: 1.4,
        ease: "power4.inOut"
      });

      // Independent rotation for deconstruction
      gsap.to(mesh.rotation, {
        x: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        y: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        z: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        duration: 1.6,
        ease: "expo.out"
      });
    });

    // Design Transitions
    if (icosahedronRef.current) {
      gsap.to(icosahedronRef.current.scale, {
        x: isShift ? 0 : (isDesign ? 1.1 : 1),
        y: isShift ? 0 : (isDesign ? 1.1 : 1),
        z: isShift ? 0 : (isDesign ? 1.1 : 1),
        duration: 0.6,
        ease: "back.out(1.7)"
      });
    }
  }, [activeSection, exploded, faceMeshes]);

  useFrame((state) => {
    if (mainGroupRef.current) {
      // Mouse interaction
      const targetRotationX = mouse.y * 0.2;
      const targetRotationY = mouse.x * 0.2;
      mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(mainGroupRef.current.rotation.x, targetRotationX, 0.1);
      mainGroupRef.current.rotation.y = THREE.MathUtils.lerp(mainGroupRef.current.rotation.y, targetRotationY, 0.1);

      // Fast spin for Street mode
      if (activeSection === '04') {
        mainGroupRef.current.rotation.y += 0.08;
        mainGroupRef.current.rotation.z += 0.02;
      }
    }

    // Floating deconstruction drift
    if (activeSection === '02') {
      faceRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const time = state.clock.getElapsedTime();
        const { randomAxis } = faceMeshes[i];
        
        // Add subtle floating oscillation
        mesh.position.x += Math.sin(time * 0.5 + i) * 0.002;
        mesh.position.y += Math.cos(time * 0.4 + i) * 0.002;
        mesh.position.z += Math.sin(time * 0.3 + i) * 0.002;
        
        // Continuous independent rotation
        mesh.rotateOnAxis(randomAxis, 0.005);
      });
    }
  });

  return (
    <group ref={mainGroupRef}>
      {/* Dynamic Icosahedron Core */}
      <group ref={icosahedronRef}>
        {faceMeshes.map((data, i) => {
          const isFaceHovered = hoveredPart === `face_${i}`;
          
          // FIX: Explicitly typing activeMat to avoid 'MeshStandardMaterial is not assignable to MeshPhysicalMaterial' errors.
          let activeMat: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial = glassMat;
          if (activeSection === '02') activeMat = deconMat;
          else if (activeSection === '03') activeMat = iridescentMat;

          return (
            <mesh 
              key={i} 
              ref={el => faceRefs.current[i] = el!} 
              geometry={data.geometry} 
              position={[data.center.x, data.center.y, data.center.z]}
              onPointerOver={() => onHover(`face_${i}`)}
              onPointerOut={() => onHover(null)}
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              <primitive object={activeMat} attach="material" />
              
              {/* Structural Edge Overlay */}
              <mesh geometry={data.geometry}>
                <meshBasicMaterial 
                  color={isFaceHovered ? "#ffffff" : (activeSection === '02' ? "#000000" : activeSection === '04' ? "#ff00ff" : "#ffffff")} 
                  wireframe 
                  transparent 
                  opacity={isFaceHovered ? 1.0 : (activeSection === '01' ? 1 : 0.4)} 
                />
              </mesh>

              {/* Street Mode Decals */}
              {activeSection === '04' && i % 4 === 0 && (
                <mesh position={[0, 0, 0.02]} scale={0.6}>
                  <planeGeometry args={[1, 1]} />
                  <meshBasicMaterial color="#ffff00" transparent opacity={0.9} />
                </mesh>
              )}
            </mesh>
          );
        })}
      </group>

      {/* Structural Shift Mesh */}
      <mesh ref={dodecahedronRef} scale={0}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial 
          thickness={1.5} 
          transmission={0.9} 
          roughness={0} 
          color="#ffff00" 
          emissive="#ffff00" 
          emissiveIntensity={0.8} 
        />
        <mesh geometry={new THREE.DodecahedronGeometry(2, 0)}>
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </mesh>
    </group>
  );
};

export default CoreGeometry;
