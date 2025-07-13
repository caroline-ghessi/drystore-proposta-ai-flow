import React from 'react';
import { cn } from '@/lib/utils';

interface DrytoolsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol';
}

const DrytoolsLogo: React.FC<DrytoolsLogoProps> = ({
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

  // Cubo Drytools - Face frontal escura destacada
  const CuboDrytools = () => (
    <svg 
      viewBox="0 0 100 100" 
      className={cn(sizeClasses[size])}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Face superior - Cinza escuro */}
      <path 
        d="M50 20 L75 35 L50 50 L25 35 Z" 
        fill="hsl(var(--drytools))" 
        fillOpacity="0.8"
        stroke="hsl(var(--drytools))" 
        strokeWidth="1"
      />
      {/* Face direita - Cinza escuro */}
      <path 
        d="M50 50 L75 35 L75 65 L50 80 Z" 
        fill="hsl(var(--drytools))" 
        fillOpacity="0.9"
        stroke="hsl(var(--drytools))" 
        strokeWidth="1"
      />
      {/* Face esquerda - Cinza escuro destacado (ferramentas) */}
      <path 
        d="M50 50 L25 35 L25 65 L50 80 Z" 
        fill="hsl(var(--drytools))" 
        stroke="hsl(var(--drytools))" 
        strokeWidth="1"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div className={cn("flex items-center", className)}>
        <CuboDrytools />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <CuboDrytools />
      <div className="flex flex-col">
        <div className={cn("font-heading font-bold tracking-tight text-drytools-foreground", textSizeClasses[size])}>
          Drytools
        </div>
        <div className={cn(
          "font-tagline font-light tracking-[0.1em] text-drytools-foreground/80 uppercase",
          taglineSizeClasses[size]
        )}>
          Soluções em Ferramentas
        </div>
      </div>
    </div>
  );
};

export default DrytoolsLogo;