
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GraffitiLayerProps {
  active: boolean;
}

const GraffitiLayer: React.FC<GraffitiLayerProps> = ({ active }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (active) {
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      const tags = containerRef.current.querySelectorAll('.graffiti-tag');
      tags.forEach((tag) => {
        gsap.fromTo(tag, 
          { strokeDashoffset: 1000, strokeDasharray: 1000, opacity: 0, scale: 0.7 },
          { 
            strokeDashoffset: 0, 
            opacity: 1, 
            scale: 1,
            duration: 1.5, 
            delay: Math.random() * 0.5,
            ease: 'expo.out' 
          }
        );
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      });
    }
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none opacity-0 z-0 overflow-hidden"
    >
      <svg className="w-full h-full p-20" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <text 
          x="10%" y="30%" 
          className="graffiti-tag font-black italic fill-none stroke-[3] stroke-cyan-400 opacity-0"
          style={{ fontSize: '180px', fontFamily: 'Impact, sans-serif' }}
        >
          THINK
        </text>
        <text 
          x="60%" y="70%" 
          className="graffiti-tag font-black fill-none stroke-[2] stroke-pink-500 opacity-0"
          style={{ fontSize: '120px', fontFamily: 'Impact, sans-serif', transform: 'rotate(-15deg)' }}
        >
          FORM
        </text>
        <text 
          x="40%" y="85%" 
          className="graffiti-tag font-black italic fill-none stroke-[4] stroke-yellow-400 opacity-0"
          style={{ fontSize: '150px', fontFamily: 'Impact, sans-serif' }}
        >
          CORE_2025
        </text>
      </svg>
    </div>
  );
};

export default GraffitiLayer;
