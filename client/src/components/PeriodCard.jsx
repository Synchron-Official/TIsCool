import React, { useState } from 'react';
import { MapPin, User as UserIcon, Coffee, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const PeriodCard = ({ period, bell, isCurrent, isNext, routineIndex, currentMinutes, startMinutes, endMinutes }) => {
  const { title, room, fullTeacher } = period;
  const { time, endTime } = bell;
  const [partyMode, setPartyMode] = useState(false);

  // Calculate Progress
  const progress = isCurrent && startMinutes && endMinutes 
      ? Math.min(100, Math.max(0, ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100))
      : 0;

  // Recess/Lunch Break Cards - Minimalist Text Only (No Box)
  if (bell.bell === "R" || bell.bell === "L") {
     const Icon = bell.bell === "R" ? Coffee : Utensils;
     return (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: routineIndex * 0.05 }}
           className={`flex items-center justify-center gap-3 py-2 text-xs uppercase tracking-widest select-none ${
             isCurrent 
               ? "text-blue-500 font-bold" 
               : "text-zinc-400 dark:text-zinc-600"
           }`}
        >
             <Icon size={14} className="opacity-80" />
             <span>{bell.bellDisplay}</span>
             <span className="opacity-20">•</span>
             <span className="font-mono opacity-60">{time} - {endTime}</span>
        </motion.div>
     );
  }

  // Class Period Cards - Compact Design
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
          opacity: 1, 
          y: 0, 
          rotate: partyMode ? [0, -5, 5, -5, 5, 0] : 0,
          scale: partyMode ? 1.02 : 1
      }}
      transition={{ delay: routineIndex * 0.05, type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.01 }}
      className={`relative group px-5 py-3 rounded-xl border transition-all duration-300 overflow-hidden ${
        isCurrent 
          ? "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm" 
          : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700"
      } ${
         isNext ? "bg-zinc-50/50 dark:bg-zinc-900/60" : ""
      }`}
    >
       {/* Progress Bar Background (Active Only) */}
       {isCurrent && (
         <div className="absolute bottom-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full" />
       )}
       {/* Progress Bar Fill (Active Only) */}
       {isCurrent && (
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-blue-500 z-10"
         />
       )}

       {/* Active Indicator Line */}
       {isCurrent && (
         <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full" />
       )}

      <div className="flex items-center justify-between relative z-20">
        <div className="flex-1 min-w-0 pr-4"> 
           <div className="flex items-baseline gap-2.5 mb-1.5">
             <span 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setPartyMode(!partyMode); 
                }}
                className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 hover:text-blue-500 transition-colors"
                title="Don't click me..."
             >
               P{bell.bell}
             </span>
             <h3 className={`text-base font-semibold truncate ${isCurrent ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
               {title || "Free Period"} {partyMode && "🎉"}
             </h3>
           </div>
           
           <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
               {room && (
                    <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="shrink-0 opacity-70" />
                        <span className="truncate layout-compact-room">{room}</span>
                    </div>
               )}
                
               {fullTeacher && (
                     <div className="flex items-center gap-1.5 min-w-0">
                        <UserIcon size={12} className="shrink-0 opacity-70" />
                        <span className="truncate layout-compact-teacher">{fullTeacher}</span>
                    </div>
                )}
           </div>
        </div>

        {/* Time Badge / Next Indicator */}
        <div className="flex flex-col items-end gap-1">
            <div className={`shrink-0 px-2.5 py-1 rounded-md font-mono text-xs whitespace-nowrap ${
                isCurrent 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : isNext
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500'
                }`}>
                {isNext ? "Next Up" : time}
            </div>
            {isNext && <span className="text-[10px] text-zinc-400 font-mono">{time}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default PeriodCard;