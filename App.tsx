
import React, { useState, useEffect } from 'react';
import { AppState, Project, ArchiveItem } from './types.ts';
import { INITIAL_PROJECTS, INITIAL_SERVICES, INITIAL_ARCHIVE } from './constants.tsx';
import PublicView from './components/PublicView.tsx';
import AdminView from './components/AdminView.tsx';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      projects: INITIAL_PROJECTS,
      archiveItems: INITIAL_ARCHIVE,
      services: INITIAL_SERVICES,
      siteTitle: 'ODEMIND',
      tagline: 'ODEMIND OPERATES AS AN ASIAN CONTENT AND DISTRIBUTION HUB, COLLABORATING WITH STRATEGIC PARTNERS ACROSS CHINA, TAIWAN, HONG KONG, AND INDONESIA.'
    };

    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('odemind_archive_v4_prod');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.projects)) {
            // 구 버전 데이터와 신규 기본 데이터 병합 방지 (저장된 것만 사용)
            return { ...defaultState, ...parsed };
          }
        }
      }
    } catch (e) {
      console.warn("SYSTEM_INIT: STORAGE_READ_FAILED", e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem('odemind_archive_v4_prod', JSON.stringify(state));
    } catch (e) {
      console.error("SYSTEM_SYNC_ERROR", e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        alert("CRITICAL_ERROR: STORAGE_LIMIT_EXCEEDED. PLEASE_REDUCE_IMAGE_ASSETS.");
      }
    }
  }, [state]);

  const handleAdminToggle = () => {
    if (isAdmin) setIsAdmin(false);
    else setIsAuthenticating(true);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0729') {
      setIsAdmin(true);
      setIsAuthenticating(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const updateProject = (id: string, updated: Project) => {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? updated : p) }));
  };

  const addProject = (project: Project) => {
    setState(prev => ({ ...prev, projects: [project, ...prev.projects] }));
  };

  const deleteProject = (id: string) => {
    if (window.confirm(`CONFIRM_DELETION: ${id}?`)) {
      setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    }
  };

  const updateArchiveItem = (id: string, updated: ArchiveItem) => {
    setState(prev => ({ ...prev, archiveItems: prev.archiveItems.map(item => item.id === id ? updated : item) }));
  };

  const addArchiveItem = (item: ArchiveItem) => {
    setState(prev => ({ ...prev, archiveItems: [item, ...prev.archiveItems] }));
  };

  const deleteArchiveItem = (id: string) => {
    if (window.confirm("CONFIRM_DELETION_OF_LOG_RECORD?")) {
      setState(prev => ({ ...prev, archiveItems: prev.archiveItems.filter(item => item.id !== id) }));
    }
  };

  const updateSettings = (siteTitle: string, tagline: string) => {
    setState(prev => ({ ...prev, siteTitle, tagline }));
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-mono custom-scrollbar">
      <button 
        onClick={handleAdminToggle}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 border border-black/20 text-[9px] uppercase hover:bg-black hover:text-white transition-all bg-white/50 backdrop-blur-sm shadow-lg font-bold tracking-widest"
      >
        {isAdmin ? '[ EXIT_CMS ]' : '[ ACCESS_CMS ]'}
      </button>

      {isAuthenticating && (
        <div className="fixed inset-0 z-[100] bg-white/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-xs border border-black p-8 bg-white shadow-2xl">
            <div className="text-[8px] opacity-40 mb-8 underline tracking-[0.4em] uppercase font-bold text-center">AUTHENTICATION_REQUIRED</div>
            <form onSubmit={handleAuth} className="space-y-6">
              <input 
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-transparent border ${error ? 'border-red-500' : 'border-black/20'} focus:border-black p-3 text-[11px] outline-none tracking-[0.6em] uppercase text-center font-bold`}
                placeholder="PASSKEY"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-grow bg-black text-white py-3 text-[10px] font-black uppercase border border-black hover:invert transition-all">OK</button>
                <button type="button" onClick={() => setIsAuthenticating(false)} className="px-4 border border-black/20 text-[9px] uppercase font-bold">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin ? (
        <AdminView 
          state={state} 
          updateProject={updateProject} 
          addProject={addProject}
          deleteProject={deleteProject}
          updateArchiveItem={updateArchiveItem}
          addArchiveItem={addArchiveItem}
          deleteArchiveItem={deleteArchiveItem}
          updateSettings={updateSettings}
        />
      ) : (
        <PublicView state={state} />
      )}
    </div>
  );
};

export default App;
