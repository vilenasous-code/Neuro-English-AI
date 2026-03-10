import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const useMindMap = (id: string | undefined, uid: string | undefined) => {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !uid) return;

    const fetchMap = async () => {
      try {
        const docRef = doc(db, 'mindmaps', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMapData(docSnap.data());
        } else {
          setError("No such document!");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `mindmaps/${id}`);
        setError("Failed to load mind map.");
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [id, uid]);

  return { mapData, loading, error };
};
