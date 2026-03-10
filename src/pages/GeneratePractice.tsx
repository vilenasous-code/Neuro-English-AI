import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateExercises } from '../utils/gemini';
import { doc, getDoc, collection, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { GenerationLoading } from '../components/GenerationLoading';
import { GenerationError } from '../components/GenerationError';

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
