import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateDialogue } from '../utils/gemini';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, MessageSquare } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const GenerateDialogue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    const generate = async () => {
      try {
        // Fetch mind map
        const docRef = doc(db, 'mindmaps', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Mind map not found');
        }

        const mapData = docSnap.data();
        const nodes = JSON.parse(mapData.nodes || '[]');

        // Generate dialogue
        const dialogueTurns = await generateDialogue(mapData.topic, mapData.level, nodes);

        // Save to Firestore
        const newDialogue = {
          uid: user.uid,
          mapId: id,
          content: JSON.stringify(dialogueTurns),
          createdAt: new Date().toISOString()
        };

        const newDocRef = await addDoc(collection(db, 'dialogues'), newDialogue);
        navigate(`/dialogues/${newDocRef.id}`);
      } catch (err: any) {
        console.error('Error generating dialogue:', err);
        setError(err.message || 'Failed to generate dialogue.');
        if (err.message && err.message.includes('Firestore')) {
          handleFirestoreError(err, OperationType.CREATE, 'dialogues');
        }
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [id, user, navigate]);

  if (error) {
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
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">
        <MessageSquare size={32} className="text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Generating Contextual Dialogue</h2>
      <p className="text-zinc-400 mb-8">Creating a realistic conversation using your vocabulary...</p>
      <Loader2 size={32} className="animate-spin text-blue-500" />
    </div>
  );
};
