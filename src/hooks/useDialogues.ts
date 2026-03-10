import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const useDialogues = (uid: string | undefined) => {
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchDialogues = async () => {
      try {
        const dialoguesQuery = query(
          collection(db, 'dialogues'),
          where('uid', '==', uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(dialoguesQuery);
        setDialogues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'dialogues');
      } finally {
        setLoading(false);
      }
    };

    fetchDialogues();
  }, [uid]);

  return { dialogues, loading };
};
