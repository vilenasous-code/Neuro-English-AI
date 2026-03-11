import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateExercises } from '../utils/gemini';
import { doc, getDoc, collection, writeBatch } from '../mockFirebase';
import { db } from '../firebase';
import { BookOpen, Key } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { GenerationLoading } from '../components/GenerationLoading';
import { GenerationError } from '../components/GenerationError';

export const GeneratePractice: React.FC = () => {
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

        // Generate exercises
        const exercises = await generateExercises(mapData.topic, mapData.level, nodes);

        // Save to Firestore using batch
        const batch = writeBatch(db);
        const now = new Date().toISOString();

        exercises.forEach((ex: any) => {
          const newExRef = doc(collection(db, 'exercises'));
          batch.set(newExRef, {
            uid: user.uid,
            mapId: id,
            question: ex.question,
            type: ex.type,
            answer: ex.answer,
            status: 'new',
            nextReviewDate: now,
            createdAt: now
          });
        });

        await batch.commit();
        navigate('/practice');
      } catch (err: any) {
        console.error('Error generating exercises:', err);
        
        if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('leaked')) {
          setError('A sua chave de API foi bloqueada pelo Google ou é inválida. Por favor, selecione uma nova chave.');
          setNeedsApiKey(true);
          // @ts-ignore
          if (window.aistudio && window.aistudio.openSelectKey) {
            // @ts-ignore
            window.aistudio.openSelectKey();
          }
        } else {
          setError(err.message || 'Failed to generate exercises.');
        }

        if (err.message && err.message.includes('Firestore')) {
          handleFirestoreError(err, OperationType.CREATE, 'exercises');
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl mb-8 text-center">
          <Key className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">API Key Required</h2>
          <p className="text-zinc-400 mb-6">
            The default API key has been blocked. Please select your own Google Cloud API key to continue.
          </p>
          <button
            onClick={handleSelectKey}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
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
      icon={<BookOpen size={32} className="text-emerald-400" />}
      title="Generating Active Recall Exercises"
      description="Analyzing your mind map to create personalized practice questions..."
      colorClass="text-emerald-500"
    />
  );
};
