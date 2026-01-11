
import React, { useState, useEffect } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tipsoi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Bookings
        const { data: bookingsData, error: bError } = await supabase
          .from('bookings')
          .select('*')
          .order('date', { ascending: false });
        
        if (bookingsData) setBookings(bookingsData);
        if (bError) console.error("Bookings Fetch Error:", bError);

        // Fetch Users
        const { data: usersData, error: uError } = await supabase
          .from('users')
          .select('*');
        
        if (usersData && usersData.length > 0) {
          setUsers(usersData);
        } else {
          setUsers(INITIAL_USERS);
        }
        if (uError) console.error("Users Fetch Error:", uError);

        // Fetch Settings
        const { data: settingsData, error: sError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        
        if (settingsData) {
          setSystemSettings({
            panelName: settingsData.panelName,
            logo: settingsData.logo
          });
        }
        if (sError) console.error("Settings Fetch Error:", sError);

      } catch (err) {
        console.error("Critical error fetching from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      if (selectedBookingForEdit) {
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingData.id);
        
        if (error) throw error;
        setBookings(bookings.map(b => b.id === bookingData.id ? bookingData : b));
        addNotification(`Booking ${bookingData.id} updated.`, 'info');
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert([bookingData]);
        
        if (error) throw error;
        setBookings([bookingData, ...bookings]);
        addNotification(`New training session created successfully.`, 'success');
      }
    } catch (err: any) {
      console.error("Supabase Booking Error:", err);
      alert(`Error saving booking: ${err.message}. Ensure you ran the SQL scripts to disable RLS.`);
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
          permissions: updatedUser.permissions,
          password: updatedUser.password
        })
        .eq('id', updatedUser.id);
      
      if (error) throw error;
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      addNotification(`User ${updatedUser.name} information updated.`, 'success');
      
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('tipsoi_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      console.error("Supabase User Update Error:", err);
      alert(`Error updating user: ${err.message}`);
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (error) throw error;
      setUsers([...users, newUser]);
      addNotification(`User ${newUser.name} created.`, 'success');
    } catch (err: any) {
      console.error("Supabase Add User Error:", err);
      alert(`Error adding user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
      addNotification(`User removed from system.`, 'info');
    } catch (err: any) {
      console.error("Supabase Delete User Error:", err);
    }
  };

  const handleOpenNewBooking = () => {
    setSelectedBookingForEdit(null);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (booking: TrainingBooking) => {
    setSelectedBookingForEdit(booking);
    setIsBookingModalOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('tipsoi_user', JSON.stringify(user));
    const initialTab = user.permissions && user.permissions.length > 0 ? user.permissions[0] : 'dashboard';
    setActiveTab(initialTab);
    addNotification(`Welcome back, ${user.name}!`, 'info');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('tipsoi_user');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const hasAccess = (mod: string) => currentUser.permissions?.includes(mod);

    switch (activeTab) {
      case 'dashboard': 
        return hasAccess('dashboard') ? <Dashboard bookings={bookings} users={users} /> : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      case 'bookings': 
        return hasAccess('bookings') ? <BookingList bookings={bookings} onAdd={handleOpenNewBooking} onEdit={handleEditBooking} /> : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      case 'reports':
        return hasAccess('reports') ? <ReportModule bookings={bookings} /> : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      case 'analytics':
        return hasAccess('analytics') ? <Analytics bookings={bookings} users={users} /> : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      case 'users':
        return hasAccess('users') ? (
          <UserManagement 
              users={users} 
              onAddUser={handleAddUser}
              onUpdateUser={handleUserUpdate} 
              onUpdateRole={(userId, newRole) => handleUserUpdate(users.find(u => u.id === userId)!)} 
              onUpdatePassword={(userId, newPassword) => handleUserUpdate({ ...users.find(u => u.id === userId)!, password: newPassword })}
              onDeleteUser={handleDeleteUser} 
            />
        ) : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      case 'settings':
        return hasAccess('settings') ? (
          <Settings 
              settings={systemSettings} 
              onUpdate={async (newSettings) => {
                const { error } = await supabase
                  .from('settings')
                  .upsert({ id: 1, panelName: newSettings.panelName, logo: newSettings.logo });
                if (!error) setSystemSettings(newSettings);
              }}
              kams={kams}
              onUpdateKams={setKams}
              packages={packages}
              onUpdatePackages={setPackages}
            />
        ) : <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Access Denied</div>;
      default: return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">Coming Soon</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-bold uppercase tracking-widest text-xs">Connecting to Supabase...</p>
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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center space-x-2 text-slate-800 font-bold tracking-tight">
              <span>{systemSettings.panelName}</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-400 font-medium capitalize text-sm">{activeTab.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Global Search..." className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 w-56 transition-all font-medium" />
            </div>
            
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
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</h4>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-blue-600 hover:underline">Clear All</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start space-x-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {notif.type === 'success' ? <CheckCircle size={14} /> : <Info size={14} />}
                          </div>
                          <div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 block">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-xs text-slate-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-3 border-l border-slate-200 pl-6 cursor-pointer group hover:bg-slate-50 p-1 rounded-lg transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-none">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter leading-none mt-1">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-600 overflow-hidden text-sm uppercase">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>
        <div className="p-8 pb-20 max-w-7xl mx-auto w-full">{renderContent()}</div>
        <footer className="mt-auto border-t border-slate-200 p-4 bg-white flex justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <span>&copy; 2026 {systemSettings.panelName} v0.0.1</span>
          <div className="flex space-x-4">
            <span className="flex items-center text-green-500"><CheckCircle size={10} className="mr-1" /> All Systems Operational</span>
          </div>
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
