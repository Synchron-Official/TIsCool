import React from 'react';
import { User, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/50 sticky top-0 z-50">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
          Synchron
        </h1>
        <span className="text-sm text-zinc-500 mt-1">
           {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-1 py-1 pr-4 bg-zinc-900 rounded-full border border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
               <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-200 leading-none">
                {user.givenName}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                Year {user.yearGroup}
              </span>
            </div>
          </div>
          <button 
             onClick={onLogout}
             className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all" 
             title="Logout"
          >
              <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
