import React from 'react';
import { LayoutGrid, CalendarDays, Newspaper, UserCircle, Settings } from 'lucide-react';

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left
      ${isActive 
        ? 'bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20' 
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
      }`}
  >
    <Icon size={20} />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const Navigation = ({ currentView, setView }) => {
  const items = [
    { id: 'timetable', icon: LayoutGrid, label: 'Timetable' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { id: 'notices', icon: Newspaper, label: 'Notices' },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:relative md:w-64 bg-white dark:bg-zinc-950 border-t md:border-r border-zinc-200 dark:border-zinc-900 md:h-screen z-40">
       <div className="flex md:flex-col justify-around md:justify-start md:gap-2 p-2 md:p-4 h-full">
         <div className="hidden md:flex items-center gap-3 px-4 py-4 mb-4">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                 <span className="text-white font-bold">S</span>
             </div>
             <span className="text-xl font-bold tracking-tight dark:text-white">SBHS</span>
         </div>

         {items.map(item => (
            <NavItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={currentView === item.id}
                onClick={() => setView(item.id)}
            />
         ))}
       </div>
    </nav>
  );
};

export default Navigation;
