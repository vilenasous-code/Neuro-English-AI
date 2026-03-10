import React from 'react';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
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
