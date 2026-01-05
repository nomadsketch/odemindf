
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Category, Project, ArchiveItem } from '../types.ts';

// 초고효율 압축 함수 (600px, 0.4 quality로 대폭 축소하여 LocalStorage 용량 확보)
const compressImage = (base64Str: string, maxWidth = 600, quality = 0.4): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve('');
  });
};

interface ProjectFormProps {
  project: Partial<Project>;
  onSave: (p: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    id: '',
    title: '',
    category: Category.BRANDING,
    client: '',
    status: 'IN_PROGRESS',
    date: new Date().toISOString().split('T')[0],
    description: '',
    imageUrls: [],
    ...project
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    const newUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert("SKIP: FILE_TOO_LARGE (>10MB)");
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const compressed = await compressImage(base64);
      if (compressed) newUrls.push(compressed);
    }

    setFormData(prev => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), ...newUrls]
    }));
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.title) {
      alert("ERROR: MANDATORY_DATA_MISSING");
      return;
    }
    onSave(formData as Project);
  };

  return (
    <form onSubmit={handleSave} className="border-2 border-black p-6 bg-white space-y-4 text-xs font-mono text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">ID_REF</label>
          <input 
            value={formData.id} 
            onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
            className="border border-black p-2 outline-none focus:bg-gray-50 font-bold uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">TITLE_STRING</label>
          <input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
            className="border border-black p-2 outline-none focus:bg-gray-50 font-bold uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">CAT_NODE</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value as Category})}
            className="border border-black p-2 outline-none font-bold cursor-pointer"
          >
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-40 font-bold mb-2 uppercase">
          VISUAL_BUFFER {isProcessing && <span className="text-black animate-pulse">[ PROCESSING... ]</span>}
        </label>
        <div className="flex flex-wrap gap-2 p-3 border border-dashed border-black/30 bg-gray-50">
          {formData.imageUrls?.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 border border-black">
              <img src={url} className="w-full h-full object-cover grayscale" />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0 right-0 bg-black text-white w-5 h-5 flex items-center justify-center text-[8px]"
              >✕</button>
            </div>
          ))}
          {!isProcessing && (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border border-black flex items-center justify-center text-xl hover:bg-black hover:text-white transition-all"
            >+</button>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">CLIENT_REF</label>
        <input 
          value={formData.client} 
          onChange={e => setFormData({...formData, client: e.target.value.toUpperCase()})}
          className="border border-black p-2 outline-none font-bold"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">DESC_BLOCK</label>
        <textarea 
          rows={3}
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
          className="border border-black p-2 outline-none resize-none font-bold uppercase leading-relaxed"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button type="submit" className="flex-grow py-4 bg-black text-white font-black uppercase hover:invert transition-all">[ SAVE_PROJECT_DATA ]</button>
        <button type="button" onClick={onCancel} className="px-6 py-4 border border-black font-black uppercase">CANCEL</button>
      </div>
    </form>
  );
};

interface ArchiveFormProps {
  item: Partial<ArchiveItem>;
  onSave: (p: ArchiveItem) => void;
  onCancel: () => void;
}

const ArchiveForm: React.FC<ArchiveFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ArchiveItem>>({
    id: Date.now().toString(),
    year: '',
    company: '',
    category: '',
    project: '',
    imageUrl: '',
    ...item
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    const compressed = await compressImage(base64);
    setFormData(prev => ({ ...prev, imageUrl: compressed }));
    setIsProcessing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.company) return;
    onSave(formData as ArchiveItem);
  };

  return (
    <form onSubmit={handleSave} className="border-2 border-black p-6 bg-white space-y-4 text-xs font-mono text-black">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">STAMP</label>
          <input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value.toUpperCase()})} className="border border-black p-2 outline-none font-bold" />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">COMPANY</label>
          <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value.toUpperCase()})} className="border border-black p-2 outline-none font-bold" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-black shrink-0 overflow-hidden bg-gray-50">
          {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover grayscale" />}
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="border border-black px-3 py-1 font-bold text-[9px] uppercase hover:bg-black hover:text-white transition-all">[ ATTACH_ASSET ]</button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] opacity-40 font-bold mb-1 uppercase">LOG_SUMMARY</label>
        <input value={formData.project} onChange={e => setFormData({...formData, project: e.target.value.toUpperCase()})} className="border border-black p-2 outline-none font-bold" />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="flex-grow py-3 bg-black text-white font-black uppercase hover:invert transition-all">[ SAVE_LOG ]</button>
        <button type="button" onClick={onCancel} className="px-4 py-3 border border-black font-black uppercase">CANCEL</button>
      </div>
    </form>
  );
};

