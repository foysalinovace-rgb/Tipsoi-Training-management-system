
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Menu,
  Loader2
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookingList from './components/BookingList';
import ReportModule from './components/ReportModule';
import Analytics from './components/Analytics';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import { TrainingBooking, User, SystemSettings } from './types';
import { INITIAL_USERS } from './constants';
import { supabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'tipsoi_cst_session',
  TAB: 'tipsoi_cst_active_tab'
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
  
  // Set initial sidebar state based on screen width
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TrainingBooking | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [kams, setKams] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    panelName: 'Tipsoi CST',
    logo: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(STORAGE_KEYS.TAB, activeTab);
    }
  }, [activeTab, isLoggedIn]);

  const addNotification = (message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

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
      fetchData();
      addNotification(`Booking ${selectedBookingForEdit ? 'updated' : 'created'}.`, 'success');
    } catch (err: any) { alert(err.message); }
    setIsBookingModalOpen(false);
    setSelectedBookingForEdit(null);
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.id !== id));
      addNotification(`Booking deleted.`, 'warning');
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateKams = async (newKamList: string[]) => {
    try {
      if (newKamList.length > kams.length) {
        const added = newKamList.find(n => !kams.includes(n));
        if (added) await supabase.from('kams').insert([{ name: added }]);
      } else if (newKamList.length < kams.length) {
        const removed = kams.find(k => !newKamList.includes(k));
        if (removed) await supabase.from('kams').delete().eq('name', removed);
      }
      setKams(newKamList);
    } catch (err: any) { console.error(err.message); }
  };

  const handleUpdatePackages = async (newPkgList: string[]) => {
    try {
      if (newPkgList.length > packages.length) {
        const added = newPkgList.find(n => !packages.includes(n));
        if (added) await supabase.from('packages').insert([{ name: added }]);
      } else if (newPkgList.length < packages.length) {
        const removed = packages.find(p => !newPkgList.includes(p));
        if (removed) await supabase.from('packages').delete().eq('name', removed);
      }
      setPackages(newPkgList);
    } catch (err: any) { console.error(err.message); }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      if (currentUser && updatedUser.id === currentUser.id) {
        const mergedUser = { ...currentUser, ...updatedUser };
        setCurrentUser(mergedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
      }
    } catch (err: any) { console.error(err.message); }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setActiveTab(user.permissions?.[0] || 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.clear();
    window.location.reload(); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard bookings={bookings} users={users} />;
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
          onUpdateUser={handleUserUpdate}
          onUpdateRole={(id, role) => { const u = users.find(x => x.id === id); if(u) handleUserUpdate({...u, role}); }}
          onUpdatePassword={(id, pw) => { const u = users.find(x => x.id === id); if(u) handleUpdatePassword(id, pw); }}
          onDeleteUser={async (id) => { await supabase.from('users').delete().eq('id', id); fetchData(); }}
        />
      );
      case 'settings': return (
        <Settings 
          settings={systemSettings} 
          onUpdate={async (s) => {
            setSystemSettings(s);
            await supabase.from('settings').upsert({ id: 1, ...s });
            addNotification('Settings updated.', 'success');
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

  const handleUpdatePassword = async (id: string, pw: string) => {
    try {
      await supabase.from('users').update({ password: pw }).eq('id', id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, password: pw } : u));
      addNotification('Password updated successfully.', 'success');
    } catch (err: any) { console.error(err.message); }
  };

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
      {/* Main content margin: Dynamic based on sidebar state on desktop */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="text-slate-800 font-bold text-sm md:text-base line-clamp-1 truncate max-w-[150px] md:max-w-none">
              {systemSettings.panelName}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-6">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative">
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
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

        <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto w-full flex-1">
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
        onUpdate={handleUserUpdate} 
      />
    </div>
  );
};

export default App;
