import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import Timetable from './components/Timetable';
import CalendarView from './components/CalendarView';
import DailyNotices from './components/DailyNotices';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { 
  fetchDayTimetable, 
  fetchDailyNews, 
  fetchUserInfo, 
  isAuthenticated, 
  exchangeToken, 
  logout 
} from './services/api';
import { registerUser } from './services/adminApi';
import { format, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

function App() {
  // State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currentView, setCurrentView] = useState('timetable');
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    // Check if user is navigating exactly to /admin
    if (window.location.pathname === '/admin') {
        setCurrentView('admin');
    }
  }, []);
  
  const [timetable, setTimetable] = useState(null);
  const [notices, setNotices] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Theme Config
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Auth & Initial Data
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        window.history.replaceState({}, document.title, "/");
        try {
          await exchangeToken(code);
        } catch (err) {
            console.error(err);
            setAuthError("Failed to authenticate.");
            setLoading(false); 
            return;
        }
      }

      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const [noticesData, userData] = await Promise.all([
          fetchDailyNews(),
          fetchUserInfo()
        ]);
        setNotices(noticesData);
        setUser(userData);
        
        // Attempt to register/update user in Admin Panel in background
        if (userData && userData.studentId) {
            registerUser({
                id: userData.studentId,
                name: `${userData.givenName} ${userData.surname}`,
                email: userData.email, // SBHS API usually provides this in ID token, checking availability helps
                year: userData.yearGroup
            });
        }

      } catch (error) {
         console.error(error);
         if (error.message?.includes("401")) logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch Timetable when date changes
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    // Reset timetable while loading to show feedback if needed
    // or just let it update smoothly. 
    // setTimetable(null); // Optional: creates flicker but shows loading state
    
    const loadTimetable = async () => {
        try {
            const data = await fetchDayTimetable(viewDate);
            setTimetable(data);
        } catch (err) {
            console.error("Failed to fetch timetable", err);
        }
    };
    loadTimetable();
  }, [viewDate, user]); 

  // Date Navigation Helpers
  const nextDay = () => setViewDate(d => addDays(d, 1));
  const prevDay = () => setViewDate(d => addDays(d, -1));
  const resetToday = () => setViewDate(new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm">Loading SBHS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="transition-colors bg-white dark:bg-zinc-950">
            <LandingPage />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navigation currentView={currentView} setView={setCurrentView} />

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
         {/* Top Header */}
         <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white capitalize">
                {currentView}
            </h1>
            
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end">
                   <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.givenName} {user?.surname}</span>
                   <span className="text-xs text-zinc-500">{user?.studentId || 'Staff'}</span>
               </div>
               <ThemeToggle isDark={theme === 'dark'} toggleTheme={toggleTheme} />
            </div>
         </header>

         <div className="p-4 md:p-8 max-w-7xl mx-auto">
            
            {/* TIMETABLE VIEW */}
            {currentView === 'timetable' && (
                <div className="space-y-6">
                    {/* Date Controls */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                             <button onClick={prevDay} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors dark:text-zinc-400">
                                <ChevronLeft size={20} />
                             </button>
                             <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                                <span className="text-lg font-bold text-zinc-900 dark:text-white min-w-[140px] text-center">
                                    {format(viewDate, 'EEEE')}
                                </span>
                                <span className="text-sm text-zinc-500 font-medium">
                                    {format(viewDate, 'd MMMM yyyy')}
                                </span>
                             </div>
                             <button onClick={nextDay} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors dark:text-zinc-400">
                                <ChevronRight size={20} />
                             </button>
                        </div>
                        
                        {!isSameDay(viewDate, new Date()) && (
                            <button onClick={resetToday} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                <CalendarIcon size={16} />
                                Returns to Today
                            </button>
                        )}
                    </div>

                    <Timetable timetableData={timetable} />
                </div>
            )}

            {/* CALENDAR VIEW */}
            {currentView === 'calendar' && <CalendarView />}

            {/* NOTICES VIEW */}
            {currentView === 'notices' && (
                <div className="max-w-3xl mx-auto">
                    <DailyNotices notices={notices} />
                </div>
            )}
             
            {/* ADMIN VIEW */}
            {currentView === 'admin' && <AdminPanel />}

            {/* PROFILE VIEW (Simple placeholder) */}
            {currentView === 'profile' && (
                <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center space-y-6 mt-10">
                    <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                        {user?.givenName?.[0]}{user?.surname?.[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{user?.givenName} {user?.surname}</h2>
                        <p className="text-zinc-500 mt-1">{user?.email}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full py-3 font-medium text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            )}

         </div>
      </main>
    </div>
  );
}

export default App;
