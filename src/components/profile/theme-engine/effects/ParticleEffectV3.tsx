import { useEffect, useRef, useCallback, useState } from "react";

interface ParticleEffectV3Props {
  type: 'none' | 'snow' | 'stars' | 'fireflies' | 'bubbles' | 'confetti' | 'matrix' | 'aurora-dots';
  color?: string;
  secondaryColor?: string;
  intensity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  char?: string;
  rotation?: number;
  rotationSpeed?: number;
}

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

// Detect if device prefers reduced motion or is low-powered
function shouldReduceParticles(): boolean {
  if (typeof window === 'undefined') return false;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return prefersReducedMotion || isMobile;
}

export function ParticleEffectV3({ 
  type, 
  color = "#ffffff", 
  secondaryColor,
  intensity = 1 
}: ParticleEffectV3Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(true);

  // Reduce particle count on mobile/low-power devices
  const getParticleConfig = useCallback(() => {
    const reduceParticles = shouldReduceParticles();
    const multiplier = reduceParticles ? 0.3 : 1;
    
    const baseCount = {
      snow: 80,
      stars: 60,
      fireflies: 35,
      bubbles: 25,
      confetti: 60,
      matrix: 40,
      'aurora-dots': 20,
      none: 0,
    };
    return Math.floor((baseCount[type] || 0) * intensity * multiplier);
  }, [type, intensity]);

  // Visibility detection for performance
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (type === 'none' || !canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reduce canvas resolution on mobile for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    const particles: Particle[] = [];
    const particleCount = getParticleConfig();
    const colors = [color, secondaryColor || color];
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const baseParticle: Particle = {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: 0,
        vy: 0,
        size: 2,
        opacity: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      switch (type) {
        case 'snow':
          baseParticle.vx = (Math.random() - 0.5) * 0.4;
          baseParticle.vy = Math.random() * 1 + 0.3;
          baseParticle.size = Math.random() * 3 + 1;
          break;
        case 'stars':
          baseParticle.vx = 0;
          baseParticle.vy = 0;
          baseParticle.size = Math.random() * 2 + 0.5;
          break;
        case 'fireflies':
          baseParticle.vx = (Math.random() - 0.5) * 1.5;
          baseParticle.vy = (Math.random() - 0.5) * 1.5;
          baseParticle.size = Math.random() * 3 + 2;
          break;
        case 'bubbles':
          baseParticle.vx = (Math.random() - 0.5) * 0.3;
          baseParticle.vy = -Math.random() * 0.8 - 0.3;
          baseParticle.size = Math.random() * 6 + 3;
          break;
        case 'confetti':
          baseParticle.vx = (Math.random() - 0.5) * 1.5;
          baseParticle.vy = Math.random() * 1.5 + 0.8;
          baseParticle.size = Math.random() * 6 + 3;
          baseParticle.rotation = Math.random() * 360;
          baseParticle.rotationSpeed = (Math.random() - 0.5) * 8;
          baseParticle.color = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][Math.floor(Math.random() * 6)];
          break;
        case 'matrix':
          baseParticle.x = Math.floor(Math.random() * (canvasWidth / 16)) * 16;
          baseParticle.y = Math.random() * canvasHeight;
          baseParticle.vy = Math.random() * 2 + 1.5;
          baseParticle.size = 12;
          baseParticle.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          baseParticle.color = color;
          break;
        case 'aurora-dots':
          baseParticle.vx = Math.sin(i * 0.1) * 0.4;
          baseParticle.vy = Math.cos(i * 0.1) * 0.25;
          baseParticle.size = Math.random() * 5 + 2;
          break;
      }

      particles.push(baseParticle);
    }

    let lastTime = 0;
    const targetFPS = 30; // Limit FPS for performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Type-specific updates
        switch (type) {
          case 'stars':
            particle.opacity = Math.sin(currentTime * 0.002 + index) * 0.3 + 0.7;
            break;
          case 'fireflies':
            particle.opacity = Math.sin(currentTime * 0.004 + index * 2) * 0.5 + 0.5;
            particle.vx += (Math.random() - 0.5) * 0.08;
            particle.vy += (Math.random() - 0.5) * 0.08;
            particle.vx = Math.max(-1.5, Math.min(1.5, particle.vx));
            particle.vy = Math.max(-1.5, Math.min(1.5, particle.vy));
            break;
          case 'confetti':
            if (particle.rotation !== undefined && particle.rotationSpeed) {
              particle.rotation += particle.rotationSpeed;
            }
            particle.vy += 0.015; // gravity
            break;
          case 'matrix':
            if (Math.random() < 0.015) {
              particle.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            }
            break;
          case 'aurora-dots':
            particle.vx = Math.sin(currentTime * 0.0008 + index * 0.4) * 0.4;
            particle.vy = Math.cos(currentTime * 0.0006 + index * 0.4) * 0.25;
            particle.opacity = Math.sin(currentTime * 0.0008 + index) * 0.3 + 0.5;
            break;
        }

        // Wrap around screen
        if (particle.y > canvasHeight + 15) {
          particle.y = -15;
          particle.x = Math.random() * canvasWidth;
        }
        if (particle.y < -15) particle.y = canvasHeight + 15;
        if (particle.x > canvasWidth + 15) particle.x = -15;
        if (particle.x < -15) particle.x = canvasWidth + 15;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        if (type === 'matrix' && particle.char) {
          ctx.font = `${particle.size}px monospace`;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = particle.color;
          ctx.fillText(particle.char, particle.x, particle.y);
          
          // Trail effect (simplified)
          ctx.globalAlpha = particle.opacity * 0.4;
          ctx.fillText(particle.char, particle.x, particle.y - 16);
        } else if (type === 'confetti' && particle.rotation !== undefined) {
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        } else if (type === 'bubbles') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          
          if (type === 'fireflies' || type === 'stars' || type === 'aurora-dots') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = particle.color;
          }
          ctx.fill();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [type, color, secondaryColor, intensity, getParticleConfig, isVisible]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
