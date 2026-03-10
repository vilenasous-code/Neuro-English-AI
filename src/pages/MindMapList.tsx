import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Map, Plus, ArrowRight } from 'lucide-react';
import { useMindMaps } from '../hooks/useMindMaps';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MindMapList: React.FC = () => {
  const { user } = useAuth();
  const { maps, loading } = useMindMaps(user?.uid);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Map className="text-purple-500" />
            Your Mind Maps
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Explore and review your generated visual vocabulary structures.
          </p>
        </div>
        <Link 
          to="/mindmaps/new" 
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          New Map
        </Link>
      </header>

      {maps.length === 0 ? (
        <EmptyState 
          icon={<Map size={48} />}
          title="No mind maps yet"
          description="Generate your first mind map to start visualizing vocabulary and grammar connections."
          actionText="Create Mind Map"
          actionLink="/mindmaps/new"
        />
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
