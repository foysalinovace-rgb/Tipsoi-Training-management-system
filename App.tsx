
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, 
  Menu,
  Loader2,
  X,
  CheckCircle2,
  Info,
  AlertTriangle,
  MailOpen
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MDBMasterHub from './components/MDBMasterHub';
import TicketModule from './components/TicketModule';
import BookingList from './components/BookingList';
import ReportModule from './components/ReportModule';
import Analytics from './components/Analytics';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import { TrainingBooking, User, SystemSettings, AppNotification, UserRole } from './types';
import { INITIAL_USERS } from './constants';
import { supabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'tipsoi_cst_session',
  TAB: 'tipsoi_cst_active_tab',
  NOTIFS: 'tipsoi_cst_notifs'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEYS.USER);
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TAB) || 'dashboard';
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TrainingBooking | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [kams, setKams] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    panelName: 'Tipsoi CST',
    logo: ''
  });

  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.role === UserRole.SUPER_ADMIN) {
      const allModules = ['dashboard', 'mdb', 'ticket', 'bookings', 'reports', 'analytics', 'users', 'settings'];
      const missingModules = allModules.filter(m => !currentUser.permissions.includes(m));
      
      if (missingModules.length > 0) {
        const updatedUser = {
          ...currentUser,
          permissions: [...new Set([...currentUser.permissions, ...allModules])]
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]); 
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data: bookingsData } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bookingsData) setBookings(bookingsData);

      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setUsers(usersData.map(u => ({ ...u, permissions: Array.isArray(u.permissions) ? u.permissions : [] })));
      }

      const { data: kamsData } = await supabase.from('kams').select('name').order('name');
      if (kamsData) setKams(kamsData.map(k => k.name));

      const { data: pkgsData } = await supabase.from('packages').select('name').order('name');
      if (pkgsData) setPackages(pkgsData.map(p => p.name));

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (settingsData) setSystemSettings({ panelName: settingsData.panelName, logo: settingsData.logo });

    } catch (err) {
      console.error("Cloud Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookingSubmit = async (bookingData: TrainingBooking) => {
    try {
      const { error } = selectedBookingForEdit 
        ? await supabase.from('bookings').update(bookingData).eq('id', bookingData.id)
        : await supabase.from('bookings').insert([bookingData]);
      
      if (error) throw error;
      
      if (bookingData.assignedPerson) {
        addNotification(
          'Training Assigned',
          `New training "${bookingData.id}" assigned to ${bookingData.assignedPerson} for ${bookingData.clientName}.`,
          'info'
        );
      }

      fetchData();
    } catch (err: any) { 
      alert(err.message); 
      addNotification('Database Error', err.message, 'error');
    }
    setIsBookingModalOpen(false);
    setSelectedBookingForEdit(null);
  };

  const handleUpdateKams = useCallback(async (newKamList: string[]) => {
    try {
      const added = newKamList.filter(x => !kams.includes(x));
      const removed = kams.filter(x => !newKamList.includes(x));

      if (added.length > 0) {
        const { error: insErr } = await supabase.from('kams').insert(added.map(name => ({ name })));
        if (insErr) throw insErr;
      }
      
      if (removed.length > 0) {
        const { error: delErr } = await supabase.from('kams').delete().in('name', removed);
        if (delErr) throw delErr;
      }
      
      await fetchData();
      addNotification('KAM Registry Updated', `Registry synchronized successfully.`, 'success');
    } catch (err: any) {
      console.error("KAM sync error:", err);
      addNotification('KAM Sync Error', err.message || 'Failed to update KAM database.', 'error');
    }
  }, [kams, fetchData, addNotification]);

  const handleUpdatePackages = useCallback(async (newPkgList: string[]) => {
    try {
      const added = newPkgList.filter(x => !packages.includes(x));
      const removed = packages.filter(x => !newPkgList.includes(x));

      if (added.length > 0) {
        const { error: insErr } = await supabase.from('packages').insert(added.map(name => ({ name })));
        if (insErr) throw insErr;
      }
      
      if (removed.length > 0) {
        const { error: delErr } = await supabase.from('packages').delete().in('name', removed);
        if (delErr) throw delErr;
      }
      
      await fetchData();
      addNotification('Package Master Updated', `Registry synchronized successfully.`, 'success');
    } catch (err: any) {
      console.error("Package sync error:", err);
      addNotification('Package Sync Error', err.message || 'Failed to update package database.', 'error');
    }
  }, [packages, fetchData, addNotification]);

  const handleDeleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
      addNotification('Booking Deleted', `Training record ${id} has been permanently removed.`, 'warning');
    } catch (err: any) { alert(err.message); }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setActiveTab(user.permissions?.[0] || 'dashboard');
    
    setTimeout(() => {
      addNotification(
        'Welcome Back',
        `Hello ${user.name}, you have successfully logged into the Tipsoi CST Panel.`,
        'success'
      );
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.clear();
    window.location.reload(); 
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard bookings={bookings} users={users} />;
      case 'mdb': return <MDBMasterHub />;
      case 'ticket': return <TicketModule />;
      case 'bookings': return (
        <BookingList 
          bookings={bookings} 
          onAdd={() => { setSelectedBookingForEdit(null); setIsBookingModalOpen(true); }}
          onEdit={(booking) => { setSelectedBookingForEdit(booking); setIsBookingModalOpen(true); }}
          onDelete={handleDeleteBooking}
        />
      );
      case 'reports': return <ReportModule bookings={bookings} />;
      case 'analytics': return <Analytics bookings={bookings} users={users} />;
      case 'users': return (
        <UserManagement 
          users={users} 
          onAddUser={async (u) => { await supabase.from('users').insert([u]); fetchData(); }}
          onUpdateUser={async (updatedUser) => {
            await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          }}
          onUpdateRole={async (id, role) => {
            await supabase.from('users').update({ role }).eq('id', id);
            fetchData();
          }}
          onUpdatePassword={async (id, pw) => {
            await supabase.from('users').update({ password: pw }).eq('id', id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, password: pw } : u));
            addNotification('Security Update', `Password updated for user ID: ${id}.`, 'info');
          }}
          onUpdatePermissions={async (id, permissions) => {
            await supabase.from('users').update({ permissions }).eq('id', id);
            fetchData();
          }}
          onDeleteUser={async (id) => { await supabase.from('users').delete().eq('id', id); fetchData(); }}
        />
      );
      case 'settings': return (
        <Settings 
          settings={systemSettings} 
          onUpdate={async (s) => {
            setSystemSettings(s);
            const { error } = await supabase.from('settings').upsert({ id: 1, ...s });
            if (error) addNotification('Settings Error', error.message, 'error');
            else addNotification('System Settings', 'Platform branding updated.', 'success');
          }} 
          kams={kams}
          onUpdateKams={handleUpdateKams}
          packages={packages}
          onUpdatePackages={handleUpdatePackages}
        />
      );
      default: return <Dashboard bookings={bookings} users={users} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        systemSettings={systemSettings}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            <div className="text-slate-800 font-bold text-sm md:text-base line-clamp-1 truncate max-w-[150px] md:max-w-none">
              {systemSettings.panelName}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }} 
                className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</h4>
                    <div className="flex space-x-3">
                      <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all read</button>
                      <button onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 hover:text-red-500">Clear</button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors relative ${!n.read ? 'bg-blue-50/20' : ''}`}>
                            <div className={`p-2 rounded-lg shrink-0 ${
                              n.type === 'success' ? 'bg-green-100 text-green-600' : 
                              n.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                              n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {n.type === 'success' ? <CheckCircle2 size={16} /> : 
                               n.type === 'warning' ? <AlertTriangle size={16} /> : 
                               n.type === 'error' ? <X size={16} /> : <Info size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <p className="text-[11px] font-black text-slate-800 leading-tight">{n.title}</p>
                                <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap ml-2">{n.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{n.message}</p>
                            </div>
                            {!n.read && <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center">
                        <MailOpen size={32} className="text-slate-200 mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No new alerts</p>
                        <p className="text-[10px] text-slate-300 mt-1">System is quiet and healthy.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 md:space-x-3 border-l border-slate-200 pl-3 md:pl-6 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] md:text-[11px] font-black group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
                <p className="text-[8px] md:text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <div className="w-8 h-8 md:w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="font-bold text-slate-500 text-xs">{currentUser.name.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 pb-20 w-full flex-1 max-w-7xl mx-auto custom-scrollbar overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </div>

        <footer className="mt-auto border-t border-slate-200 p-4 bg-white flex justify-center items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <span className="flex items-center text-center">
            Designed & Developed by&nbsp;
            <a 
              href="https://polok-4xqo73k.gamma.site/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors ml-0.5 underline decoration-blue-100 underline-offset-4"
            >
              Foysal
            </a>
          </span>
        </footer>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        onSubmit={handleBookingSubmit} 
        bookingToEdit={selectedBookingForEdit}
        users={users}
        kams={kams}
        packages={packages}
      />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={currentUser} 
        onUpdate={async (u) => {
          const { error } = await supabase.from('users').update(u).eq('id', u.id);
          if (error) addNotification('Profile Sync Error', error.message, 'error');
          else {
            setCurrentUser(u);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
            addNotification('Profile Updated', 'User profile synchronized.', 'success');
          }
        }} 
      />
    </div>
  );
};

export default App;
