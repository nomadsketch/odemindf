
import React from 'react';

const Barcode: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex gap-[1px] ${className}`}>
      {[...Array(24)].map((_, i) => (
        <div 
          key={i} 
          className="bg-black" 
          style={{ width: `${Math.floor(Math.random() * 3) + 1}px`, height: '100%' }}
        />
      ))}
    </div>
  );
};

export default Barcode;