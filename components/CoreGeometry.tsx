
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const dodecahedronRef = useRef<THREE.Group>(null);
  
  // Materials
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    thickness: 0.5,
    roughness: 0,
    transmission: 0.9,
    ior: 1.5,
    color: '#ffffff',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  }), []);

  const iridescentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ffff',
    metalness: 1,
    roughness: 0.1,
    emissive: '#0044ff',
    emissiveIntensity: 0.5,
  }), []);

  const wireframeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  }), []);

  // Generate Icosahedron faces for explode view
  const faceMeshes = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 0);
    const posAttr = geo.getAttribute('position');
    const meshes: { geometry: THREE.BufferGeometry, center: THREE.Vector3 }[] = [];
    
    for (let i = 0; i < posAttr.count; i += 3) {
      const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);
      
      const center = new THREE.Vector3()
        .add(v1).add(v2).add(v3)
        .divideScalar(3);
      
      // Move vertices to be relative to center for easier rotation/explosion
      v1.sub(center);
      v2.sub(center);
      v3.sub(center);
      
      const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2, v3]);
      geometry.computeVertexNormals();
      meshes.push({ geometry, center });
    }
    return meshes;
  }, []);

  // Refs for the individual faces
  const faceRefs = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    // Initial entrance
    if (mainGroupRef.current) {
      gsap.from(mainGroupRef.current.scale, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)"
      });
    }
  }, []);

  useEffect(() => {
    const is01 = activeSection === '01'; // Structural Shift
    const is02 = activeSection === '02'; // Deconstruction
    const is03 = activeSection === '03'; // Design & Color
    const is04 = activeSection === '04'; // Graffiti & Style

    // Morph to Dodecahedron (01)
    if (dodecahedronRef.current) {
      gsap.to(dodecahedronRef.current.scale, {
        x: is01 ? 1.2 : 0,
        y: is01 ? 1.2 : 0,
        z: is01 ? 1.2 : 0,
        duration: 0.8,
        ease: "expo.out"
      });
      gsap.to(dodecahedronRef.current.rotation, {
        y: is01 ? Math.PI : 0,
        duration: 0.8
      });
    }

    // Explode effect (02)
    faceRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const { center } = faceMeshes[i];
        const multiplier = is02 || exploded ? 2 : 1;
        gsap.to(mesh.position, {
          x: center.x * multiplier,
          y: center.y * multiplier,
          z: center.z * multiplier,
          duration: 0.8,
          ease: "back.out(1.7)"
        });
        gsap.to(mesh.rotation, {
          x: is02 ? Math.random() * Math.PI : 0,
          y: is02 ? Math.random() * Math.PI : 0,
          duration: 0.8
        });
      }
    });

    // Material Swap (03)
    if (icosahedronRef.current) {
      gsap.to(icosahedronRef.current.scale, {
        x: is01 ? 0 : (is03 ? 1.1 : 1),
        y: is01 ? 0 : (is03 ? 1.1 : 1),
        z: is01 ? 0 : (is03 ? 1.1 : 1),
        duration: 0.5
      });
    }

    // Graffiti Spin (04)
    if (is04 && mainGroupRef.current) {
      gsap.to(mainGroupRef.current.rotation, {
        y: mainGroupRef.current.rotation.y + Math.PI * 4,
        duration: 2,
        ease: "power4.inOut"
      });
    }

  }, [activeSection, exploded, faceMeshes]);

  return (
    <group ref={mainGroupRef}>
      {/* Central Icosahedron Container */}
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
            
            {/* Edge highlights */}
            <mesh geometry={data.geometry}>
              <meshBasicMaterial 
                color={activeSection === '04' ? "#ff00ff" : "#ffffff"} 
                wireframe 
                transparent 
                opacity={activeSection === '01' ? 1 : 0.4} 
              />
            </mesh>

            {/* Digital Graffiti Texture (Simulation via colored planes or decals) */}
            {activeSection === '04' && i % 3 === 0 && (
              <mesh position={[0, 0, 0.01]} scale={0.5}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
              </mesh>
            )}
          </mesh>
        ))}
      </group>

      {/* Hidden Dodecahedron for morphing */}
      <mesh ref={dodecahedronRef} scale={0}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial 
          thickness={1} 
          transmission={0.8} 
          roughness={0} 
          color="#ffff00" 
          emissive="#ffff00" 
          emissiveIntensity={0.5} 
        />
        <mesh geometry={new THREE.DodecahedronGeometry(2, 0)}>
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </mesh>
    </group>
  );
};

export default CoreGeometry;
