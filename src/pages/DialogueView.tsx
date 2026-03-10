import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useDialogue } from '../hooks/useDialogue';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DialogueView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dialogue, loading, error } = useDialogue(id, user?.uid);

  useEffect(() => {
    if (error) {
      console.error(error);
      navigate('/dialogues');
    }
  }, [error, navigate]);

  if (loading) {
    return <LoadingSpinner color="blue" />;
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto h-full flex flex-col">
      <header className="mb-6 md:mb-8 flex items-start md:items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mt-1 md:mt-0 shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
            <MessageSquare className="text-blue-500 shrink-0" />
            Contextual Dialogue
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Read through the conversation to see vocabulary in context.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-12">
        {dialogue.map((turn, index) => {
          const isUser = index % 2 === 0; // Alternate sides for visual distinction
          
          return (
            <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <span className="text-xs font-medium text-zinc-500 mb-1 px-2 uppercase tracking-wider">
                {turn.speaker}
              </span>
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  isUser 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-sm' 
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tl-sm'
                }`}
              >
                <p className="text-lg leading-relaxed">{turn.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
