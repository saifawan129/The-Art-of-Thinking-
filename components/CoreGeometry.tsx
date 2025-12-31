
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

  // Pre-generate geometry faces
  const faceMeshes = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 0);
    const posAttr = geo.getAttribute('position');
    const meshes: { geometry: THREE.BufferGeometry, center: THREE.Vector3 }[] = [];
    
    for (let i = 0; i < posAttr.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);
      
      const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
      v1.sub(center); v2.sub(center); v3.sub(center);
      
      const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2, v3]);
      geometry.computeVertexNormals();
      meshes.push({ geometry, center });
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
      const mult = isDecon || exploded ? 2.2 : 1;
      
      gsap.to(mesh.position, {
        x: center.x * mult,
        y: center.y * mult,
        z: center.z * mult,
        duration: 1,
        ease: "power4.out"
      });

      gsap.to(mesh.rotation, {
        x: isDecon ? (Math.random() - 0.5) * Math.PI : 0,
        y: isDecon ? (Math.random() - 0.5) * Math.PI : 0,
        duration: 1.2
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
  });

  return (
    <group ref={mainGroupRef}>
      {/* Dynamic Icosahedron Core */}
      <group ref={icosahedronRef}>
        {faceMeshes.map((data, i) => (
          <mesh 
            key={i} 
            ref={el => faceRefs.current[i] = el!} 
            geometry={data.geometry} 
            position={[data.center.x, data.center.y, data.center.z]}
            onPointerOver={() => onHover(`face_${i}`)}
            onPointerOut={() => onHover(null)}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <primitive object={activeSection === '03' ? iridescentMat : glassMat} attach="material" />
            
            {/* Structural Edge Overlay */}
            <mesh geometry={data.geometry}>
              <meshBasicMaterial 
                color={activeSection === '04' ? "#ff00ff" : "#ffffff"} 
                wireframe 
                transparent 
                opacity={activeSection === '01' ? 1 : 0.4} 
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
        ))}
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
