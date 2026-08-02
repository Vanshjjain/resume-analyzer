import React, { useRef, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 6; 
    const rotateY = ((x - centerX) / centerX) * 6;

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`,
      '--mouse-x': `${x}px`,
      '--mouse-y': `${y}px`,
    } as React.CSSProperties);
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)',
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`glass-panel-premium gradient-border-glow rounded-3xl p-6 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-[#0d0d18]/80' : ''
      } ${className}`}
    >
      <div className="cursor-specular-light" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
export default GlassCard;
