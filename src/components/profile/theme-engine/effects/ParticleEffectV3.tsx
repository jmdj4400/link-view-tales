import { useEffect, useRef, useCallback } from "react";

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
  char?: string; // For matrix
  rotation?: number; // For confetti
  rotationSpeed?: number;
}

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

export function ParticleEffectV3({ 
  type, 
  color = "#ffffff", 
  secondaryColor,
  intensity = 1 
}: ParticleEffectV3Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const getParticleConfig = useCallback(() => {
    const baseCount = {
      snow: 120,
      stars: 80,
      fireflies: 50,
      bubbles: 40,
      confetti: 100,
      matrix: 60,
      'aurora-dots': 30,
      none: 0,
    };
    return Math.floor((baseCount[type] || 0) * intensity);
  }, [type, intensity]);

  useEffect(() => {
    if (type === 'none' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const particles: Particle[] = [];
    const particleCount = getParticleConfig();
    const colors = [color, secondaryColor || color];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const baseParticle: Particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: 2,
        opacity: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      switch (type) {
        case 'snow':
          baseParticle.vx = (Math.random() - 0.5) * 0.5;
          baseParticle.vy = Math.random() * 1.5 + 0.5;
          baseParticle.size = Math.random() * 4 + 1;
          break;
        case 'stars':
          baseParticle.vx = 0;
          baseParticle.vy = 0;
          baseParticle.size = Math.random() * 2 + 0.5;
          break;
        case 'fireflies':
          baseParticle.vx = (Math.random() - 0.5) * 2;
          baseParticle.vy = (Math.random() - 0.5) * 2;
          baseParticle.size = Math.random() * 4 + 2;
          break;
        case 'bubbles':
          baseParticle.vx = (Math.random() - 0.5) * 0.5;
          baseParticle.vy = -Math.random() * 1 - 0.5;
          baseParticle.size = Math.random() * 8 + 4;
          break;
        case 'confetti':
          baseParticle.vx = (Math.random() - 0.5) * 2;
          baseParticle.vy = Math.random() * 2 + 1;
          baseParticle.size = Math.random() * 8 + 4;
          baseParticle.rotation = Math.random() * 360;
          baseParticle.rotationSpeed = (Math.random() - 0.5) * 10;
          baseParticle.color = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][Math.floor(Math.random() * 6)];
          break;
        case 'matrix':
          baseParticle.x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
          baseParticle.y = Math.random() * canvas.height;
          baseParticle.vy = Math.random() * 3 + 2;
          baseParticle.size = 14;
          baseParticle.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          baseParticle.color = color;
          break;
        case 'aurora-dots':
          baseParticle.vx = Math.sin(i * 0.1) * 0.5;
          baseParticle.vy = Math.cos(i * 0.1) * 0.3;
          baseParticle.size = Math.random() * 6 + 2;
          break;
      }

      particles.push(baseParticle);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Type-specific updates
        switch (type) {
          case 'stars':
            particle.opacity = Math.sin(Date.now() * 0.002 + index) * 0.3 + 0.7;
            break;
          case 'fireflies':
            particle.opacity = Math.sin(Date.now() * 0.005 + index * 2) * 0.5 + 0.5;
            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;
            particle.vx = Math.max(-2, Math.min(2, particle.vx));
            particle.vy = Math.max(-2, Math.min(2, particle.vy));
            break;
          case 'confetti':
            if (particle.rotation !== undefined && particle.rotationSpeed) {
              particle.rotation += particle.rotationSpeed;
            }
            particle.vy += 0.02; // gravity
            break;
          case 'matrix':
            if (Math.random() < 0.02) {
              particle.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            }
            break;
          case 'aurora-dots':
            particle.vx = Math.sin(Date.now() * 0.001 + index * 0.5) * 0.5;
            particle.vy = Math.cos(Date.now() * 0.0008 + index * 0.5) * 0.3;
            particle.opacity = Math.sin(Date.now() * 0.001 + index) * 0.3 + 0.5;
            break;
        }

        // Wrap around screen
        if (particle.y > canvas.height + 20) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.x < -20) particle.x = canvas.width + 20;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        if (type === 'matrix' && particle.char) {
          ctx.font = `${particle.size}px monospace`;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.fillText(particle.char, particle.x, particle.y);
          
          // Trail effect
          ctx.globalAlpha = particle.opacity * 0.5;
          ctx.fillText(particle.char, particle.x, particle.y - 20);
          ctx.globalAlpha = particle.opacity * 0.25;
          ctx.fillText(particle.char, particle.x, particle.y - 40);
        } else if (type === 'confetti' && particle.rotation !== undefined) {
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
          ctx.translate(-particle.x, -particle.y);
        } else if (type === 'bubbles') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          // Inner highlight
          ctx.beginPath();
          ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}40`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          
          if (type === 'fireflies' || type === 'stars' || type === 'aurora-dots') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
          }
          ctx.fill();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [type, color, secondaryColor, intensity, getParticleConfig]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.7 }}
    />
  );
}
