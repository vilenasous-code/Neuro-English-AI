import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateDialogue } from '../utils/gemini';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { GenerationLoading } from '../components/GenerationLoading';
import { GenerationError } from '../components/GenerationError';

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
        navigate(`/dialogues/${newDocRef.id}`, { replace: true });
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
    return <GenerationError error={error} />;
  }

  return (
    <GenerationLoading 
      icon={<MessageSquare size={32} className="text-blue-400" />}
      title="Generating Contextual Dialogue"
      description="Creating a realistic conversation using your vocabulary..."
      colorClass="text-blue-500"
    />
  );
};
