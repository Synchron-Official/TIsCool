import React from 'react';
import { MapPin, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const PeriodCard = ({ period, bell, isCurrent, isNext, routineIndex, currentMinutes, startMinutes, endMinutes }) => {
  const { title, room, fullTeacher } = period;
  const { time, endTime } = bell;

  // Progress logic
  const progress = isCurrent && startMinutes && endMinutes 
      ? Math.min(100, Math.max(0, ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100))
      : 0;
  
  // Format period label
  const periodLabel = bell.bell;

  // Variant for Breaks: "Divider" style
  if (bell.bell === "R" || bell.bell === "L") {
     return (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: routineIndex * 0.05 }}
           className="relative flex items-center justify-center py-6"
        >
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest px-4 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500">
                {bell.bellDisplay}
            </div>
        </motion.div>
     );
  }

  // Variant for Classes
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: routineIndex * 0.05 }}
      className="relative"
    >
       <div className={`
          relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
          ${isCurrent 
            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm scale-[1.02] z-10" 
            : "bg-white dark:bg-transparent border-transparent text-zinc-600 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50" 
          }
       `}>
          
          {/* Active Status Background Blur */}
          {isCurrent && (
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
          )}

          {/* Left: Time & Period */}
          <div className="flex items-center gap-4 z-10 flex-1 min-w-0">
             <div className={`
                flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold shrink-0
                ${isCurrent 
                   ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                   : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-500"
                }
             `}>
                {periodLabel}
             </div>

             <div className="flex flex-col min-w-0">
                <h3 className={`text-base font-semibold truncate ${isCurrent ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'}`}>
                   {title || "Free Period"}
                </h3>
                
                {/* Details Row */}
                <div className="flex items-center gap-x-3 text-xs mt-1 truncate">
                   <span className="font-mono opacity-80">{time}</span>
                   
                   {(room || fullTeacher) && (
                       <>
                           <span className="opacity-20">|</span>
                           {room && (
                                <span className={`flex items-center gap-1 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                                    <MapPin size={11} /> {room}
                                </span>
                           )}
                           {fullTeacher && isCurrent && (
                                <span className="flex items-center gap-1 opacity-80 truncate hidden sm:flex">
                                    <UserIcon size={11} /> {fullTeacher}
                                </span>
                           )}
                       </>
                   )}
                </div>
             </div>
          </div>

          {/* Right: Next Indicator */}
          <div className="z-10 shrink-0 ml-4">
              {isNext && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900">
                      Next
                  </span>
              )}
          </div>
          
          {/* Progress Bar (Innovative: Integrated into border/bottom) */}
          {isCurrent && (
             <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-200 dark:bg-zinc-800 overflow-hidden rounded-full">
                <motion.div 
                   className="h-full bg-indigo-500 dark:bg-indigo-400"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ ease: "linear", duration: 1 }}
                />
             </div>
          )}

       </div>
    </motion.div>
  );
};

export default PeriodCard;