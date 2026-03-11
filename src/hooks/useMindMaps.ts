import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from '../mockFirebase';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const useMindMaps = (uid: string | undefined) => {
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchMaps = async () => {
      try {
        const mapsQuery = query(
          collection(db, 'mindmaps'),
          where('uid', '==', uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(mapsQuery);
        setMaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'mindmaps');
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [uid]);

  return { maps, loading };
};
