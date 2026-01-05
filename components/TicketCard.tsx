
import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';

interface TicketCardProps {
  project: Project;
}

const TicketCard: React.FC<TicketCardProps> = ({ project }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = project.imageUrls && project.imageUrls.length > 1;
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!project.imageUrls) return;
    setImgIndex((prev) => (prev + 1) % project.imageUrls.length);
  };

  const prevImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!project.imageUrls) return;
    setImgIndex((prev) => (prev - 1 + project.imageUrls.length) % project.imageUrls.length);
  };

  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      timeoutRef.current = setInterval(() => {
        nextImg();
      }, 2500);
    } else {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [isHovered, hasMultipleImages]);

  return (
    <div 
      className="group relative border border-black/10 p-4 hover:border-black transition-all flex flex-col gap-3 overflow-hidden bg-gray-50/50 backdrop-blur-sm shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Receipt Punch Holes */}
      <div className="absolute top-1/2 -left-2.5 w-3 h-3 bg-white border border-black/10 rounded-full -translate-y-1/2 z-20"></div>
      <div className="absolute top-1/2 -right-2.5 w-3 h-3 bg-white border border-black/10 rounded-full -translate-y-1/2 z-20"></div>
      
      {/* Header Info */}
      <div className="flex justify-between items-start text-[7px] text-black/40 font-mono font-black uppercase tracking-widest">
        <span className="bg-black/5 px-1">UID: {project.id}</span>
        <span>CAT: [{project.category}]</span>
      </div>

      {/* Slider Container */}
      <div className="aspect-[16/10] bg-black/[0.02] overflow-hidden border border-black/5 relative cursor-pointer group/slider">
        <div 
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transform: `translateX(-${imgIndex * 100}%)` }}
        >
          {project.imageUrls?.map((url, idx) => (
            <div key={idx} className="min-w-full h-full">
              <img 
                src={url || 'https://via.placeholder.com/600x400?text=ASSET_NULL'} 
                alt={`${project.title} - ${idx}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
              />
            </div>
          ))}
          {(!project.imageUrls || project.imageUrls.length === 0) && (
            <div className="min-w-full h-full flex items-center justify-center bg-black/5 text-[8px] opacity-10">
              NO_VISUAL_ASSETS
            </div>
          )}
        </div>

        {/* Slider Controls */}
        {hasMultipleImages && (
          <>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover/slider:opacity-100 transition-opacity z-10">
              <button 
                onClick={prevImg} 
                className="w-6 h-6 bg-white border border-black/20 text-black hover:bg-black hover:text-white flex items-center justify-center text-[10px] font-bold"
              >
                &lt;
              </button>
              <button 
                onClick={nextImg} 
                className="w-6 h-6 bg-white border border-black/20 text-black hover:bg-black hover:text-white flex items-center justify-center text-[10px] font-bold"
              >
                &gt;
              </button>
            </div>
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {project.imageUrls.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-[1px] transition-all duration-300 ${idx === imgIndex ? 'w-4 bg-black' : 'w-2 bg-black/10'}`}
                />
              ))}
            </div>

            <div className="absolute top-2 right-2 bg-black text-white border border-black px-1 py-0.5 text-[6px] font-black font-mono shadow-md uppercase z-10">
              IMG_REF: {imgIndex + 1}/{project.imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Project Details */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[9px] font-black italic uppercase tracking-tighter leading-none transition-all font-mono underline decoration-black/10 group-hover:bg-black group-hover:text-white w-fit p-1 -ml-1">
          {project.title}
        </h3>
        <span className="text-[7px] text-black/40 font-mono tracking-widest font-bold uppercase">
          {project.date?.replace(/-/g, '.') || '0000.00.00'}
        </span>
      </div>

      <div className="mt-auto border-t border-dashed border-black/10 pt-3 flex flex-col gap-2">
        <p className="text-[8px] leading-relaxed line-clamp-2 uppercase opacity-60 font-mono tracking-tight font-medium">
          {project.description}
        </p>
        <div className="flex justify-between items-end text-[7px] font-mono font-bold uppercase">
          <div className="flex flex-col">
            <span className="opacity-15">CLIENT_ID:</span>
            <span className="text-black/60 tracking-widest">{project.client}</span>
          </div>
          <span className={`px-1 py-0.5 ${project.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-black animate-pulse' : 'bg-black/10 text-black/40'}`}>
            [{project.status}]
          </span>
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
};

export default TicketCard;