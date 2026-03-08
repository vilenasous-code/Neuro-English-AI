import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateExercises } from '../utils/gemini';
import { doc, getDoc, collection, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, BookOpen } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const GeneratePractice: React.FC = () => {
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
        setError(err.message || 'Failed to generate exercises.');
        if (err.message && err.message.includes('Firestore')) {
          handleFirestoreError(err, OperationType.CREATE, 'exercises');
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
      <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mb-6">
        <BookOpen size={32} className="text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Generating Active Recall Exercises</h2>
      <p className="text-zinc-400 mb-8">Analyzing your mind map to create personalized practice questions...</p>
      <Loader2 size={32} className="animate-spin text-emerald-500" />
    </div>
  );
};
