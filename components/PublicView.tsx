import React, { useState } from 'react';
import { AppState, Category, ArchiveItem } from '../types.ts';
import TicketCard from './TicketCard.tsx';
import Barcode from './Barcode.tsx';

interface PublicViewProps {
  state: AppState;
}

type ViewType = 'HOME' | 'CONTENT' | 'SERVICES' | 'CONTACT';
type FormStatus = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';

const PublicView: React.FC<PublicViewProps> = ({ state }) => {
  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [formStatus, setFormStatus] = useState<FormStatus>('IDLE');
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(null);
  const [hoveredArchive, setHoveredArchive] = useState<ArchiveItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const categories = Object.values(Category);
  const instagramUrl = "https://www.instagram.com/onedayearly.mind/?igsh=dHJobnplYTR2bmt3&utm_source=qr#";

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('SUBMITTING');
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/xbdlpppr", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setFormStatus('SUCCESS');
      } else {
        setFormStatus('ERROR');
      }
    } catch (error) {
      setFormStatus('ERROR');
    }
  };

  const resetFormAndGoHome = () => {
    setFormStatus('IDLE');
    setCurrentView('HOME');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleArchiveClick = (item: ArchiveItem) => {
    if (item.imageUrl) {
      setSelectedArchive(item);
    }
  };

  const renderHome = () => (
    <div className="animate-in fade-in duration-500 relative">
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-6 border-r border-black flex flex-col justify-center min-h-[400px]">
          <div className="text-[9px] opacity-30 mb-4 font-bold uppercase tracking-widest font-mono underline decoration-black/10">SYS_OVERVIEW_LOG_V2.2</div>
          <h2 className="text-sm font-black italic uppercase leading-none mb-4 font-mono tracking-tighter text-black">{state.siteTitle || 'ONE DAY EARLY'}</h2>
          <p className="text-[9px] leading-relaxed opacity-60 uppercase font-mono max-w-sm text-black">
            {state.tagline}
          </p>
          <div className="mt-8 flex gap-3">
            <button onClick={() => setCurrentView('CONTENT')} className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase border border-black transition-all font-mono hover:bg-transparent hover:text-black">
              [ ACCESS_DATABASE ]
            </button>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
          <div className="absolute top-0 right-8 bottom-0 w-[1px] bg-black/5 border-r border-dashed border-black/10"></div>
          <div className="flex justify-between items-start z-10">
            <div className="text-[8px] font-bold opacity-30 font-mono tracking-widest uppercase text-black">NODE_STATUS: STABLE</div>
            <div className="text-right font-mono">
              <div className="text-2xl font-black italic leading-none opacity-80 group-hover:opacity-100 transition-opacity text-black">100%</div>
              <div className="text-[7px] opacity-40 uppercase font-mono tracking-[0.2em] text-black">RELIABILITY</div>
            </div>
          </div>
          <div className="space-y-2 font-mono text-[8px] z-10 max-w-xs text-black">
            <div className="flex justify-between border-b border-black/10 pb-1 uppercase">
              <span className="opacity-40">RECORDS_ARCHIVED:</span>
              <span className="font-bold">{state.projects.length + (state.archiveItems?.length || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-1 uppercase">
              <span className="opacity-40">STATION_REF:</span>
              <span className="font-bold">SEOUL_HQ</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-1 uppercase">
              <span className="opacity-40">ENCRYPTION:</span>
              <span className="font-bold">AES_256</span>
            </div>
          </div>
          <div className="flex justify-between items-end z-10">
            <Barcode className="h-5 opacity-40" />
            <div className="text-[7px] opacity-10 font-bold tracking-[0.5em] vertical-rl uppercase text-black">ODM_TERMINAL_V2</div>
          </div>
        </div>
      </section>
      
      <section className="p-6 border-b border-black bg-white">
        <div className="flex justify-between items-center mb-6">
           <div className="text-[9px] opacity-30 font-bold uppercase underline font-mono tracking-widest text-black">RECENT_TRANSMISSIONS</div>
           <div className="text-[7px] opacity-15 font-mono uppercase text-black">ID: {new Date().getTime()}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.slice(0, 3).map(project => (
            <TicketCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="p-6 bg-white relative" onMouseMove={handleMouseMove}>
        <div className="text-[9px] opacity-30 mb-6 font-bold uppercase underline font-mono tracking-widest text-black">TRANSMISSION_HISTORY_LOG</div>
        
        {hoveredArchive && hoveredArchive.imageUrl && !selectedArchive && (
          <div 
            className="fixed z-50 pointer-events-none animate-in fade-in duration-200 border border-black/20 bg-white/80 backdrop-blur-sm"
            style={{ 
              left: Math.min(mousePos.x + 20, window.innerWidth - 180), 
              top: Math.min(mousePos.y - 100, window.innerHeight - 220),
              width: '150px'
            }}
          >
            <img src={hoveredArchive.imageUrl} className="w-full grayscale brightness-75" />
          </div>
        )}

        <div className="overflow-x-auto border border-black/10 p-4 bg-gray-50/20">
          <table className="w-full text-left font-mono text-[8px] border-collapse text-black">
            <thead>
              <tr className="border-b border-black/30 text-black/30 font-bold uppercase">
                <th className="py-2 pr-4 tracking-tighter">YEAR_STAMP</th>
                <th className="py-2 pr-4 tracking-tighter">COMPANY_ID</th>
                <th className="py-2 pr-4 tracking-tighter">TYPE_CAT</th>
                <th className="py-2 tracking-tighter">PROJECT_REF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {(state.archiveItems || []).map((item) => (
                <tr 
                  key={item.id} 
                  className={`transition-colors group cursor-pointer ${selectedArchive?.id === item.id ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  onMouseEnter={() => setHoveredArchive(item)}
                  onMouseLeave={() => setHoveredArchive(null)}
                  onClick={() => handleArchiveClick(item)}
                >
                  <td className={`py-2.5 pr-4 font-bold ${selectedArchive?.id === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>{item.year}</td>
                  <td className="py-2.5 pr-4 font-black uppercase tracking-tighter">{item.company}</td>
                  <td className={`py-2.5 pr-4 italic ${selectedArchive?.id === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>[{item.category}]</td>
                  <td className={`py-2.5 tracking-tight ${selectedArchive?.id === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>{item.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 pt-4 border-t border-black/10 flex justify-between items-center opacity-20">
             <span className="text-[7px] font-bold tracking-[0.6em] uppercase text-black">--- EOF DATA_STREAM ---</span>
             <Barcode className="h-3" />
          </div>
        </div>

        {selectedArchive && (
          <div 
            className="fixed right-6 top-[20%] z-[60] w-[320px] bg-white border border-black shadow-2xl animate-in slide-in-from-right-10 duration-500"
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-black bg-black text-white">
              <span className="text-[10px] font-black italic tracking-tighter uppercase">{selectedArchive.company}</span>
              <button 
                onClick={() => setSelectedArchive(null)}
                className="text-[10px] font-bold hover:scale-125 transition-transform px-1"
              >
                ✕
              </button>
            </div>
            <div className="p-1">
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img 
                  src={selectedArchive.imageUrl} 
                  alt={selectedArchive.company}
                  className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
                />
              </div>
            </div>
            <div className="p-4 bg-white border-t border-black/10 text-black">
              <div className="text-[7px] opacity-30 uppercase font-bold tracking-widest mb-1">PROJECT_ARCHIVE_DATA:</div>
              <div className="text-[10px] font-black italic uppercase tracking-tighter mb-4 leading-tight">{selectedArchive.project}</div>
              <div className="flex justify-between items-end">
                <div className="text-[7px] opacity-40 uppercase font-mono">
                  CAT: {selectedArchive.category}<br/>
                  STAMP: {selectedArchive.year}
                </div>
                <Barcode className="h-3 opacity-30" />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderContent = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500 p-4 md:p-6 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-black pb-6 gap-6">
        <div>
          <h2 className="text-xs font-black italic tracking-tighter uppercase font-mono text-black">CONTENT_DATABASE</h2>
          <p className="text-[8px] opacity-40 uppercase font-mono mt-1 tracking-widest text-black">ACCESSING ARCHIVE NODES...</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button key={cat} className="text-[8px] border border-black/20 px-2 py-0.5 hover:bg-black hover:text-white transition-all uppercase font-mono font-bold tracking-widest text-black">
              [{cat}]
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.projects.map(project => (
          <TicketCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="animate-in slide-in-from-right-4 duration-500 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">
        {state.services.map((service, idx) => (
          <div key={service.id} className={`p-10 border-black group hover:bg-black hover:text-white transition-all flex flex-col justify-between min-h-[350px] ${idx % 2 === 0 ? 'lg:border-r' : ''} border-b relative overflow-hidden text-black`}>
            <div className="absolute -bottom-6 -right-3 text-[120px] font-black italic opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none font-mono text-black">
              {service.number}
            </div>
            <div className="z-10">
              <div className="text-[9px] mb-8 font-bold font-mono uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100">NODE_{service.number}</div>
              <h2 className="text-xs font-black mb-4 uppercase italic font-mono tracking-tighter">{service.title}</h2>
              <p className="text-[9px] leading-relaxed opacity-60 group-hover:opacity-100 max-w-xs uppercase font-mono font-medium tracking-tight">
                {service.description}
              </p>
            </div>
            <div className="mt-10 flex justify-between items-end z-10 text-[8px] font-bold opacity-20 group-hover:opacity-40 font-mono italic uppercase">
               <span>[{service.id}]</span>
               <span className="tracking-widest">{idx + 1}/04</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="animate-in zoom-in-95 duration-500 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black min-h-[60vh]">
        <div className="p-8 md:p-10 border-r border-black flex flex-col justify-between text-black">
          <div className="space-y-12">
            <div>
              <div className="text-[8px] opacity-30 mb-4 uppercase font-bold tracking-widest underline font-mono">EMAIL_GATEWAY</div>
              <a href="mailto:info@odemind.co.kr" className="text-sm font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all px-1 -ml-1 underline decoration-dashed font-mono italic">info@odemind.co.kr</a>
            </div>
            <div>
              <div className="text-[8px] opacity-30 mb-4 uppercase font-bold tracking-widest underline font-mono">COORDINATES</div>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Seodaemun-gu+Seoul+Korea" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-black uppercase italic hover:bg-black hover:text-white transition-all px-1 -ml-1 underline decoration-solid block font-mono tracking-tighter mb-4"
              >
                SEOUL_KOR / SEODAEMUN-GU
              </a>
              <Barcode className="h-3 opacity-20" />
            </div>
          </div>
          <div className="mt-16 flex flex-wrap gap-6 font-mono font-black text-[9px]">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="border-b border-black/40 hover:opacity-50 uppercase tracking-widest transition-opacity italic">INSTAGRAM</a>
            <a href="#" className="border-b border-black/40 hover:opacity-50 uppercase tracking-widest italic">VIMEO</a>
            <a href="#" className="border-b border-black/40 hover:opacity-50 uppercase tracking-widest italic">PINTEREST</a>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-gray-50 border-l border-black/5 text-black">
          {formStatus === 'SUCCESS' ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 font-mono">
              <div className="text-[40px] font-black italic mb-4 opacity-80 leading-none">SUCCESS</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.4em] mb-8 border-y border-black/20 py-2">
                DATA_TRANSMITTED_SUCCESSFULLY
              </div>
              <p className="text-[8px] opacity-60 uppercase max-w-[200px] mb-12">
                YOUR LOG HAS BEEN SECURELY RECORDED IN OUR SYSTEMS. A RESPONSE WILL BE INITIATED SHORTLY.
              </p>
              <button 
                onClick={resetFormAndGoHome}
                className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:invert transition-all border border-black"
              >
                [ RETURN_TO_HOME ]
              </button>
              <Barcode className="h-4 opacity-20 mt-12" />
            </div>
          ) : (
            <>
              <div className="text-[9px] opacity-30 uppercase tracking-[0.4em] font-bold underline mb-10 font-mono text-center">INPUT_TERMINAL_V2</div>
              <form onSubmit={handleFormSubmit} className="space-y-6 max-w-xs mx-auto">
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="USER_IDENT" 
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full bg-transparent border border-black/10 focus:border-black p-2.5 text-[9px] outline-none uppercase placeholder:opacity-20 transition-all font-mono tracking-widest disabled:opacity-30"
                />
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="RETURN_ADDR" 
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full bg-transparent border border-black/10 focus:border-black p-2.5 text-[9px] outline-none uppercase placeholder:opacity-20 transition-all font-mono tracking-widest disabled:opacity-30"
                />
                <select 
                  name="subject" 
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full bg-white border border-black/10 focus:border-black p-2.5 text-[9px] outline-none uppercase cursor-pointer font-mono font-bold tracking-widest disabled:opacity-30"
                >
                  <option value="content">TYPE: CONTENT</option>
                  <option value="branding">TYPE: BRANDING</option>
                  <option value="space">TYPE: SPACE</option>
                  <option value="film">TYPE: FILM</option>
                </select>
                <textarea 
                  name="message" 
                  rows={4} 
                  required 
                  placeholder="DESC_PARAMS..." 
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full bg-transparent border border-black/10 focus:border-black p-2.5 text-[9px] outline-none uppercase placeholder:opacity-20 transition-all resize-none font-mono tracking-widest leading-relaxed disabled:opacity-30"
                />
                <button 
                  type="submit" 
                  disabled={formStatus === 'SUBMITTING'}
                  className="w-full py-3.5 bg-black text-white font-black uppercase tracking-[0.3em] text-[9px] hover:invert border border-black transition-all font-mono disabled:opacity-50"
                >
                  {formStatus === 'SUBMITTING' ? '[ TRANSMITTING... ]' : '[ TRANSMIT_LOG ]'}
                </button>
                {formStatus === 'ERROR' && (
                  <p className="text-red-500 text-[8px] text-center font-bold tracking-widest">ERROR: TRANSMISSION_FAILED</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto min-h-screen border-x border-black/10 flex flex-col selection:bg-black selection:text-white bg-white text-black">
      <header className="border-b border-black sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-4 border-b md:border-b-0 md:border-r border-black flex flex-col justify-between">
            <div className="text-[8px] text-black/40 uppercase tracking-tighter font-mono font-bold underline decoration-black/5 uppercase">SYS_REF: ODM_LOG_01</div>
            <div className="text-[8px] mt-2 font-mono font-black tracking-widest uppercase">EST. 2004 / SEOUL_KR</div>
          </div>
          <div className="p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black">
            <button onClick={() => setCurrentView('HOME')} className="group text-center">
              <h1 className="text-base font-black tracking-tighter italic mb-0.5 group-hover:scale-105 transition-transform font-mono uppercase leading-none text-black">{state.siteTitle || 'ODEMIND'}</h1>
              <p className="text-[7px] tracking-[0.4em] opacity-30 uppercase font-mono font-bold group-hover:opacity-100 transition-opacity text-black">{state.tagline?.substring(0, 40)}...</p>
            </button>
          </div>
          <div className="p-4 flex flex-col justify-between items-end">
            <Barcode className="h-5 hidden md:flex opacity-30" />
            <nav className="flex gap-4 text-[9px] uppercase font-black font-mono tracking-widest">
              <button onClick={() => setCurrentView('CONTENT')} className={`${currentView === 'CONTENT' ? 'line-through opacity-100' : 'opacity-30 hover:opacity-100'}`}>[ CONTENT ]</button>
              <button onClick={() => setCurrentView('SERVICES')} className={`${currentView === 'SERVICES' ? 'line-through opacity-100' : 'opacity-30 hover:opacity-100'}`}>[ SERVICES ]</button>
              <button onClick={() => setCurrentView('CONTACT')} className={`${currentView === 'CONTACT' ? 'line-through opacity-100' : 'opacity-30 hover:opacity-100'}`}>[ CONTACT ]</button>
            </nav>
          </div>
        </div>
      </header>

      <section className="border-b border-black grid grid-cols-1 md:grid-cols-4 text-[7px] font-mono bg-gray-50 uppercase font-bold tracking-widest">
        <div className="p-2.5 border-b md:border-b-0 md:border-r border-black/10">
          <div className="opacity-40 mb-0.5 underline uppercase">VIEW_MOD:</div>
          <div className="text-[8px]">{currentView}</div>
        </div>
        <div className="p-2.5 border-b md:border-b-0 md:border-r border-black/10">
          <div className="opacity-40 mb-0.5 underline uppercase">COORDS:</div>
          <div className="text-[8px]">39.916°N 116.273°E</div>
        </div>
        <div className="p-2.5 border-b md:border-b-0 md:border-r border-black/10">
          <div className="opacity-40 mb-0.5 underline uppercase">TIMESTAMP:</div>
          <div className="text-[8px]">{new Date().toISOString().split('T')[0]}</div>
        </div>
        <div className="p-2.5 flex justify-between items-center">
          <div>
            <div className="opacity-40 mb-0.5 underline uppercase">SECURITY:</div>
            <div className="text-[8px]">AES_STABLE</div>
          </div>
          <div className="text-[6px] opacity-40 italic font-mono uppercase">[ VERIFIED ]</div>
        </div>
      </section>

      <main className="flex-grow font-mono bg-white">
        {currentView === 'HOME' && renderHome()}
        {currentView === 'CONTENT' && renderContent()}
        {currentView === 'SERVICES' && renderServices()}
        {currentView === 'CONTACT' && renderContact()}
      </main>

      <footer className="border-t border-black mt-auto bg-white font-mono text-black">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 border-b md:border-b-0 md:border-r border-black flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-[8px] mb-6 opacity-30 underline font-bold tracking-[0.3em] uppercase">DIRECT_INQUIRY</h3>
              <a href="mailto:info@odemind.co.kr" className="text-xs font-black uppercase tracking-tighter leading-none italic hover:bg-black hover:text-white p-1 -ml-1 transition-all inline-block underline decoration-dotted font-mono">INFO@ODEMIND.CO.KR</a>
              <p className="text-[9px] mt-8 opacity-60 uppercase leading-relaxed max-w-sm font-medium tracking-tight font-mono">{state.tagline}</p>
            </div>
            <div className="mt-10 flex items-center gap-6">
               <Barcode className="h-4 opacity-30" />
               <div className="text-[7px] opacity-30 uppercase tracking-[0.2em] font-bold border-l border-black/10 pl-4 font-mono uppercase">NODE: SEOUL_HQ<br/>GMT+9</div>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <h3 className="text-[8px] opacity-30 underline font-bold uppercase tracking-[0.3em]">SOCIAL_NODES</h3>
                <div className="flex flex-col gap-2.5 font-black text-[9px] font-mono">
                   <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:bg-black hover:text-white transition-all px-1 -ml-1 uppercase tracking-widest w-fit italic">INSTAGRAM_OFFICIAL</a>
                   <a href="#" className="hover:bg-black hover:text-white transition-all px-1 -ml-1 uppercase tracking-widest w-fit italic">VIMEO_TRANS</a>
                   <a href="#" className="hover:bg-black hover:text-white transition-all px-1 -ml-1 uppercase tracking-widest w-fit italic">PINTEREST_ARC</a>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[30px] font-black italic opacity-[0.05] leading-none tracking-tighter uppercase font-mono">{state.siteTitle || 'ODEMIND'}</div>
              </div>
            </div>
            <div className="mt-16 pt-4 border-t border-black/5 flex justify-between text-[7px] opacity-30 uppercase tracking-[0.3em] font-bold font-mono">
              <span>(C) 2004-2025 {state.siteTitle || 'ODEMIND'} ARCHIVE</span>
              <div className="flex gap-4"><span>V.2.4.0_PROD</span><span>ENC: AES</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicView;