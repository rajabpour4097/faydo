import React from 'react';

interface ProgressBarProps {
  percentage: number;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  className = '', 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className={`w-full bg-white/10 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
        style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
      />
    </div>
  );
};
