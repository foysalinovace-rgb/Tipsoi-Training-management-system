
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Menu,
  CheckCircle,
  User as UserIcon,
  Info,
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
import { TrainingBooking, User, UserRole, BookingStatus, SystemSettings } from './types';
import { INITIAL_USERS } from './constants';
import { supabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'tipsoi_cst_session',
  TAB: 'tipsoi_cst_active_tab'
};

const App: React.FC = () => {
  // 1. Initial State
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [kams, setKams] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    panelName: 'Tipsoi CST',
    logo: ''
  });

  // 2. Tab Persistence
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(STORAGE_KEYS.TAB, activeTab);
    }
  }, [activeTab, isLoggedIn]);

  // 3. Notification Helper
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

  // 4. Data Fetching
  const fetchData = useCallback(async () => {
    try {
      // Fetch Bookings
      const { data: bookingsData } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bookingsData) setBookings(bookingsData);

      // Fetch Users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        setUsers(usersData.map(u => ({ ...u, permissions: Array.isArray(u.permissions) ? u.permissions : [] })));
      }

      // Fetch Master Data (KAM and Packages)
      const { data: kamsData } = await supabase.from('kams').select('name').order('name');
      if (kamsData) setKams(kamsData.map(k => k.name));

      const { data: pkgsData } = await supabase.from('packages').select('name').order('name');
      if (pkgsData) setPackages(pkgsData.map(p => p.name));

      // Fetch Settings
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

  // 5. Action Handlers for Bookings
  const handleBookingSubmit = async (bookingData: TrainingBooking) => {
    try {
      const { error } = selectedBookingForEdit 
        ? await supabase.from('bookings').update(bookingData).eq('id', bookingData.id)
        : await supabase.from('bookings').insert([bookingData]);
      
      if (error) throw error;
      fetchData(); // Refresh all
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

  // 6. Master Data Handlers (Settings)
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
      
      // Sync with session if the updated user is the one logged in
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
          onUpdatePassword={(id, pw) => { const u = users.find(x => x.id === id); if(u) handleUserUpdate({...u, password: pw}); }}
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
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            <div className="text-slate-800 font-bold">{systemSettings.panelName}</div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative">
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-3 border-l border-slate-200 pl-6 cursor-pointer"
            >
              <div className="text-right">
                <p className="text-[11px] font-black">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase">{currentUser.role}</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 pb-20 max-w-7xl mx-auto w-full">{renderContent()}</div>

        <footer className="mt-auto border-t border-slate-200 p-4 bg-white flex justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>&copy; 2026 {systemSettings.panelName}</span>
          <span className="flex items-center text-green-500">
            <CheckCircle size={10} className="mr-1" /> Enterprise Secure Sync
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
