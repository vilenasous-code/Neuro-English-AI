import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MindMapList } from './pages/MindMapList';
import { MindMapGenerator } from './pages/MindMapGenerator';
import { MindMapView } from './pages/MindMapView';
import { Practice } from './pages/Practice';
import { GeneratePractice } from './pages/GeneratePractice';
import { DialogueList } from './pages/DialogueList';
import { DialogueView } from './pages/DialogueView';
import { GenerateDialogue } from './pages/GenerateDialogue';
import { Settings } from './pages/Settings';
import { ImageAssociation } from './pages/ImageAssociation';

// @ts-ignore
const hasSelectedApiKey = async () => window.aistudio?.hasSelectedApiKey ? window.aistudio.hasSelectedApiKey() : true;
// @ts-ignore
const openSelectKey = async () => window.aistudio?.openSelectKey ? window.aistudio.openSelectKey() : null;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // Add a timeout to prevent infinite loading if the API is unresponsive
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        const has = await Promise.race([
          hasSelectedApiKey(),
          timeoutPromise
        ]);
        setHasKey(has);
      } catch (e) {
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  if (loading || hasKey === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
          <p className="text-zinc-400 mb-6">
            To use advanced features like high-quality image generation for vocabulary associations, please select your Google Cloud API key.
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
              Learn more about billing
            </a>
          </p>
          <button
            onClick={async () => {
              try {
                await openSelectKey();
              } catch (e) {
                console.error("Error opening select key dialog:", e);
              }
              setHasKey(true); // Assume success to mitigate race condition
            }}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-semibold"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="mindmaps" element={<MindMapList />} />
        <Route path="mindmaps/new" element={<MindMapGenerator />} />
        <Route path="mindmaps/:id" element={<MindMapView />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/generate/:id" element={<GeneratePractice />} />
        <Route path="dialogues" element={<DialogueList />} />
        <Route path="dialogues/:id" element={<DialogueView />} />
        <Route path="dialogues/generate/:id" element={<GenerateDialogue />} />
        <Route path="settings" element={<Settings />} />
        <Route path="image-association" element={<ImageAssociation />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
