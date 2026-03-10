import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GenerationErrorProps {
  error: string;
}

export const GenerationError: React.FC<GenerationErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-4">
        {error}
      </div>
      <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-purple-300">
        Go Back
      </button>
    </div>
  );
};
