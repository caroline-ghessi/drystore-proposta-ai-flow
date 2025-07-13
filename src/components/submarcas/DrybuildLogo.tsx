import React from 'react';
import { cn } from '@/lib/utils';

interface DrybuildLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol';
}

const DrybuildLogo: React.FC<DrybuildLogoProps> = ({
  className,
  size = 'md',
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Cubo Drybuild - Tons de cinza
  const CuboDrybuild = () => (
    <svg 
      viewBox="0 0 100 100" 
      className={cn(sizeClasses[size])}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Face superior - Cinza médio */}
      <path 
        d="M50 20 L75 35 L50 50 L25 35 Z" 
        fill="hsl(var(--drybuild))" 
        stroke="hsl(var(--drybuild))" 
        strokeWidth="1"
      />
      {/* Face direita - Cinza mais escuro */}
      <path 
        d="M50 50 L75 35 L75 65 L50 80 Z" 
        fill="hsl(var(--drybuild))" 
        fillOpacity="0.8"
        stroke="hsl(var(--drybuild))" 
        strokeWidth="1"
      />
      {/* Face esquerda - Cinza escuro */}
      <path 
        d="M50 50 L25 35 L25 65 L50 80 Z" 
        fill="hsl(var(--secondary))" 
        stroke="hsl(var(--secondary))" 
        strokeWidth="1"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div className={cn("flex items-center", className)}>
        <CuboDrybuild />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <CuboDrybuild />
      <div className="flex flex-col">
        <div className={cn("font-heading font-bold tracking-tight text-drybuild-foreground", textSizeClasses[size])}>
          Drybuild
        </div>
        <div className={cn(
          "font-tagline font-light tracking-[0.1em] text-drybuild-foreground/70 uppercase",
          taglineSizeClasses[size]
        )}>
          Soluções em Construção a Seco
        </div>
      </div>
    </div>
  );
};

export default DrybuildLogo;