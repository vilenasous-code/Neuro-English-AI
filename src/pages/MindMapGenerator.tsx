import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateMindMapData } from '../utils/gemini';
import { collection, addDoc } from '../mockFirebase';
import { db } from '../firebase';
import { Brain, Sparkles, Loader2, Key } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export const MindMapGenerator: React.FC = () => {
  const { user, userLevel } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(userLevel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setNeedsApiKey(false);
        setError('');
      } else {
        setError('Please configure VITE_GEMINI_API_KEY in your environment variables.');
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !user) return;

    setLoading(true);
    setError('');
    setNeedsApiKey(false);

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
      
      if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('leaked')) {
        setError('A sua chave de API foi bloqueada pelo Google ou é inválida. Por favor, selecione uma nova chave.');
        setNeedsApiKey(true);
        // @ts-ignore
        if (window.aistudio && window.aistudio.openSelectKey) {
          // @ts-ignore
          window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Failed to generate mind map. Please try again.');
      }

      if (err.message && err.message.includes('Firestore')) {
         handleFirestoreError(err, OperationType.CREATE, 'mindmaps');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8 md:mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} className="text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Generate Mind Map</h1>
        <p className="text-zinc-400 text-base md:text-lg">
          Enter a topic and let AI create a structured visual learning map tailored to your level.
        </p>
      </div>

      {needsApiKey && (
        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl mb-8 text-center">
          <Key className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">API Key Required</h2>
          <p className="text-zinc-400 mb-6">
            The default API key has been blocked. Please select your own Google Cloud API key to continue.
          </p>
          <button
            onClick={handleSelectKey}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Select API Key
          </button>
        </div>
      )}

      <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl shadow-xl">
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