interface AdminViewProps {
  state: AppState;
  updateProject: (id: string, updated: Project) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateArchiveItem: (id: string, updated: ArchiveItem) => void;
  addArchiveItem: (item: ArchiveItem) => void;
  deleteArchiveItem: (id: string) => void;
  updateSettings: (siteTitle: string, tagline: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  state, updateProject, addProject, deleteProject,
  updateArchiveItem, addArchiveItem, deleteArchiveItem,
  updateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'ARCHIVE' | 'SETTINGS'>('PROJECTS');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectForm, setNewProjectForm] = useState(false);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  const [newArchiveForm, setNewArchiveForm] = useState(false);
  const [siteTitle, setSiteTitle] = useState(state.siteTitle || '');
  const [tagline, setTagline] = useState(state.tagline || '');

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ODEMIND_DATABASE_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.projects) {
          if (confirm("OVERWRITE CURRENT DATABASE?")) {
            localStorage.setItem('odemind_archive_v5_final', JSON.stringify(json));
            window.location.reload();
          }
        }
      } catch (err) { alert("ERROR: INVALID_DATA_STRUCTURE"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-16 pb-32 animate-in fade-in duration-500 text-black">
      <header className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">SYS_ADMIN</h1>
          <p className="text-[10px] opacity-40 font-bold uppercase mt-4 tracking-[0.4em]">DATABASE_MANAGEMENT_STATION</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setActiveTab('PROJECTS'); setNewProjectForm(true); setEditingProjectId(null); }} className="bg-black text-white px-6 py-4 font-black text-[10px] uppercase border border-black hover:invert transition-all">[ ADD_PROJECT ]</button>
          <button onClick={() => { setActiveTab('ARCHIVE'); setNewArchiveForm(true); setEditingArchiveId(null); }} className="border-2 border-black px-6 py-4 font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all">[ LOG_ARCHIVE ]</button>
        </div>
      </header>

      <nav className="flex gap-12 mb-12 border-b-2 border-black pb-4 text-xs font-black uppercase tracking-widest">
        <button onClick={() => setActiveTab('PROJECTS')} className={activeTab === 'PROJECTS' ? 'underline decoration-4 underline-offset-8' : 'opacity-20 hover:opacity-100'}>PROJECTS</button>
        <button onClick={() => setActiveTab('ARCHIVE')} className={activeTab === 'ARCHIVE' ? 'underline decoration-4 underline-offset-8' : 'opacity-20 hover:opacity-100'}>ARCHIVE</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={activeTab === 'SETTINGS' ? 'underline decoration-4 underline-offset-8' : 'opacity-20 hover:opacity-100'}>CONFIG</button>
      </nav>

      <div className="space-y-12">
        {activeTab === 'PROJECTS' && (
          <div className="space-y-6">
            {newProjectForm && <ProjectForm project={{}} onSave={(p) => { addProject(p); setNewProjectForm(false); }} onCancel={() => setNewProjectForm(false)} />}
            {state.projects.map(p => (
              <div key={p.id} className="border border-black p-4 group hover:bg-black hover:text-white transition-all">
                {editingProjectId === p.id ? (
                  <ProjectForm project={p} onSave={(upd) => { updateProject(p.id, upd); setEditingProjectId(null); }} onCancel={() => setEditingProjectId(null)} />
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 flex-grow">
                      <div className="w-16 h-16 border border-black grayscale overflow-hidden">
                        {p.imageUrls?.[0] && <img src={p.imageUrls[0]} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="text-[10px] opacity-40 font-bold">{p.id}</div>
                        <div className="text-lg font-black italic uppercase tracking-tighter">{p.title}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 items-center shrink-0">
                      <button onClick={() => setEditingProjectId(p.id)} className="text-[10px] font-black underline uppercase">EDIT</button>
                      <button onClick={() => deleteProject(p.id)} className="text-[10px] font-black underline uppercase text-red-500">DELETE</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ARCHIVE' && (
          <div className="space-y-6">
            {newArchiveForm && <ArchiveForm item={{}} onSave={(i) => { addArchiveItem(i); setNewArchiveForm(false); }} onCancel={() => setNewArchiveForm(false)} />}
            {state.archiveItems.map(item => (
              <div key={item.id} className="border border-black p-4 group hover:bg-black hover:text-white transition-all">
                {editingArchiveId === item.id ? (
                  <ArchiveForm item={item} onSave={(upd) => { updateArchiveItem(item.id, upd); setEditingArchiveId(null); }} onCancel={() => setEditingArchiveId(null)} />
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] opacity-40 font-bold mr-4">{item.year}</span>
                      <span className="text-sm font-black italic uppercase tracking-tighter">{item.company}</span>
                    </div>
                    <div className="flex gap-6">
                      <button onClick={() => setEditingArchiveId(item.id)} className="text-[10px] font-black underline uppercase">EDIT</button>
                      <button onClick={() => deleteArchiveItem(item.id)} className="text-[10px] font-black underline uppercase text-red-500">DELETE</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-xl space-y-12">
            <form onSubmit={(e) => { e.preventDefault(); updateSettings(siteTitle, tagline); alert("SYNCED_OK"); }} className="space-y-8 p-10 border-4 border-black">
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-black mb-2 uppercase underline">SITE_TITLE</label>
                <input value={siteTitle} onChange={e => setSiteTitle(e.target.value.toUpperCase())} className="border-b-2 border-black p-2 text-2xl font-black italic outline-none uppercase" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-black mb-2 uppercase underline">TAGLINE_LOG</label>
                <textarea rows={4} value={tagline} onChange={e => setTagline(e.target.value.toUpperCase())} className="border border-black p-4 text-xs font-bold outline-none uppercase resize-none leading-relaxed" />
              </div>
              <button type="submit" className="w-full py-5 bg-black text-white font-black uppercase text-xs tracking-widest">[ PERSIST_CONFIG ]</button>
            </form>

            <div className="pt-10 border-t-2 border-dashed border-black/10">
               <h3 className="text-[11px] font-black uppercase mb-6 opacity-40 underline">DATABASE_IO</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={handleExport} className="py-4 border-2 border-black font-black text-[10px] uppercase hover:invert transition-all flex items-center justify-center gap-2">↓ [ DOWNLOAD_BACKUP ]</button>
                  <label className="py-4 border-2 border-black font-black text-[10px] uppercase hover:invert transition-all flex items-center justify-center gap-2 cursor-pointer">
                    ↑ [ RESTORE_BACKUP ]
                    <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                  </label>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
