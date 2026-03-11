import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, AlertCircle, Play } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signIn();
    } catch (err: any) {
      console.error('Start error:', err);
      setError(err.message || 'Failed to start. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-800 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50">
          <Brain size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">NeuroEnglish AI</h1>
        <p className="text-zinc-400 mb-8">
          Master English vocabulary and grammar using neuroscience-based visual learning.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 text-left">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <Play size={20} className="fill-current" />
              Start Learning
            </>
          )}
        </button>
      </div>
    </div>
  );
};
