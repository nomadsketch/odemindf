
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Category, Project, ArchiveItem } from '../types.ts';

// 고효율 이미지 압축 함수 (용량 최적화)
const compressImage = (base64Str: string, maxWidth = 1000, quality = 0.6): Promise<string> => {
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
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const compressed = await compressImage(base64);
      newUrls.push(compressed);
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
      alert("ERROR: ID_AND_TITLE_REQUIRED");
      return;
    }
    onSave(formData as Project);
  };

  return (
    <form onSubmit={handleSave} className="border border-black p-6 bg-white space-y-4 text-xs font-mono text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_ID</label>
          <input 
            value={formData.id} 
            onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
            placeholder="ODM-PRJ-2025-001"
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase font-bold"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_TITLE</label>
          <input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase font-bold"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CATEGORY_NODE</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value as Category})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase font-bold cursor-pointer"
          >
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">
          VISUAL_ASSETS {isProcessing && <span className="text-black animate-pulse ml-2">[ OPTIMIZING... ]</span>}
        </label>
        <div className="flex flex-wrap gap-2 p-3 border border-dashed border-black/20 bg-gray-50/50">
          {formData.imageUrls?.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24 border border-black group">
              <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="preview" />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0 right-0 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5 opacity-0 group-hover:opacity-100 uppercase">{idx + 1}</div>
            </div>
          ))}
          {!isProcessing && (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border border-black flex items-center justify-center text-xl hover:bg-black hover:text-white transition-all bg-white"
            >
              +
            </button>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CLIENT_ID</label>
          <input 
            value={formData.client} 
            onChange={e => setFormData({...formData, client: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">STATUS_FLAG</label>
          <select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as any})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase font-bold cursor-pointer"
          >
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_DESCRIPTION</label>
        <textarea 
          rows={3}
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
          className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase resize-none leading-relaxed"
        />
      </div>

      <div className="flex gap-2 pt-6">
        <button 
          type="submit"
          disabled={isProcessing}
          className="flex-grow py-4 bg-black text-white font-black uppercase hover:invert border border-black transition-all disabled:opacity-50 tracking-[0.2em]"
        >
          [ COMMIT_CHANGES ]
        </button>
        <button 
          type="button"
          onClick={onCancel} 
          className="px-8 py-4 border border-black hover:bg-black hover:text-white transition-all uppercase font-black"
        >
          CANCEL
        </button>
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
    
    const compressed = await compressImage(base64, 800, 0.6);
    setFormData(prev => ({ ...prev, imageUrl: compressed }));
    setIsProcessing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.company) {
      alert("ERROR: DATA_MISSING");
      return;
    }
    onSave(formData as ArchiveItem);
  };

  return (
    <form onSubmit={handleSave} className="border border-black p-6 bg-white space-y-4 text-xs font-mono text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">YEAR_STAMP</label>
          <input 
            value={formData.year} 
            onChange={e => setFormData({...formData, year: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">COMPANY_ID</label>
          <input 
            value={formData.company} 
            onChange={e => setFormData({...formData, company: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase font-bold"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">ARCHIVE_VISUAL {isProcessing && '...'}</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border border-black bg-gray-50 flex items-center justify-center overflow-hidden">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} className="w-full h-full object-cover grayscale" />
            ) : (
              <span className="text-[8px] opacity-20">N/A</span>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="border border-black px-4 py-2 text-[9px] hover:bg-black hover:text-white transition-all uppercase font-bold"
          >
            [ ATTACH_IMAGE ]
          </button>
          {formData.imageUrl && (
            <button 
              type="button" 
              onClick={() => setFormData({...formData, imageUrl: ''})}
              className="text-[8px] opacity-40 hover:opacity-100 hover:text-red-600 underline uppercase"
            >
              PURGE_IMAGE
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CATEGORY_LOG</label>
          <input 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_REF</label>
          <input 
            value={formData.project} 
            onChange={e => setFormData({...formData, project: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-6">
        <button 
          type="submit"
          className="flex-grow py-4 bg-black text-white font-black uppercase hover:invert border border-black transition-all tracking-[0.2em]"
        >
          [ COMMIT_ARCHIVE ]
        </button>
        <button 
          type="button"
          onClick={onCancel} 
          className="px-8 py-4 border border-black hover:bg-black hover:text-white transition-all uppercase font-black"
        >
          CANCEL
        </button>
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
  // 백업용
  fullReset?: (newState: AppState) => void;
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
  const [storageUsage, setStorageUsage] = useState<string>('0%');

  const [siteTitle, setSiteTitle] = useState(state.siteTitle || '');
  const [tagline, setTagline] = useState(state.tagline || '');

  useEffect(() => {
    const usage = JSON.stringify(state).length;
    const limit = 5 * 1024 * 1024; // 5MB
    const percent = Math.min(100, (usage / limit) * 100);
    setStorageUsage(`${percent.toFixed(1)}%`);
  }, [state]);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ODEMIND_DATABASE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.projects && json.archiveItems) {
          if (window.confirm("WARNING: THIS_WILL_OVERWRITE_ALL_CURRENT_DATA. PROCEED?")) {
            localStorage.setItem('odemind_archive_v4_prod', JSON.stringify(json));
            window.location.reload();
          }
        }
      } catch (err) {
        alert("ERROR: INVALID_JSON_STRUCTURE");
      }
    };
    reader.readAsText(file);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteTitle, tagline);
    alert("SYSTEM_CONFIG: UPDATED_AND_SAVED");
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-12 font-mono pb-32 text-black animate-in fade-in duration-700">
      <div className="border-b-2 border-black pb-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-black leading-none">ROOT_ACCESS</h1>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-40 font-bold uppercase">DATABASE_LOAD:</span>
              <div className="w-32 h-2 border border-black bg-gray-100 p-0.5">
                <div className="h-full bg-black transition-all duration-1000" style={{ width: storageUsage }}></div>
              </div>
              <span className="text-[10px] font-black">{storageUsage}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setActiveTab('PROJECTS'); setNewProjectForm(true); setEditingProjectId(null); }}
            className="bg-black text-white px-5 py-3 font-black text-[10px] uppercase hover:invert transition-all border border-black tracking-widest"
          >
            [ ADD_NEW_PROJECT ]
          </button>
          <button 
            onClick={() => { setActiveTab('ARCHIVE'); setNewArchiveForm(true); setEditingArchiveId(null); }}
            className="bg-white text-black px-5 py-3 font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all border border-black tracking-widest"
          >
            [ LOG_NEW_ARCHIVE ]
          </button>
        </div>
      </div>

      <nav className="flex gap-10 mb-12 border-b border-black/10 pb-4">
        <button onClick={() => setActiveTab('PROJECTS')} className={`text-xs font-black uppercase tracking-[0.3em] ${activeTab === 'PROJECTS' ? 'underline underline-offset-8 decoration-2' : 'opacity-30 hover:opacity-100'}`}>PROJECTS</button>
        <button onClick={() => setActiveTab('ARCHIVE')} className={`text-xs font-black uppercase tracking-[0.3em] ${activeTab === 'ARCHIVE' ? 'underline underline-offset-8 decoration-2' : 'opacity-30 hover:opacity-100'}`}>ARCHIVE_LIST</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={`text-xs font-black uppercase tracking-[0.3em] ${activeTab === 'SETTINGS' ? 'underline underline-offset-8 decoration-2' : 'opacity-30 hover:opacity-100'}`}>CONFIG_SETTINGS</button>
      </nav>

      <div className="space-y-12">
        {activeTab === 'PROJECTS' && (
          <div className="animate-in slide-in-from-left-4 duration-500">
            {newProjectForm && (
              <div className="border-4 border-black p-1 mb-12 bg-gray-50">
                <ProjectForm 
                  project={{ id: `ODM-PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` }} 
                  onSave={(p) => { addProject(p); setNewProjectForm(false); }}
                  onCancel={() => setNewProjectForm(false)}
                />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {state.projects.map(project => (
                <div key={project.id} className="border border-black/10 bg-white">
                  {editingProjectId === project.id ? (
                    <div className="p-4 bg-gray-50 border-b border-black"><ProjectForm project={project} onSave={(p) => { updateProject(project.id, p); setEditingProjectId(null); }} onCancel={() => setEditingProjectId(null)} /></div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center p-4 gap-6 group hover:bg-black hover:text-white transition-all">
                       <div className="w-16 h-16 border border-black shrink-0 overflow-hidden bg-gray-100">
                          {project.imageUrls?.[0] ? <img src={project.imageUrls[0]} className="w-full h-full object-cover grayscale" /> : <span className="text-[8px] opacity-20">NO_IMG</span>}
                       </div>
                       <div className="flex-grow">
                          <div className="text-[10px] font-bold opacity-40 uppercase mb-1">ID: {project.id}</div>
                          <div className="text-sm font-black italic uppercase tracking-tighter">{project.title}</div>
                       </div>
                       <div className="flex gap-6 items-center">
                          <div className="text-[10px] font-bold italic opacity-40 uppercase">[{project.category}]</div>
                          <button onClick={() => setEditingProjectId(project.id)} className="text-[10px] font-black underline uppercase hover:scale-110 transition-transform">EDIT</button>
                          <button onClick={() => deleteProject(project.id)} className="text-[10px] font-black underline uppercase text-red-500 hover:scale-110 transition-transform">DELETE</button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ARCHIVE' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
            {newArchiveForm && (
              <div className="border-4 border-black p-1 mb-12 bg-gray-50">
                <ArchiveForm 
                  item={{ id: Date.now().toString() }} 
                  onSave={(item) => { addArchiveItem(item); setNewArchiveForm(false); }}
                  onCancel={() => setNewArchiveForm(false)}
                />
              </div>
            )}
            <div className="space-y-4">
              {(state.archiveItems || []).map(item => (
                <div key={item.id} className="border border-black/10 bg-white">
                  {editingArchiveId === item.id ? (
                    <div className="p-4 bg-gray-50 border-b border-black"><ArchiveForm item={item} onSave={(updated) => { updateArchiveItem(item.id, updated); setEditingArchiveId(null); }} onCancel={() => setEditingArchiveId(null)} /></div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center p-4 gap-6 group hover:bg-black hover:text-white transition-all">
                       <div className="text-[11px] font-black opacity-40 w-16">{item.year}</div>
                       <div className="flex-grow">
                          <div className="text-sm font-black italic uppercase tracking-tighter">{item.company}</div>
                          <div className="text-[9px] opacity-50 uppercase">{item.project}</div>
                       </div>
                       <div className="flex gap-6 items-center">
                          <button onClick={() => setEditingArchiveId(item.id)} className="text-[10px] font-black underline uppercase">EDIT</button>
                          <button onClick={() => deleteArchiveItem(item.id)} className="text-[10px] font-black underline uppercase text-red-500">DELETE</button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl animate-in zoom-in-95 duration-500">
            <form onSubmit={handleSettingsSave} className="space-y-8 border-2 border-black p-10 bg-white">
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-black mb-2 uppercase tracking-widest underline">SITE_IDENTITY_TITLE</label>
                <input value={siteTitle} onChange={e => setSiteTitle(e.target.value.toUpperCase())} className="bg-white border-b-2 border-black p-2 text-lg outline-none focus:bg-gray-50 uppercase font-black italic" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-black mb-2 uppercase tracking-widest underline">MISSION_TAGLINE_LOG</label>
                <textarea rows={5} value={tagline} onChange={e => setTagline(e.target.value.toUpperCase())} className="bg-white border border-black/20 p-4 text-xs outline-none focus:border-black uppercase resize-none leading-relaxed font-bold" />
              </div>
              <button type="submit" className="w-full py-5 bg-black text-white font-black text-xs uppercase hover:invert border border-black tracking-[0.3em] transition-all">[ PERSIST_SYSTEM_CONFIG ]</button>
            </form>

            <div className="mt-16 pt-10 border-t-2 border-dashed border-black/10">
               <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6 opacity-40 underline">DATABASE_MAINTENANCE</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={handleExport} className="py-4 border-2 border-black text-black font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all tracking-widest flex items-center justify-center gap-2">
                    <span className="text-lg">↓</span> [ DOWNLOAD_DB_BACKUP ]
                  </button>
                  <label className="py-4 border-2 border-black text-black font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all tracking-widest flex items-center justify-center gap-2 cursor-pointer text-center">
                    <span className="text-lg">↑</span> [ UPLOAD_DB_BACKUP ]
                    <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                  </label>
               </div>
               <p className="mt-4 text-[8px] opacity-30 text-center uppercase tracking-widest">주의: 백업 파일을 업로드하면 현재 저장된 모든 데이터가 덮어씌워집니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
