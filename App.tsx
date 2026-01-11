
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

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TrainingBooking | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [kams, setKams] = useState<string[]>(['John Doe', 'Sarah Connor', 'Mike Tyson']);
  const [packages, setPackages] = useState<string[]>(['Essential', 'Standard', 'Premium', 'Custom Enterprise']);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    panelName: 'Tipsoi CST',
    logo: ''
  });

  // 1. Session Restoration Logic
  useEffect(() => {
    const savedUser = localStorage.getItem('tipsoi_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
        const savedTab = localStorage.getItem('active_tab') || 'dashboard';
        setActiveTab(savedTab);
      } catch (e) {
        console.error("Session restore failed:", e);
      }
    }
  }, []);

  // 2. Data Fetching from Supabase
  const fetchData = useCallback(async () => {
    try {
      // Fetch Bookings
      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });
      
      if (!bError && bookingsData) setBookings(bookingsData);

      // Fetch Users
      const { data: usersData, error: uError } = await supabase
        .from('users')
        .select('*');
      
      if (!uError && usersData && usersData.length > 0) {
        // Ensure permissions are handled as array
        const processedUsers = usersData.map(u => ({
          ...u,
          permissions: Array.isArray(u.permissions) ? u.permissions : []
        }));
        setUsers(processedUsers);
        
        // Sync session user
        const savedUser = localStorage.getItem('tipsoi_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const fresh = processedUsers.find(u => u.id === parsed.id);
          if (fresh) {
            setCurrentUser(fresh);
            localStorage.setItem('tipsoi_user', JSON.stringify(fresh));
          }
        }
      } else {
        setUsers(INITIAL_USERS);
      }

      // Fetch Settings
      const { data: settingsData, error: sError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (!sError && settingsData) {
        setSystemSettings({
          panelName: settingsData.panelName,
          logo: settingsData.logo
        });
      }
    } catch (err) {
      console.error("Global Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab Persistence
  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('active_tab', activeTab);
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

  const handleBookingSubmit = async (bookingData: TrainingBooking) => {
    try {
      let error;
      if (selectedBookingForEdit) {
        const { error: err } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingData.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('bookings')
          .insert([bookingData]);
        error = err;
      }
      
      if (error) throw error;
      
      // Update local state
      if (selectedBookingForEdit) {
        setBookings(prev => prev.map(b => b.id === bookingData.id ? bookingData : b));
        addNotification(`Update successful.`, 'info');
      } else {
        setBookings(prev => [bookingData, ...prev]);
        addNotification(`New record created.`, 'success');
      }
    } catch (err: any) {
      console.error("Save Error:", err.message);
      alert("Error saving data: " + err.message);
    }
    setIsBookingModalOpen(false);
    setSelectedBookingForEdit(null);
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          permissions: updatedUser.permissions, // Supabase client handles array to JSONB
          password: updatedUser.password
        })
        .eq('id', updatedUser.id);
      
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('tipsoi_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      console.error("User update failed:", err.message);
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      const { error } = await supabase.from('users').insert([newUser]);
      if (error) throw error;
      setUsers(prev => [...prev, newUser]);
      addNotification(`New user provisioned.`, 'success');
    } catch (err: any) {
      console.error("Add user failed:", err.message);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('tipsoi_user', JSON.stringify(user));
    const initialTab = user.permissions && user.permissions.length > 0 ? user.permissions[0] : 'dashboard';
    setActiveTab(initialTab);
    addNotification(`Authentication successful.`, 'success');
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
        />
      );
      case 'reports': return <ReportModule bookings={bookings} />;
      case 'analytics': return <Analytics bookings={bookings} users={users} />;
      case 'users': return (
        <UserManagement 
          users={users} 
          onAddUser={handleAddUser}
          onUpdateUser={handleUserUpdate}
          onUpdateRole={(id, role) => { const u = users.find(x => x.id === id); if(u) handleUserUpdate({...u, role}); }}
          onUpdatePassword={(id, pw) => { const u = users.find(x => x.id === id); if(u) handleUserUpdate({...u, password: pw}); }}
          onDeleteUser={async (id) => { 
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (!error) setUsers(prev => prev.filter(u => u.id !== id));
          }}
        />
      );
      case 'settings': return (
        <Settings 
          settings={systemSettings} 
          onUpdate={async (s) => {
            setSystemSettings(s);
            const { error } = await supabase.from('settings').upsert({ id: 1, ...s });
            if (!error) addNotification('Branding updated.', 'success');
          }} 
          kams={kams}
          onUpdateKams={setKams}
          packages={packages}
          onUpdatePackages={setPackages}
        />
      );
      default: return <Dashboard bookings={bookings} users={users} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-bold uppercase tracking-widest text-[10px]">Synchronizing Cloud Data...</p>
        </div>
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
            <div className="hidden lg:flex items-center space-x-2 text-slate-800 font-bold tracking-tight">
              <span>{systemSettings.panelName}</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-400 font-medium capitalize text-sm">{activeTab.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative transition-colors ${showNotifications ? 'bg-slate-100 text-blue-600' : ''}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Notifications</h4>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-blue-600 hover:underline">Clear</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start space-x-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Info size={14} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 block">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-3 border-l border-slate-200 pl-6 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden uppercase">
                {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 pb-20 max-w-7xl mx-auto w-full">{renderContent()}</div>

        <footer className="mt-auto border-t border-slate-200 p-4 bg-white flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <span>&copy; 2026 {systemSettings.panelName}</span>
          <span className="flex items-center text-green-500"><CheckCircle size={10} className="mr-1" /> SQL DB Connection Established</span>
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
        onUpdate={(u) => { setCurrentUser(u); handleUserUpdate(u); }} 
      />
    </div>
  );
};

export default App;
