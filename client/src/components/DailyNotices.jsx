import React from 'react';
import { Megaphone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyNotices = ({ notices }) => {
  if (!notices || !notices.notices) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-zinc-950/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 p-0 h-fit sticky top-24 overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Megaphone size={18} />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Daily Briefing</h2>
        </div>
      </div>

      <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-2 custom-scrollbar">
        <div className="space-y-2 p-4">
            {notices.notices.map((notice, idx) => (
            <motion.div 
                key={idx} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-4 bg-white dark:bg-zinc-900/20 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            >
                <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors leading-snug">
                        {notice.title}
                    </h3>
                    {notice.isMeeting === 1 && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-500/20">
                            Meeting
                        </span>
                    )}
                </div>
                
                <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-none line-clamp-4 prose dark:prose-invert prose-p:my-0 prose-ul:my-0" 
                    dangerouslySetInnerHTML={{ __html: notice.content }} 
                />
                
                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">{notice.authorName}</span>
                    <span className="flex items-center gap-1 opacity-70">
                        <Calendar size={10} />
                        {notice.displayYears}
                    </span>
                </div>
            </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyNotices;
