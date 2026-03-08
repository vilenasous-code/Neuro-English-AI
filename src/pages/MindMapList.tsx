import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Map, Plus, ArrowRight } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const MindMapList: React.FC = () => {
  const { user } = useAuth();
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMaps = async () => {
      try {
        const mapsQuery = query(
          collection(db, 'mindmaps'),
          where('uid', '==', user.uid),
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
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Map className="text-purple-500" />
            Your Mind Maps
          </h1>
          <p className="text-zinc-400 text-lg">
            Explore and review your generated visual vocabulary structures.
          </p>
        </div>
        <Link 
          to="/mindmaps/new" 
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          New Map
        </Link>
      </header>

      {maps.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
          <Map size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No mind maps yet</h3>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Generate your first mind map to start visualizing vocabulary and grammar connections.
          </p>
          <Link to="/mindmaps/new" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
            <Plus size={20} />
            Create Mind Map
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Link key={map.id} to={`/mindmaps/${map.id}`} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-purple-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 group-hover:bg-purple-900/30 group-hover:text-purple-300 transition-colors">
                  Level {map.level}
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(map.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 capitalize group-hover:text-purple-400 transition-colors">{map.topic}</h3>
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-zinc-500">
                  {JSON.parse(map.nodes || '[]').length} nodes
                </span>
                <ArrowRight size={16} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
