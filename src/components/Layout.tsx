import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, LogOut, Map, BookOpen, MessageSquare, Settings, Image as ImageIcon } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Brain size={20} /> },
    { path: '/mindmaps', label: 'Mind Maps', icon: <Map size={20} /> },
    { path: '/practice', label: 'Practice', icon: <BookOpen size={20} /> },
    { path: '/dialogues', label: 'Dialogues', icon: <MessageSquare size={20} /> },
    { path: '/image-association', label: 'Visuals', icon: <ImageIcon size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">NeuroEnglish AI</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-600/10 text-purple-400 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full bg-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user.displayName || user.email}</p>
            </div>
          </div>
          <button
            onClick={logOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <Outlet />
      </main>
    </div>
  );
};
