
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
import SlotReport from './components/SlotReport';
import ReportModule from './components/ReportModule';
import Analytics from './components/Analytics';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import PublicBookingPage from './components/PublicBookingPage';
import { TrainingBooking, User, SystemSettings, AppNotification, UserRole, TrainingSlot, BookingStatus, TrainingType, TutorialItem } from './types';
import { INITIAL_USERS } from './constants';
import { supabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'tipsoi_cst_session',
  TAB: 'tipsoi_cst_active_tab',
  NOTIFS: 'tipsoi_cst_notifs'
};

const DEFAULT_TUTORIALS: TutorialItem[] = [
  { id: 't-1', category: 'package', title: 'Essential', iconType: 'essential', description: 'Core functionalities including attendance and basic reporting.', url: '' },
  { id: 't-2', category: 'package', title: 'Standard', iconType: 'standard', description: 'Advanced leave management and shift scheduling.', url: '' },
  { id: 't-3', category: 'package', title: 'Premium', iconType: 'premium', description: 'The complete suite including payroll and performance tracking.', url: '' },
  { id: 't-4', category: 'addon', title: 'Mobile Punch', iconType: 'mobile', description: 'Learn how users can punch in/out from their mobile devices.', url: '' },
  { id: 't-5', category: 'addon', title: 'Geo Fencing', iconType: 'mobile', description: 'Restricting attendance within specific geographic boundaries.', url: '' },
  { id: 't-6', category: 'addon', title: 'Location Tracking', iconType: 'location', description: 'Real-time GPS tracking and movement history for field staff.', url: '' },
];

