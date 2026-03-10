import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const useDialogue = (id: string | undefined, uid: string | undefined) => {
  const [dialogue, setDialogue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !uid) return;

    const fetchDialogue = async () => {
      try {
        const docRef = doc(db, 'dialogues', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.content) {
            setDialogue(JSON.parse(data.content));
          }
        } else {
          setError("No such document!");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `dialogues/${id}`);
        setError("Failed to load dialogue.");
      } finally {
        setLoading(false);
      }
    };

    fetchDialogue();
  }, [id, uid]);

  return { dialogue, loading, error };
};
