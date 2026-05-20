import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'safe' | 'moderate' | 'risky' | 'premium' | 'default' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-200';
  
  const variantStyles = {
    safe: 'bg-safe-green/10 text-safe-green border border-safe-green/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    moderate: 'bg-moderate-yellow/10 text-moderate-yellow border border-moderate-yellow/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    risky: 'bg-risky-red/10 text-risky-red border border-risky-red/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    premium: 'bg-gradient-to-r from-neon-purple to-neon-pink text-white border border-neon-purple/20 shadow-[0_0_15px_rgba(161,44,255,0.2)]',
    info: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_10px_rgba(0,210,255,0.1)]',
    default: 'bg-white/5 text-gray-300 border border-white/10',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
