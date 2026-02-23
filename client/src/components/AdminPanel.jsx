import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, AlertCircle, Users, Activity, Settings, Search, MoreVertical, RefreshCw, Trash2, Eye, Edit2, X, Terminal, Radio, MessageSquare, Zap } from 'lucide-react';
import { fetchUsers, fetchAdminStats, deleteUser, clearServerCache, updateUser, fetchLogs, setBroadcast, setMaintenanceMode } from '../services/adminApi';
import Timetable from './Timetable';

const AdminPanel = ({ user }) => {
  // Configured Admin ID
  const ADMIN_ID = "449130511";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data States
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');

  const handleToggleMaintenance = async () => {
       try {
           const newStatus = !stats?.systemStatus?.includes('Maintenance');
           await setMaintenanceMode(newStatus);
           loadData(); // Refresh stats
           alert(`Maintenance mode ${newStatus ? 'ENABLED' : 'DISABLED'}`);
       } catch (e) {
           alert("Failed to toggle maintenance mode");
       }
  };

  // UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null); // ID only, derive user from list
  const [editingUser, setEditingUser] = useState(null); // User object for edit modal

  useEffect(() => {
    if (user && user.studentId === ADMIN_ID) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
        const [usersData, statsData, logsData] = await Promise.all([
            fetchUsers(),
            fetchAdminStats(),
            fetchLogs()
        ]);
        setUsers(usersData);
        setStats(statsData);
        setLogs(logsData);
    } catch (err) {
        setApiError('Failed to fetch data from server. Ensure backend is running.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Determine the user object for the modal based on latest data
  const viewingUserEntry = viewingUserId ? users.find(u => u.id === viewingUserId) : null;

  useEffect(() => {
    if (isAuthenticated) {
        loadData();
    }
  }, [isAuthenticated]);

  const handleDeleteUser = async (userId) => {
      if(!window.confirm("Are you sure you want to delete this user?")) return;
      
      try {
          await deleteUser(userId);
          setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
          alert("Failed to delete user");
      }
  };

  const handleUpdateRole = async (e) => {
      e.preventDefault();
      if (!editingUser) return;
      
      try {
          // Collect form data
          const formData = new FormData(e.target);
          const updates = {
              role: formData.get('role'),
              status: formData.get('status')
          };
          
          await updateUser(editingUser.id, updates);
          
          // Update local state
          setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
          setEditingUser(null);
      } catch(err) {
          alert("Failed to update user");
      }
  };

  const handleClearLocalCache = () => {
      // Clear everything except admin session
      const adminAuth = sessionStorage.getItem('sbhs_auth_state'); 
      localStorage.clear();
      if(adminAuth) sessionStorage.setItem('sbhs_auth_state', adminAuth);
      alert("Local cache cleared.");
  };

  const handleClearServerCache = async () => {
      try {
          await clearServerCache();
          alert("Server cache cleared.");
      } catch (err) {
          alert("Failed to clear server cache.");
      }
  };
  const handleBroadcast = async (e) => {
      e.preventDefault();
      try {
          await setBroadcast(broadcastMsg, broadcastType);
          alert("Broadcast updated successfully!");
          setBroadcastMsg('');
          loadData(); // Refresh logs
      } catch (err) {
          alert("Failed to set broadcast");
      }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${activeTab === id 
            ? 'bg-blue-600 text-white' 
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold dark:text-white mb-2">Access Denied</h2>
          <p className="text-zinc-500 mb-6">
             Your account ({user?.studentId || 'Unknown'}) is not authorized to view this area.
          </p>
          <button 
             onClick={() => window.location.href = '/'}
             className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
             Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                    Admin Dashboard
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Manage users and system settings
                </p>
            </div>
            <div className="flex gap-2">
                <TabButton id="overview" label="Overview" icon={Activity} />
                <TabButton id="users" label="Users" icon={Users} />
                <TabButton id="broadcast" label="Broadcast" icon={MessageSquare} />
                <TabButton id="settings" label="Settings" icon={Settings} />
            </div>
        </header>

        {apiError && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                {apiError}
            </div>
        )}

        {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={60} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Users</p>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                {loading ? '...' : (stats?.totalUsers || users.length || 0)}
                            </h3>
                            <div className="text-xs mt-2 flex items-center gap-1">
                                <Zap size={16} className={stats?.systemStatus === 'Maintenance' ? 'text-red-500' : 'text-green-600'} />
                            </div>
                        </div>
                    </div>
                
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={60} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">System Status</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">
                                {loading ? '...' : (stats?.systemStatus || 'Operational')}
                            </h3>
                             <div className="text-xs text-zinc-500 mt-2">
                                Uptime: {stats ? Math.floor(stats.uptime / 60) + 'm' : '0m'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={60} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Server Load</p>
                             <div className="flex items-end gap-2 mt-1">
                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {stats ? Math.round(stats.memoryUsage / 1024 / 1024) : 0}
                                </h3>
                                <span className="text-sm font-medium text-zinc-400 mb-1">MB</span>
                             </div>
                             <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Settings size={60} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Environment</p>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-1 capitalize">{import.meta.env.MODE}</h3>
                            <div className="text-xs text-zinc-500 mt-2">
                                v1.2.0-beta
                            </div>
                        </div>
                    </div>
                </div>

                {/* Console Log Terminal */}
                <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl font-mono text-sm">
                    <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                         <div className="flex items-center gap-2">
                             <Terminal size={14} className="text-zinc-400" />
                             <span className="text-zinc-400 font-medium text-xs">root@server:~ logs</span>
                         </div>
                         <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/50"></div>
                         </div>
                    </div>
                    <div className="p-4 h-64 overflow-y-auto space-y-1 text-zinc-300 custom-scrollbar">
                         {logs.length === 0 ? (
                            <div className="text-zinc-600 italic">Waiting for system events...</div>
                         ) : (
                             logs.map((log, i) => (
                                 <div key={i} className="flex gap-3 hover:bg-zinc-900/50 p-0.5 rounded">
                                     <span className="text-zinc-600 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                     <span className={`font-bold ${
                                         log.action === 'ERROR' ? 'text-red-400' :
                                         log.action === 'WARNING' ? 'text-yellow-400' :
                                         log.action === 'REGISTER' ? 'text-green-400' :
                                         log.action === 'STARTUP' ? 'text-blue-400' :
                                         'text-purple-400'
                                     }`}>{log.action}</span>
                                     <span className="text-zinc-500">@</span>
                                     <span className="text-zinc-400 underline decoration-zinc-800 underline-offset-2">{log.user}</span>
                                     <span className="text-zinc-300">{log.details}</span>
                                 </div>
                             ))
                         )}
                         <div className="flex gap-2 animate-pulse mt-2">
                             <span className="text-green-500">➜</span>
                             <span className="w-2 h-4 bg-zinc-600 block"></span>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'broadcast' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Radio size={32} />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white">System Broadcast</h2>
                    <p className="text-zinc-500 mt-2">Send a global alert message to all active users</p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Announcement Message</label>
                        <textarea 
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                            placeholder="Type your message here..."
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Alert Type</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['info', 'warning', 'error'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setBroadcastType(type)}
                                    className={`py-3 rounded-xl border capitalize font-medium transition-all ${
                                        broadcastType === type 
                                            ? type === 'error' ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                            : type === 'warning' ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        {broadcastMsg && (
                            <button
                                type="button" 
                                onClick={() => { setBroadcastMsg(''); setBroadcast('', 'info'); }}
                                className="flex-1 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors"
                            >
                                Clear Broadcast
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="flex-[2] py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                        >
                            Send Announcement
                        </button>
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">User Management</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="animate-spin w-4 h-4" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                     <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                                        No users found.
                                     </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-zinc-900 dark:text-white">{user.name}</div>
                                            <div className="text-zinc-500 text-xs">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{user.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.role === 'Prefect' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                              user.role === 'Teacher' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{user.year}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${user.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400' :
                                              'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-zinc-400'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => setViewingUserId(user.id)}
                                            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                            title="View Timetable"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => setEditingUser(user)}
                                            className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                     <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Maintenance Mode</h4>
                            <p className="text-xs text-zinc-500 mt-1">Block all non-admin access to the application</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={stats?.systemStatus === 'Maintenance'}
                                onChange={handleToggleMaintenance}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-zinc-200 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold dark:text-white mb-4">Admin Controls</h3>
                <p className="text-zinc-500 text-sm mb-6">
                    Perform system maintenance tasks.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Clear Application Cache (Local)</h4>
                            <p className="text-xs text-zinc-500 mt-1">Removes all local storage data/tokens except your admin session</p>
                        </div>
                         <button 
                            onClick={handleClearLocalCache}
                            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                        >
                            Clear Local Cache
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Clear Server Cache</h4>
                            <p className="text-xs text-zinc-500 mt-1">Force invalidation of API cache at synchron.work</p>
                        </div>
                         <button 
                            onClick={handleClearServerCache}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                        >
                            Clear Server Cache
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Timetable Modal */}
        {viewingUserEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">User Timetable</h3>
                            <p className="text-sm text-zinc-500">{viewingUserEntry.name} ({viewingUserEntry.id})</p>
                        </div>
                        <button onClick={() => setViewingUserId(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg dark:text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        {viewingUserEntry.timetable ? (
                             <Timetable timetableData={viewingUserEntry.timetable} showNow={false} />
                        ) : (
                            <div className="text-center py-12 text-zinc-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No timetable data available for this user yet.</p>
                                <p className="text-xs mt-1">Data is synced when the user logs in.</p>
                                <pre className="text-[10px] mt-4 text-zinc-300 overflow-x-auto max-w-sm mx-auto">
                                    Debug: {JSON.stringify(viewingUserEntry.timetable, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                 <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-xl font-bold dark:text-white">Edit User</h3>
                        <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg dark:text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                            <select name="role" defaultValue={editingUser.role} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:text-white">
                                <option value="Student">Student</option>
                                <option value="Prefect">Prefect</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                            <select name="status" defaultValue={editingUser.status} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:text-white">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Warning">Warning</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    );
  }


export default AdminPanel;
