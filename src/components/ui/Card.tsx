import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'purple' | 'blue' | 'green' | 'none';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  hoverEffect = true,
  ...props
}) => {
  const glowClass = {
    purple: 'glow-card-purple shadow-[0_0_20px_rgba(161,44,255,0.05)]',
    blue: 'glow-card-blue shadow-[0_0_20px_rgba(0,210,255,0.05)]',
    green: 'glow-card-green shadow-[0_0_20px_rgba(0,255,135,0.05)]',
    none: '',
  }[glowColor];

  const hoverClass = hoverEffect 
    ? 'glass-panel-hover' 
    : '';

  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${glowClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
