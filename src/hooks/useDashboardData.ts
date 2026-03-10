import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const useDashboardData = (uid: string | undefined) => {
  const [recentMaps, setRecentMaps] = useState<any[]>([]);
  const [dueReviews, setDueReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const mapsQuery = query(
          collection(db, 'mindmaps'),
          where('uid', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const mapsSnapshot = await getDocs(mapsQuery);
        setRecentMaps(mapsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const now = new Date().toISOString();
        const reviewsQuery = query(
          collection(db, 'exercises'),
          where('uid', '==', uid),
          where('nextReviewDate', '<=', now)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setDueReviews(reviewsSnapshot.size);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'dashboard_data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  return { recentMaps, dueReviews, loading };
};
