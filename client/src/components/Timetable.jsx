import React, { useState, useEffect } from 'react';
import PeriodCard from './PeriodCard';
import { motion } from 'framer-motion';

const Timetable = ({ timetableData, showNow = true }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!timetableData || !timetableData.bells) {
    return <div className="p-8 text-center text-zinc-500">Loading timetable...</div>;
  }

  const { bells, timetable } = timetableData;
  // Handle both mock structure (nested) and potential flat structure
  const innerTimetable = timetable?.timetable || timetable;

  if (!innerTimetable || !innerTimetable.periods) {
       return <div className="p-8 text-center text-zinc-500">No timetable data available.</div>;
  }

  const { periods } = innerTimetable;
  const routine = innerTimetable.routine ? innerTimetable.routine.split(',') : [];
  
  // Helper to convert "HH:MM" to minutes from midnight
  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = showNow 
      ? currentTime.getHours() * 60 + currentTime.getMinutes()
      : -1;

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Daily Schedule</h2>
        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-zinc-200 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/50">
            {innerTimetable.dayname}
        </span>
      </div>

      <div className="space-y-4">
        {routine.map((bellId, index) => {
          const bell = bells.find(b => b.bell === bellId);
          if (!bell) return null;

          const periodInfo = periods[bellId] || { title: bell.bellDisplay }; 
          
          if (bellId === "R" || bellId === "L") {
             periodInfo.title = bell.bellDisplay; 
          }

          const startMin = getMinutes(bell.time);
          const endMin = bell.endTime ? getMinutes(bell.endTime) : startMin + 60; 

          const isCurrent = currentMinutes >= startMin && currentMinutes < endMin;
          const isNext = !isCurrent && currentMinutes !== -1 && currentMinutes < startMin && (index === 0 || currentMinutes >= getMinutes(routine[index-1] ? bells.find(b=>b.bell===routine[index-1])?.time || "00:00" : "00:00"));

          return (
            <PeriodCard 
              key={`${bellId}-${index}`}
              period={periodInfo}
              bell={bell}
              isCurrent={isCurrent}
              isNext={isNext}
              routineIndex={index}
              currentMinutes={currentMinutes}
              startMinutes={startMin}
              endMinutes={endMin}
            />
          );
        })}
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center pt-8 opacity-30"
        >
            <div className="h-1 w-20 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Timetable;
