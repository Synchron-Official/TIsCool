import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { fetchCalendarEvents } from '../services/api';
import { motion } from 'framer-motion';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load events for the month/week
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const start = startOfWeek(currentDate); // Expanded range could be logic here
        const end = addDays(start, 30); 
        const data = await fetchCalendarEvents(start, end);
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [currentDate]);

  // Group events by date
  // events is array of { info: {date...}, items: [] }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold dark:text-white text-zinc-900">Synchron Calendar</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setCurrentDate(d => addDays(d, -7))}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 font-medium bg-zinc-100 dark:bg-zinc-900 rounded-lg dark:text-white">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <button 
                onClick={() => setCurrentDate(d => addDays(d, 7))}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading events...</div>
      ) : (
        <div className="grid gap-6">
          {events.length === 0 && (
             <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <CalIcon size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                <p className="text-zinc-500">No events found for this range.</p>
             </div>
          )}

          {events.map((dayGroup, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               key={dayGroup.info.date} 
               className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm"
             >
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center min-w-[60px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                        <span className="text-sm font-bold uppercase text-blue-500">
                            {format(new Date(dayGroup.info.date), 'EEE')}
                        </span>
                        <span className="text-2xl font-bold dark:text-white">
                            {format(new Date(dayGroup.info.date), 'd')}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            <span>Term {dayGroup.info.term}</span>
                            <span>•</span>
                            <span>Week {dayGroup.info.week}{dayGroup.info.weekType}</span>
                        </div>

                        {dayGroup.items.map((event, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className={`w-1 h-10 rounded-full ${
                                    event.type === 'assessment' ? 'bg-red-500' :
                                    event.type === 'school' ? 'bg-blue-500' : 'bg-emerald-500'
                                }`}></div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {event.title}
                                    </h4>
                                    <p className="text-sm text-zinc-500">
                                        {event.subject || event.type} {event.time && `• ${event.time}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
