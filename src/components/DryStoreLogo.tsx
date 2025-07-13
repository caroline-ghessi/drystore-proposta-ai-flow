import React from 'react';
import { cn } from '@/lib/utils';

interface DryStoreLogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: 'full' | 'symbol' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DryStoreLogo: React.FC<DryStoreLogoProps> = ({
  className,
  showTagline = true,
  variant = 'full',
  size = 'md'
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

  // Cubo Isométrico SVG
  const CuboIsometrico = () => (
    <svg 
      viewBox="0 0 100 100" 
      className={cn(sizeClasses[size])}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Face superior - Laranja */}
      <path 
        d="M50 20 L75 35 L50 50 L25 35 Z" 
        fill="hsl(var(--primary))" 
        stroke="hsl(var(--primary))" 
        strokeWidth="1"
      />
      {/* Face direita - Laranja mais escuro */}
      <path 
        d="M50 50 L75 35 L75 65 L50 80 Z" 
        fill="hsl(var(--primary))" 
        fillOpacity="0.8"
        stroke="hsl(var(--primary))" 
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
        <CuboIsometrico />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className={cn("font-heading font-bold tracking-tight", textSizeClasses[size])}>
          <span className="text-primary">Dry</span>
          <span className="text-secondary">store</span>
        </div>
        {showTagline && (
          <div className={cn(
            "font-tagline font-light tracking-[0.1em] text-muted-foreground uppercase mt-1",
            taglineSizeClasses[size]
          )}>
            Soluções Inteligentes
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <CuboIsometrico />
      <div className="flex flex-col">
        <div className={cn("font-heading font-bold tracking-tight", textSizeClasses[size])}>
          <span className="text-primary">Dry</span>
          <span className="text-secondary">store</span>
        </div>
        {showTagline && (
          <div className={cn(
            "font-tagline font-light tracking-[0.1em] text-muted-foreground uppercase",
            taglineSizeClasses[size]
          )}>
            Soluções Inteligentes
          </div>
        )}
      </div>
    </div>
  );
};

export default DryStoreLogo;