import { useEffect, useState, useCallback, ReactNode } from "react";

interface ParallaxBackgroundProps {
  children: ReactNode;
  enabled?: boolean;
  intensity?: number;
  type?: 'scroll' | 'mouse' | 'both';
}

export function ParallaxBackground({ 
  children, 
  enabled = true, 
  intensity = 20,
  type = 'mouse' 
}: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || (type !== 'mouse' && type !== 'both')) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const x = ((e.clientX - centerX) / centerX) * intensity;
    const y = ((e.clientY - centerY) / centerY) * intensity;
    
    setOffset({ x, y });
  }, [enabled, intensity, type]);

  const handleScroll = useCallback(() => {
    if (!enabled || (type !== 'scroll' && type !== 'both')) return;
    setScrollOffset(window.scrollY * 0.5);
  }, [enabled, type]);

  useEffect(() => {
    if (!enabled) return;

    if (type === 'mouse' || type === 'both') {
      window.addEventListener('mousemove', handleMouseMove);
    }
    if (type === 'scroll' || type === 'both') {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, type, handleMouseMove, handleScroll]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative"
      style={{
        transform: `translate(${offset.x}px, ${offset.y - scrollOffset}px)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      {children}
    </div>
  );
}
