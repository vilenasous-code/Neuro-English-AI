import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { addDays } from 'date-fns';

export const useExercises = (uid: string | undefined) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchExercises = async () => {
      try {
        const now = new Date().toISOString();
        const exercisesQuery = query(
          collection(db, 'exercises'),
          where('uid', '==', uid),
          where('nextReviewDate', '<=', now)
        );
        const snapshot = await getDocs(exercisesQuery);
        setExercises(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [uid]);

  const updateExerciseReview = async (exerciseId: string, quality: number, currentStatus: string, createdAt: string) => {
    let nextStatus = currentStatus;
    let daysToAdd = 1;

    if (quality >= 3) {
      if (currentStatus === 'new' || currentStatus === 'learning') {
        nextStatus = 'review';
        daysToAdd = 3;
      } else if (currentStatus === 'review') {
        nextStatus = 'mastered';
        daysToAdd = 7;
      } else {
        daysToAdd = 14;
      }
    } else {
      nextStatus = 'learning';
      daysToAdd = 1;
    }

    const nextReviewDate = addDays(new Date(), daysToAdd).toISOString();

    try {
      await updateDoc(doc(db, 'exercises', exerciseId), {
        status: nextStatus,
        nextReviewDate,
        createdAt
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `exercises/${exerciseId}`);
      return false;
    }
  };

  return { exercises, setExercises, loading, updateExerciseReview };
};
