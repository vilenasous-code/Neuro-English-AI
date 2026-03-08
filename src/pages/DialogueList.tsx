import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const DialogueList: React.FC = () => {
  const { user } = useAuth();
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDialogues = async () => {
      try {
        const dialoguesQuery = query(
          collection(db, 'dialogues'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(dialoguesQuery);
        setDialogues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'dialogues');
      } finally {
        setLoading(false);
      }
    };

    fetchDialogues();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <MessageSquare className="text-blue-500" />
          Contextual Dialogues
        </h1>
        <p className="text-zinc-400 text-lg">
          Review generated conversations to see your vocabulary in action.
        </p>
      </header>

      {dialogues.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
          <MessageSquare size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No dialogues yet</h3>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Generate dialogues from your mind maps to practice reading vocabulary in context.
          </p>
          <Link to="/mindmaps" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
            Go to Mind Maps
          </Link>
        </div>
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
