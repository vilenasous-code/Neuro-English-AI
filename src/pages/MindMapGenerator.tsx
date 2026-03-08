import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateMindMapData } from '../utils/gemini';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const MindMapGenerator: React.FC = () => {
  const { user, userLevel } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(userLevel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      // 1. Generate mind map data using Gemini
      const data = await generateMindMapData(topic, level);

      // 2. Save to Firestore
      const newMap = {
        uid: user.uid,
        topic,
        level,
        nodes: JSON.stringify(data.nodes),
        edges: JSON.stringify(data.edges),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'mindmaps'), newMap);

      // 3. Navigate to the new mind map
      navigate(`/mindmaps/${docRef.id}`);
    } catch (err: any) {
      console.error('Error generating mind map:', err);
      setError(err.message || 'Failed to generate mind map. Please try again.');
      if (err.message && err.message.includes('Firestore')) {
         handleFirestoreError(err, OperationType.CREATE, 'mindmaps');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} className="text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Generate Mind Map</h1>
        <p className="text-zinc-400 text-lg">
          Enter a topic and let AI create a structured visual learning map tailored to your level.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-zinc-300 mb-2">
              What do you want to learn about?
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Food, Travel, Business Meetings, Phrasal Verbs"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-zinc-300 mb-2">
              Your English Level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
            >
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper Intermediate</option>
              <option value="C1">C1 - Advanced</option>
              <option value="C2">C2 - Proficient</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-3 text-lg mt-8"
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Generating Neural Map...
              </>
            ) : (
              <>
                <Brain size={24} />
                Generate Mind Map
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
