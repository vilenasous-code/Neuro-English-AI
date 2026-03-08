import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare, ArrowLeft, User as UserIcon } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const DialogueView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dialogue, setDialogue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchDialogue = async () => {
      try {
        const docRef = doc(db, 'dialogues', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.content) {
            setDialogue(JSON.parse(data.content));
          }
        } else {
          console.error("No such document!");
          navigate('/dialogues');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `dialogues/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDialogue();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <MessageSquare className="text-blue-500" />
            Contextual Dialogue
          </h1>
          <p className="text-zinc-400 mt-1">
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
