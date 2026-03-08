import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, CheckCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { addDays } from 'date-fns';
import { Flashcard } from '../components/Flashcard';

export const Practice: React.FC = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchExercises = async () => {
      try {
        const now = new Date().toISOString();
        const exercisesQuery = query(
          collection(db, 'exercises'),
          where('uid', '==', user.uid),
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
  }, [user]);

  const handleReview = async (quality: number) => {
    if (!user || exercises.length === 0) return;

    const currentExercise = exercises[currentIndex];
    
    // Simple spaced repetition logic
    let nextStatus = currentExercise.status;
    let daysToAdd = 1;

    if (quality >= 3) {
      if (currentExercise.status === 'new' || currentExercise.status === 'learning') {
        nextStatus = 'review';
        daysToAdd = 3;
      } else if (currentExercise.status === 'review') {
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
      await updateDoc(doc(db, 'exercises', currentExercise.id), {
        status: nextStatus,
        nextReviewDate,
        createdAt: currentExercise.createdAt // keep immutable
      });

      // Move to next exercise
      setShowAnswer(false);
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finished all reviews
        setExercises([]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `exercises/${currentExercise.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-600/20 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">All Caught Up!</h2>
        <p className="text-zinc-400 text-lg max-w-md">
          You have no exercises due for review right now. Generate more exercises from your mind maps to keep learning.
        </p>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-emerald-500" />
            Active Recall
          </h1>
          <p className="text-zinc-400">
            Reviewing {currentIndex + 1} of {exercises.length} items
          </p>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 font-medium">
          {exercises.length - currentIndex} remaining
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Flashcard
          isFlipped={showAnswer}
          onFlip={() => setShowAnswer(true)}
          frontContent={
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-6">
                {currentExercise.type}
              </span>
              <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                {currentExercise.question}
              </h2>
            </>
          }
          backContent={
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-900/50 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-6">
                Answer
              </span>
              <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
                {currentExercise.answer}
              </p>
            </>
          }
        />

        {/* Rating Buttons (only show when flipped) */}
        <div className={`w-full transition-all duration-500 mt-8 ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <p className="text-center text-zinc-400 text-sm font-medium mb-4">How well did you remember this?</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleReview(1)}
              className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors font-medium flex flex-col items-center gap-1"
            >
              <span className="text-lg">Again</span>
              <span className="text-xs opacity-70">&lt; 1m</span>
            </button>
            <button
              onClick={() => handleReview(2)}
              className="py-3 px-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl transition-colors font-medium flex flex-col items-center gap-1"
            >
              <span className="text-lg">Hard</span>
              <span className="text-xs opacity-70">1d</span>
            </button>
            <button
              onClick={() => handleReview(3)}
              className="py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition-colors font-medium flex flex-col items-center gap-1"
            >
              <span className="text-lg">Good</span>
              <span className="text-xs opacity-70">3d</span>
            </button>
            <button
              onClick={() => handleReview(4)}
              className="py-3 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl transition-colors font-medium flex flex-col items-center gap-1"
            >
              <span className="text-lg">Easy</span>
              <span className="text-xs opacity-70">7d</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