const DEFAULT_SLOTS: TrainingSlot[] = [
  { id: 'def-1', time: '10:00 AM', isActive: true, capacity: 2 },
  { id: 'def-2', time: '12:00 PM', isActive: true, capacity: 2 },
  { id: 'def-3', time: '03:00 PM', isActive: true, capacity: 2 },
  { id: 'def-4', time: '05:00 PM', isActive: true, capacity: 2 },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) return null;
    try { 
      const parsed = JSON.parse(saved);
      return parsed && parsed.id ? parsed : null;
    } catch { return null; }
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    try {
      const parsed = JSON.parse(saved || 'null');
      return !!(parsed && parsed.id);
    } catch { return false; }
  });

  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(STORAGE_KEYS.TAB) || 'dashboard');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  // Fixed double assignment in useState for bookings to resolve declaration and constant assignment errors
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TrainingBooking | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [kams, setKams] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ 
    panelName: 'Tipsoi CST', 
    logo: '',
    slotCapacity: 2,
    tutorials: DEFAULT_TUTORIALS
  });

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data: bookingsData } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bookingsData) setBookings(bookingsData);

      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
        setUsers(usersData.map(u => ({ ...u, permissions: Array.isArray(u.permissions) ? u.permissions : [] })));
      }

      const { data: kamsData } = await supabase.from('kams').select('name').order('name');
      if (kamsData) setKams(kamsData.map(k => k.name));

      const { data: pkgsData } = await supabase.from('packages').select('name').order('name');
      if (pkgsData) setPackages(pkgsData.map(p => p.name));

      const { data: slotsData } = await supabase.from('training_slots').select('*');
      if (slotsData && slotsData.length > 0) {
        setSlots(slotsData);
      } else {
        setSlots(DEFAULT_SLOTS);
      }

      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (settingsData) {
        setSystemSettings({ 
          panelName: settingsData.panelName, 
          logo: settingsData.logo,
          slotCapacity: settingsData.slotCapacity || 2,
          tutorials: settingsData.tutorials || DEFAULT_TUTORIALS
        });
      }
    } catch (err) {
      console.error("Cloud Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateSlots = useCallback(async (newSlots: TrainingSlot[]) => {
    try {
      setSlots(newSlots);
      await supabase.from('training_slots').delete().neq('id', 'temp_placeholder');
      if (newSlots.length > 0) await supabase.from('training_slots').insert(newSlots);
      addNotification('Slot Manager', 'Synchronized.', 'success');
    } catch (err: any) { fetchData(); }
  }, [addNotification, fetchData]);

  const handlePublicBooking = async (formData: any) => {
    const bookingId = `PUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBooking: any = {
      id: bookingId,
      clientName: formData.clientName,
      assignedPerson: 'Pending',
      kamName: 'External',
      title: `Corporate: ${formData.companyName}`,
      category: 'Public Request',
      type: TrainingType.ONLINE,
      package: 'External',
      manpowerSubmissionDate: new Date().toISOString().split('T')[0],
      date: formData.date,
      startTime: formData.slotTime,
      duration: 1,
      location: 'Online',
      notes: `Company: ${formData.companyName}`,
      status: BookingStatus.REQUESTED,
      createdAt: new Date().toISOString(),
      history: [{ timestamp: new Date().toISOString(), user: 'External', action: 'Created' }]
    };
    await supabase.from('bookings').insert([newBooking]);
    await fetchData();
    return bookingId; // Return ID for confirmation screen
  };

  const handleBookingSubmit = async (bookingData: TrainingBooking) => {
    try {
      selectedBookingForEdit 
        ? await supabase.from('bookings').update(bookingData).eq('id', bookingData.id)
        : await supabase.from('bookings').insert([bookingData]);
      fetchData();
    } catch (err: any) { alert(err.message); }
    setIsBookingModalOpen(false);
    setSelectedBookingForEdit(null);
  };

  const handleLogout = () => { setIsLoggedIn(false); setAuthView('landing'); };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    const firstTab = user.permissions?.[0] || 'dashboard';
    setActiveTab(firstTab);
  };

  if (!isLoggedIn || !currentUser) {
    if (authView === 'landing') {
      return <PublicBookingPage slots={slots} bookings={bookings} onSubmit={handlePublicBooking} onAdminClick={() => setAuthView('login')} systemSettings={systemSettings} />;
    } else {
      return <Login onLogin={handleLogin} users={users} onBack={() => setAuthView('landing')} />;
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard bookings={bookings} users={users} />;
      case 'mdb': return <MDBMasterHub />;
      case 'ticket': return <TicketModule />;
      case 'bookings': return <BookingList bookings={bookings} onAdd={() => { setSelectedBookingForEdit(null); setIsBookingModalOpen(true); }} onEdit={(b) => { setSelectedBookingForEdit(b); setIsBookingModalOpen(true); }} onDelete={async (id) => { await supabase.from('bookings').delete().eq('id', id); fetchData(); }} />;
      case 'slot-report': return <SlotReport bookings={bookings} onEdit={(b) => { setSelectedBookingForEdit(b); setIsBookingModalOpen(true); }} onDelete={async (id) => { await supabase.from('bookings').delete().eq('id', id); fetchData(); }} />;
      case 'reports': return <ReportModule bookings={bookings} />;
      case 'analytics': return <Analytics bookings={bookings} users={users} />;
      case 'users': return <UserManagement users={users} onAddUser={async (u) => { await supabase.from('users').insert([u]); fetchData(); }} onUpdateUser={async (u) => { await supabase.from('users').update(u).eq('id', u.id); fetchData(); }} onUpdateRole={async (id, role) => { await supabase.from('users').update({ role }).eq('id', id); fetchData(); }} onUpdatePassword={async (id, password) => { await supabase.from('users').update({ password }).eq('id', id); fetchData(); }} onUpdatePermissions={async (id, permissions) => { await supabase.from('users').update({ permissions }).eq('id', id); fetchData(); }} onDeleteUser={async (id) => { await supabase.from('users').delete().eq('id', id); fetchData(); }} />;
      case 'settings': return <Settings settings={systemSettings} onUpdate={async (s) => { setSystemSettings(s); await supabase.from('settings').upsert({ id: 1, ...s }); fetchData(); }} kams={kams} onUpdateKams={async (k) => { setKams(k); await supabase.from('kams').delete().neq('id', '0'); await supabase.from('kams').insert(k.map(n => ({ name: n }))); fetchData(); }} packages={packages} onUpdatePackages={async (p) => { setPackages(p); await supabase.from('packages').delete().neq('id', '0'); await supabase.from('packages').insert(p.map(n => ({ name: n }))); fetchData(); }} slots={slots} onUpdateSlots={handleUpdateSlots} />;
      default: return <Dashboard bookings={bookings} users={users} />;
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 size={40} className="text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} systemSettings={systemSettings} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Menu size={20} /></button>
            <div className="text-sm font-black text-slate-800 tracking-tighter">{systemSettings.panelName}</div>
          </div>
        </header>
        <div className="p-4 pb-20 w-full flex-1 max-w-7xl mx-auto custom-scrollbar overflow-y-auto">{renderContent()}</div>
      </main>
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} onSubmit={handleBookingSubmit} bookingToEdit={selectedBookingForEdit} users={users} kams={kams} packages={packages} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={currentUser!} onUpdate={(u) => { setCurrentUser(u); }} />
    </div>
  );
};

export default App;
