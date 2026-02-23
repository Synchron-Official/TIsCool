import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Shield } from 'lucide-react';
import { performLogin } from '../services/api';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm mb-8 backdrop-blur-sm shadow-sm">
             <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Synchron v2
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
            Your School Day. <br />
            <span className="text-zinc-500 dark:text-zinc-500">Reimagined.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience a fast fluid, intuitive way to manage your timetable, track daily notices, and stay organised at Sydney Boys High School. Also check out NoteFlow.
        
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={performLogin}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-lg font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xl shadow-zinc-900/10 dark:shadow-white/10"
          >
            Sign in to Synchron
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20"
        >
           <FeatureCard 
             icon={<Clock size={24} />}
             title="Smart Timetable"
             desc="Live tracking of your current and upcoming classes with room changes."
           />
           <FeatureCard 
             icon={<Shield size={24} />}
             title="Daily Briefings"
             desc="Instantly access daily notices filtered for your year group."
           />
           <FeatureCard 
             icon={<Calendar size={24} />}
             title="Calendar Sync"
             desc="Seamless integration with your school calendar events."
           />
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:bg-zinc-900 transition-all text-left backdrop-blur-sm">
    <div className="mb-4 text-zinc-900 dark:text-zinc-100 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl inline-block">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200 mb-2">{title}</h3>
    <p className="text-zinc-600 dark:text-zinc-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default LandingPage;
