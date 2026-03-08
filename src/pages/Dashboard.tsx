import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Brain, Plus, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const Dashboard: React.FC = () => {
  const { user, userLevel } = useAuth();
  const [recentMaps, setRecentMaps] = useState<any[]>([]);
  const [dueReviews, setDueReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch recent mind maps
        const mapsQuery = query(
          collection(db, 'mindmaps'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const mapsSnapshot = await getDocs(mapsQuery);
        setRecentMaps(mapsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch due reviews
        const now = new Date().toISOString();
        const reviewsQuery = query(
          collection(db, 'exercises'),
          where('uid', '==', user.uid),
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
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}
        </h1>
        <p className="text-zinc-400 text-lg">
          Your current level is <span className="text-purple-400 font-semibold">{userLevel}</span>. Let's build some neural connections today.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/mindmaps/new" className="bg-gradient-to-br from-purple-900/50 to-purple-600/20 border border-purple-500/30 p-6 rounded-3xl hover:border-purple-500/60 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/40 transition-colors">
            <Plus size={24} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">New Mind Map</h3>
          <p className="text-zinc-400 text-sm">Generate a visual vocabulary map for any topic.</p>
        </Link>

        <Link to="/practice" className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <BookOpen size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Active Recall</h3>
          <p className="text-zinc-400 text-sm">
            {dueReviews > 0 
              ? <span className="text-emerald-400 font-medium">{dueReviews} reviews due today</span>
              : 'All caught up! Practice new words.'}
          </p>
        </Link>

        <Link to="/dialogues" className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <MessageSquare size={24} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Context Dialogues</h3>
          <p className="text-zinc-400 text-sm">Practice vocabulary in real-world conversations.</p>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Mind Maps</h2>
          <Link to="/mindmaps" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {recentMaps.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
            <Brain size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No mind maps yet</h3>
            <p className="text-zinc-500 mb-6">Create your first mind map to start learning.</p>
            <Link to="/mindmaps/new" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
              <Plus size={20} />
              Create Mind Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMaps.map((map) => (
              <Link key={map.id} to={`/mindmaps/${map.id}`} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                    Level {map.level}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(map.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 capitalize">{map.topic}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2">
                  Explore vocabulary and concepts related to {map.topic}.
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
