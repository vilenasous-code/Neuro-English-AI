import React from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationLoadingProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass?: string;
}

export const GenerationLoading: React.FC<GenerationLoadingProps> = ({
  icon,
  title,
  description,
  colorClass = 'text-purple-500'
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-zinc-400 mb-8">{description}</p>
      <Loader2 size={32} className={`animate-spin ${colorClass}`} />
    </div>
  );
};
