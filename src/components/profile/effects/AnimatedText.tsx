import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  animation: string;
  className?: string;
}

export function AnimatedText({ children, animation, className = "" }: AnimatedTextProps) {
  const getAnimationClass = () => {
    switch (animation) {
      case 'gradient':
        return 'animate-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto]';
      case 'wave':
        return 'inline-block animate-wave';
      case 'glow':
        return 'animate-glow';
      case 'typewriter':
        return 'animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-r-primary';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      case 'glitch':
        return 'animate-glitch relative';
      default:
        return '';
    }
  };

  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
}
