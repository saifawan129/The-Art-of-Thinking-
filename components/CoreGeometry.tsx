
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { AppState } from '../types';

interface CoreGeometryProps {
  exploded: boolean;
  activeSection: string | null;
  hoveredPart: string | null;
  selectedDetail: AppState['selectedDetail'];
  onHover: (part: string | null) => void;
  onDetailSelect: (detail: AppState['selectedDetail']) => void;
  onClick: () => void;
}

const CoreGeometry: React.FC<CoreGeometryProps> = ({ 
  exploded, 
  activeSection, 
  hoveredPart, 
  selectedDetail,
  onHover, 
  onDetailSelect,
  onClick 
}) => {
  const mainGroupRef = useRef<THREE.Group>(null);
  const icosahedronRef = useRef<THREE.Group>(null);
  const dodecahedronRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { mouse } = useThree();
  
  // High-performance materials
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

  const greyBlackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a', // Greyish Black
    metalness: 0.9,
    roughness: 0.1,
    emissive: '#050505',
    emissiveIntensity: 0.2,
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

  // Entrance animation
  useEffect(() => {
    if (mainGroupRef.current) {
      gsap.from(mainGroupRef.current.scale, {
        x: 0, y: 0, z: 0,
        duration: 2,
        ease: "elastic.out(1, 0.4)"
      });
    }
  }, []);

  // Hover expansion effect
  useEffect(() => {
    if (mainGroupRef.current) {
      const isHovered = hoveredPart !== null;
      gsap.to(mainGroupRef.current.scale, {
        x: isHovered ? 1.08 : 1.0,
        y: isHovered ? 1.08 : 1.0,
        z: isHovered ? 1.08 : 1.0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [hoveredPart]);

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
      
      let mult = 1;
      if (isDecon) mult = 2.8; 
      else if (exploded) mult = 2.2; 
      
      gsap.to(mesh.position, {
        x: center.x * mult,
        y: center.y * mult,
        z: center.z * mult,
        duration: 1.4,
        ease: "power4.inOut"
      });

      gsap.to(mesh.rotation, {
        x: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        y: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        z: isDecon ? (Math.random() - 0.5) * Math.PI * 2 : 0,
        duration: 1.6,
        ease: "expo.out"
      });
    });

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

  // Handle cinematic label animation
  useEffect(() => {
    if (selectedDetail && labelRef.current) {
      gsap.fromTo(labelRef.current, 
        { opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: "expo.out" }
      );
    }
  }, [selectedDetail]);

  useFrame((state) => {
    if (mainGroupRef.current) {
      const targetRotationX = mouse.y * 0.2;
      const targetRotationY = mouse.x * 0.2;
      mainGroupRef.current.rotation.x = THREE.MathUtils.lerp(mainGroupRef.current.rotation.x, targetRotationX, 0.1);
      mainGroupRef.current.rotation.y = THREE.MathUtils.lerp(mainGroupRef.current.rotation.y, targetRotationY, 0.1);

      if (activeSection === '04') {
        mainGroupRef.current.rotation.y += 0.08;
        mainGroupRef.current.rotation.z += 0.02;
      }
    }

    if (activeSection === '02') {
      faceRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const time = state.clock.getElapsedTime();
        const { randomAxis } = faceMeshes[i];
        mesh.position.x += Math.sin(time * 0.5 + i) * 0.002;
        mesh.position.y += Math.cos(time * 0.4 + i) * 0.002;
        mesh.position.z += Math.sin(time * 0.3 + i) * 0.002;
        mesh.rotateOnAxis(randomAxis, 0.005);
      });
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>, index: number) => {
    e.stopPropagation();
    onHover(`face_${index}`);
    
    // Geometry Data Properties
    const properties = [
      { title: "VERTICES", value: activeSection === '01' ? "20" : "12" },
      { title: "EDGES", value: "30" },
      { title: "FACES", value: activeSection === '01' ? "12" : "20" },
      { title: "EULER", value: "χ = 2" },
      { title: "SYMMETRY", value: "Icosahedral" },
      { title: "GOLDEN", value: "φ : 1" }
    ];

    const randomProp = properties[Math.floor(Math.random() * properties.length)];
    const pos: [number, number, number] = [e.point.x, e.point.y, e.point.z];
    
    onDetailSelect({
      title: randomProp.title,
      value: randomProp.value,
      position: pos
    });
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    onDetailSelect(null);
  };

  return (
    <group ref={mainGroupRef}>
      {/* Dynamic Icosahedron Core */}
      <group ref={icosahedronRef}>
        {faceMeshes.map((data, i) => {
          const isFaceHovered = hoveredPart === `face_${i}`;
          
          let activeMat: THREE.MeshStandardMaterial = iridescentMat;
          if (activeSection === '01') activeMat = greyBlackMat;
          else if (activeSection === '02') activeMat = deconMat;
          else if (activeSection === '03') activeMat = iridescentMat;

          return (
            <mesh 
              key={i} 
              ref={el => faceRefs.current[i] = el!} 
              geometry={data.geometry} 
              position={[data.center.x, data.center.y, data.center.z]}
              onPointerOver={(e) => handlePointerOver(e, i)}
              onPointerOut={handlePointerOut}
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              <primitive object={activeMat} attach="material" />
              
              {/* Structural Edge Overlay */}
              <mesh geometry={data.geometry}>
                <meshBasicMaterial 
                  color={isFaceHovered ? "#ffffff" : (activeSection === '02' ? "#000000" : activeSection === '04' ? "#ff00ff" : "#ffffff")} 
                  wireframe 
                  transparent 
                  opacity={isFaceHovered ? 1.0 : (activeSection === '01' ? 1 : 0.6)} 
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
      <mesh ref={dodecahedronRef} scale={0} onPointerOver={(e) => e.stopPropagation()} onPointerOut={(e) => e.stopPropagation()}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial 
          thickness={1.5} 
          transmission={0} 
          roughness={0.1} 
          metalness={0.9}
          color="#1a1a1a" // Greyish Black
          emissive="#000000" 
          emissiveIntensity={0.5} 
        />
        <mesh geometry={new THREE.DodecahedronGeometry(2, 0)}>
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </mesh>

      {/* Cinematic Detail Label */}
      {selectedDetail && (
        <Html position={selectedDetail.position} center distanceFactor={10}>
          <div ref={labelRef} className="pointer-events-none select-none flex flex-col items-center">
            {/* Connecting Line */}
            <div className="w-[1px] h-16 bg-gradient-to-t from-white to-transparent" />
            
            {/* Detail Card */}
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-4 min-w-[120px] skew-x-[-12deg] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <span className="block text-[8px] font-black tracking-[0.3em] text-cyan-400 mb-1">
                PROPERTY_INTEL
              </span>
              <h4 className="text-white text-xs font-black tracking-widest uppercase opacity-60">
                {selectedDetail.title}
              </h4>
              <p className="text-white text-2xl font-black italic tracking-tighter">
                {selectedDetail.value}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default CoreGeometry;
