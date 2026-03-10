import React from 'react';

interface LoadingSpinnerProps {
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ color = 'purple' }) => {
  const colorClass = color === 'emerald' ? 'border-emerald-500' : 'border-purple-500';
  
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colorClass}`}></div>
    </div>
  );
};
