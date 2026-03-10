import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useDialogues } from '../hooks/useDialogues';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const DialogueList: React.FC = () => {
  const { user } = useAuth();
  const { dialogues, loading } = useDialogues(user?.uid);

  if (loading) {
    return <LoadingSpinner color="blue" />;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <MessageSquare className="text-blue-500" />
          Contextual Dialogues
        </h1>
        <p className="text-zinc-400 text-base md:text-lg">
          Review generated conversations to see your vocabulary in action.
        </p>
      </header>

      {dialogues.length === 0 ? (
        <EmptyState 
          icon={<MessageSquare size={48} />}
          title="No dialogues yet"
          description="Generate dialogues from your mind maps to practice reading vocabulary in context."
          actionText="Go to Mind Maps"
          actionLink="/mindmaps"
          actionIcon={null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dialogues.map((dialogue) => (
            <Link key={dialogue.id} to={`/dialogues/${dialogue.id}`} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/40 transition-colors">
                  <MessageSquare size={20} className="text-blue-400" />
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(dialogue.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                Dialogue from Map
              </h3>
              <p className="text-sm text-zinc-400 line-clamp-2">
                {JSON.parse(dialogue.content || '[]')[0]?.text || 'View dialogue...'}
              </p>
              <div className="flex items-center justify-end mt-4">
                <ArrowRight size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
