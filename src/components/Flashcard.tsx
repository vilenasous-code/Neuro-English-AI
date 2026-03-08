import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FlashcardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  frontContent, 
  backContent, 
  isFlipped, 
  onFlip, 
  className 
}) => {
  return (
    <div 
      className={twMerge("w-full h-80 cursor-pointer [perspective:1000px]", className)} 
      onClick={onFlip}
    >
      <div 
        className={clsx(
          "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
          {frontContent}
          <div className="absolute bottom-6 text-zinc-500 text-sm animate-pulse">
            Click to flip
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-emerald-900/20 border border-emerald-500/30 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
          {backContent}
        </div>
      </div>
    </div>
  );
};
