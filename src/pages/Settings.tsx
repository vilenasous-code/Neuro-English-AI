import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, userLevel, updateLevel } = useAuth();
  const [level, setLevel] = useState(userLevel);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateLevel(level);
      setMessage('Settings saved successfully.');
    } catch (error) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="text-zinc-500" />
          Settings
        </h1>
        <p className="text-zinc-400 text-base md:text-lg">
          Manage your learning preferences and account details.
        </p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl shadow-xl">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}`} 
                alt="Profile" 
                className="w-16 h-16 rounded-full bg-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-lg font-medium text-white">{user?.displayName || 'Learner'}</p>
                <p className="text-zinc-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Learning Preferences</h2>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-zinc-300 mb-2">
                Target English Level
              </label>
              <p className="text-sm text-zinc-500 mb-4">
                This level will be used as the default when generating new mind maps and exercises.
              </p>
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
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message}
            </div>
          )}

          <div className="border-t border-zinc-800 pt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving || level === userLevel}
              className="py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
