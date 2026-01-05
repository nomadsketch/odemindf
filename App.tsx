
import React, { useState, useEffect } from 'react';
import { AppState, Project, ArchiveItem } from './types.ts';
import { INITIAL_PROJECTS, INITIAL_SERVICES, INITIAL_ARCHIVE } from './constants.tsx';
import PublicView from './components/PublicView.tsx';
import AdminView from './components/AdminView.tsx';

const STORAGE_KEY = 'odemind_archive_v5_final';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      projects: INITIAL_PROJECTS,
      archiveItems: INITIAL_ARCHIVE,
      services: INITIAL_SERVICES,
      siteTitle: 'ODEMIND',
      tagline: 'ODEMIND OPERATES AS AN ASIAN CONTENT AND DISTRIBUTION HUB, COLLABORATING WITH STRATEGIC PARTNERS ACROSS CHINA, TAIWAN, HONG KONG, AND INDONESIA.'
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 저장된 데이터가 유효한지 최소한의 검사 수행
        if (parsed && Array.isArray(parsed.projects)) {
          return { ...defaultState, ...parsed };
        }
      }
    } catch (e) {
      console.warn("SYSTEM: FAILED_TO_LOAD_PERSISTENT_STORAGE", e);
    }
    return defaultState;
  });

  // 상태가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setIsSyncing(false);
      } catch (e) {
        setIsSyncing(false);
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          alert("CRITICAL_ERROR: STORAGE_LIMIT_EXCEEDED.\n이미지가 너무 많거나 큽니다. 일부 프로젝트를 삭제하거나 이미지를 줄여주세요.");
        }
      }
    }, 500); // 디바운싱 처리
    return () => clearTimeout(timer);
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

  // 데이터 관리 함수들
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
    <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white">
      {/* CMS Access Button */}
      <button 
        onClick={handleAdminToggle}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 border border-black/20 text-[9px] uppercase hover:bg-black hover:text-white transition-all bg-white/80 backdrop-blur-sm shadow-sm font-bold"
      >
        {isAdmin ? '[ EXIT_CMS ]' : '[ ACCESS_CMS ]'}
      </button>

      {/* Sync Status for Admin */}
      {isAdmin && isSyncing && (
        <div className="fixed bottom-12 right-4 z-50 text-[8px] font-black uppercase text-black animate-pulse">
          [ SYNCING_TO_STORAGE... ]
        </div>
      )}

      {/* Auth Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-[100] bg-white/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs border-2 border-black p-8 bg-white shadow-2xl">
            <div className="text-[8px] opacity-40 mb-8 uppercase font-bold text-center tracking-widest">AUTHENTICATION_PROTOCOL</div>
            <form onSubmit={handleAuth} className="space-y-6">
              <input 
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-black'} p-3 text-center text-sm outline-none uppercase font-black tracking-[0.5em]`}
                placeholder="PASSKEY"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-grow bg-black text-white py-3 text-[10px] font-black uppercase border border-black hover:invert transition-all">CONNECT</button>
                <button type="button" onClick={() => setIsAuthenticating(false)} className="px-4 border border-black text-[9px] uppercase font-bold">CANCEL</button>
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
