import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateDialogue } from '../utils/gemini';
import { doc, getDoc, collection, addDoc } from '../mockFirebase';
import { db } from '../firebase';
import { MessageSquare, Key } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { GenerationLoading } from '../components/GenerationLoading';
import { GenerationError } from '../components/GenerationError';

export const GenerateDialogue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setNeedsApiKey(false);
        setError('');
        // Reload page to retry
        window.location.reload();
      } else {
        setError('Please configure VITE_GEMINI_API_KEY in your environment variables.');
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

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
        
        if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('leaked')) {
          setError('A sua chave de API foi bloqueada pelo Google ou é inválida. Por favor, selecione uma nova chave.');
          setNeedsApiKey(true);
          // @ts-ignore
          if (window.aistudio && window.aistudio.openSelectKey) {
            // @ts-ignore
            window.aistudio.openSelectKey();
          }
        } else {
          setError(err.message || 'Failed to generate dialogue.');
        }

        if (err.message && err.message.includes('Firestore')) {
          handleFirestoreError(err, OperationType.CREATE, 'dialogues');
        }
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [id, user, navigate]);

  if (needsApiKey) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl mb-8 text-center">
          <Key className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">API Key Required</h2>
          <p className="text-zinc-400 mb-6">
            The default API key has been blocked. Please select your own Google Cloud API key to continue.
          </p>
          <button
            onClick={handleSelectKey}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

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
