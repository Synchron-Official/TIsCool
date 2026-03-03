import React from 'react';
import { RefreshCw, X } from 'lucide-react';

const VersionToast = ({ onUpdate, onClose }) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-500/50 backdrop-blur-md">
        <div className="bg-white/20 p-2 rounded-xl">
          <RefreshCw size={20} className="animate-spin-slow" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-none mb-1">New Update Available</p>
          <p className="text-xs text-blue-100 italic">Click update to sync with latest backend</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button 
            onClick={onUpdate}
            className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Update
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionToast;
