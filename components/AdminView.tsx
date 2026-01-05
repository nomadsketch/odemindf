
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Category, Project, ArchiveItem } from '../types.ts';

// Helper function to compress images before saving to LocalStorage
const compressImage = (base64Str: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
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
      ctx?.drawImage(img, 0, 0, width, height);
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
      alert("REQUIRED_FIELDS: ID_AND_TITLE_MUST_BE_DEFINED");
      return;
    }
    onSave(formData as Project);
  };

  return (
    <form onSubmit={handleSave} className="border border-black p-6 bg-white space-y-4 text-xs font-mono animate-in fade-in zoom-in-95 text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_ID</label>
          <input 
            value={formData.id} 
            onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
            placeholder="ODM-PRJ-XXXX-XXX"
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">TITLE</label>
          <input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CATEGORY</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value as Category})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase cursor-pointer"
          >
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CLIENT</label>
          <input 
            value={formData.client} 
            onChange={e => setFormData({...formData, client: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">STATUS</label>
          <select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as any})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase cursor-pointer"
          >
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">DATE_STAMP</label>
          <input 
            type="date"
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">
          IMAGE_ASSETS {isProcessing && <span className="text-yellow-600 animate-pulse ml-2">[ OPTIMIZING_DATA... ]</span>}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.imageUrls?.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 border border-black/10 group">
              <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="preview" />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                X
              </button>
            </div>
          ))}
          {!isProcessing && (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border border-dashed border-black/20 flex items-center justify-center text-xl hover:bg-black/5 transition-colors"
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

      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">DESCRIPTION</label>
        <textarea 
          rows={3}
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
          className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase resize-none"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button 
          type="submit"
          disabled={isProcessing}
          className="flex-grow py-3 bg-black text-white font-bold uppercase hover:bg-transparent hover:text-black border border-black transition-all disabled:opacity-50"
        >
          [ COMMIT_CHANGES ]
        </button>
        <button 
          type="button"
          onClick={onCancel} 
          className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors uppercase font-bold"
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    const compressed = await compressImage(base64, 800, 0.6);
    setFormData(prev => ({ ...prev, imageUrl: compressed }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.company) {
      alert("REQUIRED: YEAR_AND_COMPANY_NAME");
      return;
    }
    onSave(formData as ArchiveItem);
  };

  return (
    <form onSubmit={handleSave} className="border border-black p-6 bg-white space-y-4 text-xs font-mono animate-in fade-in text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">YEAR_STAMP (EX: 2024)</label>
          <input 
            value={formData.year} 
            onChange={e => setFormData({...formData, year: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">COMPANY_NAME</label>
          <input 
            value={formData.company} 
            onChange={e => setFormData({...formData, company: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">CATEGORY_LOG</label>
          <input 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] opacity-50 mb-1 uppercase">PROJECT_SUMMARY</label>
          <input 
            value={formData.project} 
            onChange={e => setFormData({...formData, project: e.target.value.toUpperCase()})}
            className="bg-white border border-black/30 p-2 outline-none focus:border-black uppercase"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] opacity-50 mb-1 uppercase">PREVIEW_IMAGE (OPTIONAL)</label>
        <div className="flex gap-4 items-center">
          {formData.imageUrl && (
            <img src={formData.imageUrl} className="w-16 h-16 object-cover border border-black/10 grayscale" alt="archive preview" />
          )}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="border border-black/30 px-3 py-1 text-[10px] hover:bg-black hover:text-white transition-colors uppercase font-bold"
          >
            [ {formData.imageUrl ? 'CHANGE_IMAGE' : 'SELECT_IMAGE'} ]
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          {formData.imageUrl && (
            <button 
              type="button" 
              onClick={() => setFormData({...formData, imageUrl: ''})}
              className="text-[9px] opacity-40 hover:opacity-100 uppercase underline"
            >
              REMOVE_IMAGE
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <button 
          type="submit"
          className="flex-grow py-3 bg-black text-white font-bold uppercase hover:bg-transparent hover:text-black border border-black transition-all"
        >
          [ {item.id ? 'UPDATE_ARCHIVE_RECORD' : 'COMMIT_ARCHIVE_RECORD'} ]
        </button>
        <button 
          type="button"
          onClick={onCancel} 
          className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors uppercase font-bold"
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
    const limit = 5 * 1024 * 1024;
    const percent = Math.min(100, (usage / limit) * 100);
    setStorageUsage(`${percent.toFixed(1)}%`);
  }, [state]);

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(siteTitle, tagline);
    alert("SYSTEM_CONFIG_UPDATED: REBOOT_NOT_REQUIRED");
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-12 font-mono pb-32 text-black">
      {/* Header section */}
      <div className="border-b border-black pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black">CONTROL_CENTER_V2</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">ADMIN_USER: AUTHENTICATED</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] opacity-30 uppercase">STORAGE_LOAD:</span>
              <div className="w-24 h-1 border border-black/10 bg-gray-100 overflow-hidden">
                <div className="h-full bg-black transition-all duration-500" style={{ width: storageUsage }}></div>
              </div>
              <span className="text-[9px] font-bold">{storageUsage}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setActiveTab('PROJECTS'); setNewProjectForm(true); setEditingProjectId(null); window.scrollTo(0,0); }}
            className="bg-black text-white px-4 py-2 font-bold text-[10px] uppercase hover:invert transition-all"
          >
            + NEW_PROJECT
          </button>
          <button 
            onClick={() => { setActiveTab('ARCHIVE'); setNewArchiveForm(true); setEditingArchiveId(null); window.scrollTo(0,0); }}
            className="border border-black text-black px-4 py-2 font-bold text-[10px] uppercase hover:bg-black hover:text-white transition-all"
          >
            + NEW_ARCHIVE
          </button>
        </div>
      </div>

      {/* Tabs section */}
      <div className="flex gap-8 mb-8 border-b border-black/10 pb-2">
        <button onClick={() => setActiveTab('PROJECTS')} className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'PROJECTS' ? 'underline decoration-2 underline-offset-8' : 'opacity-40 hover:opacity-100'}`}>[ PROJECTS ]</button>
        <button onClick={() => setActiveTab('ARCHIVE')} className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'ARCHIVE' ? 'underline decoration-2 underline-offset-8' : 'opacity-40 hover:opacity-100'}`}>[ ARCHIVE ]</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'SETTINGS' ? 'underline decoration-2 underline-offset-8' : 'opacity-40 hover:opacity-100'}`}>[ SETTINGS ]</button>
      </div>

      <div className="space-y-8">
        {/* Projects Tab */}
        {activeTab === 'PROJECTS' && (
          <>
            {newProjectForm && (
              <div className="border-2 border-black p-2 mb-8 bg-gray-50">
                <ProjectForm 
                  project={{ id: `ODM-PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`, title: '', category: Category.BRANDING, client: '', date: new Date().toISOString().split('T')[0], status: 'IN_PROGRESS', imageUrls: [], description: '' }} 
                  onSave={(p) => { addProject(p); setNewProjectForm(false); }}
                  onCancel={() => setNewProjectForm(false)}
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs uppercase text-black">
                <thead>
                  <tr className="border-b border-black text-[10px] opacity-40 font-bold">
                    <th className="py-4 px-2">ID_REF</th>
                    <th className="py-4 px-2">TITLE</th>
                    <th className="py-4 px-2">CATEGORY</th>
                    <th className="py-4 px-2">STATUS</th>
                    <th className="py-4 px-2 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {state.projects.map(project => (
                    <React.Fragment key={project.id}>
                      {editingProjectId === project.id ? (
                        <tr><td colSpan={5} className="py-8 px-2"><ProjectForm project={project} onSave={(p) => { updateProject(project.id, p); setEditingProjectId(null); }} onCancel={() => setEditingProjectId(null)} /></td></tr>
                      ) : (
                        <tr className="border-b border-black/5 hover:bg-gray-50 transition-colors group">
                          <td className="py-6 px-2 opacity-50">{project.id}</td>
                          <td className="py-6 px-2 font-bold">{project.title}</td>
                          <td className="py-6 px-2 opacity-50 italic">[{project.category}]</td>
                          <td className="py-6 px-2"><span className={`px-2 py-0.5 font-black text-[10px] ${project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : project.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>{project.status}</span></td>
                          <td className="py-6 px-2 text-right space-x-4"><button onClick={() => setEditingProjectId(project.id)} className="underline opacity-40 hover:opacity-100 font-bold">EDIT</button><button onClick={() => deleteProject(project.id)} className="underline opacity-40 hover:text-red-500 font-bold">DELETE</button></td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Archive Tab (Newly Fully Implemented) */}
        {activeTab === 'ARCHIVE' && (
          <>
            {newArchiveForm && (
              <div className="border-2 border-black p-2 mb-8 bg-gray-50">
                <ArchiveForm 
                  item={{ id: Date.now().toString() }} 
                  onSave={(item) => { addArchiveItem(item); setNewArchiveForm(false); }}
                  onCancel={() => setNewArchiveForm(false)}
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs uppercase text-black">
                <thead>
                  <tr className="border-b border-black text-[10px] opacity-40 font-bold">
                    <th className="py-4 px-2">STAMP</th>
                    <th className="py-4 px-2">COMPANY_ID</th>
                    <th className="py-4 px-2">CATEGORY</th>
                    <th className="py-4 px-2">SUMMARY</th>
                    <th className="py-4 px-2 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.archiveItems || []).map(item => (
                    <React.Fragment key={item.id}>
                      {editingArchiveId === item.id ? (
                        <tr><td colSpan={5} className="py-8 px-2"><ArchiveForm item={item} onSave={(updated) => { updateArchiveItem(item.id, updated); setEditingArchiveId(null); }} onCancel={() => setEditingArchiveId(null)} /></td></tr>
                      ) : (
                        <tr className="border-b border-black/5 hover:bg-gray-50 transition-colors group">
                          <td className="py-6 px-2 opacity-50 font-bold">{item.year}</td>
                          <td className="py-6 px-2 font-black">{item.company}</td>
                          <td className="py-6 px-2 opacity-50 italic">{item.category}</td>
                          <td className="py-6 px-2 opacity-70 truncate max-w-[200px]">{item.project}</td>
                          <td className="py-6 px-2 text-right space-x-4">
                            <button onClick={() => setEditingArchiveId(item.id)} className="underline opacity-40 hover:opacity-100 font-bold">EDIT</button>
                            <button onClick={() => deleteArchiveItem(item.id)} className="underline opacity-40 hover:text-red-500 font-bold">DELETE</button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-xl animate-in fade-in">
            <form onSubmit={handleSettingsSave} className="space-y-6 border border-black/10 p-8 bg-gray-50/50">
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-bold mb-2 uppercase tracking-widest">SITE_TITLE</label>
                <input value={siteTitle} onChange={e => setSiteTitle(e.target.value.toUpperCase())} className="bg-white border border-black/20 p-3 text-sm outline-none focus:border-black uppercase font-bold" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] opacity-40 font-bold mb-2 uppercase tracking-widest">SITE_TAGLINE</label>
                <textarea rows={4} value={tagline} onChange={e => setTagline(e.target.value.toUpperCase())} className="bg-white border border-black/20 p-3 text-xs outline-none focus:border-black uppercase resize-none leading-relaxed" />
              </div>
              <button type="submit" className="w-full py-4 bg-black text-white font-black text-xs uppercase hover:invert border border-black tracking-widest">[ PERSIST_CONFIG ]</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
