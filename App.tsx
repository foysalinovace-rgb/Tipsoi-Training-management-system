
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu,
  Loader2,
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Briefcase
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MDBMasterHub from './components/MDBMasterHub';
import BookingList from './components/BookingList';
import SlotReport from './components/SlotReport';
import ReportModule from './components/ReportModule';
import Analytics from './components/Analytics';
import BookingModal from './components/BookingModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import PublicBookingPage from './components/PublicBookingPage';
import TutorialManager from './components/TutorialManager';
import KAMManager from './components/KAMManager';
import PackageManager from './components/PackageManager';
import SlotManager from './components/SlotManager';
import { TrainingBooking, User, SystemSettings, TrainingSlot, BookingStatus, TrainingType, TutorialItem } from './types';
import { INITIAL_USERS } from './constants';
import { supabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'tipsoi_cst_session',
  TAB: 'tipsoi_cst_active_tab',
  SETTINGS: 'tipsoi_cst_local_settings'
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_TUTORIALS: TutorialItem[] = [
  { id: 't-1', category: 'package', title: 'Essential', iconType: 'essential', description: 'Core functionalities including attendance and basic reporting.', url: '' },
  { id: 't-2', category: 'package', title: 'Standard', iconType: 'standard', description: 'Advanced leave management and shift scheduling.', url: '' },
  { id: 't-3', category: 'package', title: 'Premium', iconType: 'premium', description: 'The complete suite including payroll and performance tracking.', url: '' },
  { id: 't-4', category: 'addon', title: 'Mobile Punch', iconType: 'mobile', description: 'Employee attendance via mobile application.', url: '' },
  { id: 't-5', category: 'addon', title: 'Geo Fencing', iconType: 'geo', description: 'Restricting attendance within specific geographic boundaries.', url: '' },
  { id: 't-6', category: 'addon', title: 'Location Tracking', iconType: 'location', description: 'Real-time tracking of field employees.', url: '' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) return null;
    try { 
      const parsed = JSON.parse(saved);
      return parsed && parsed.id ? { ...parsed, permissions: parsed.permissions || [] } : null;
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
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSlotEditModalOpen, setIsSlotEditModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<TrainingBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kams, setKams] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (local) {
      try { return JSON.parse(local); } catch { }
    }
    return { 
      panelName: 'Tipsoi CST', 
      logo: '',
      slotCapacity: 2,
      tutorials: DEFAULT_TUTORIALS
    };
  });

  const fetchData = useCallback(async () => {
    try {
      const { data: bData } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bData) setBookings(bData);

      const { data: uData } = await supabase.from('users').select('*');
      if (uData) setUsers(uData.map(u => ({ ...u, permissions: u.permissions || [] })));

      const { data: kData } = await supabase.from('kams').select('name');
      if (kData) setKams(kData.map(k => k.name));

      const { data: pData } = await supabase.from('packages').select('name');
      if (pData) setPackages(pData.map(p => p.name));

      const { data: sData } = await supabase.from('training_slots').select('*');
      if (sData) setSlots(sData);

      const { data: stData } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (stData) {
        const settings = {
          ...stData,
          slotCapacity: stData.slotCapacity || 2,
          tutorials: stData.tutorials && stData.tutorials.length > 0 ? stData.tutorials : DEFAULT_TUTORIALS
        };
        setSystemSettings(settings);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TAB, activeTab); }, [activeTab]);

  const handleUpdateSlots = async (newSlots: TrainingSlot[]) => {
    setSlots(newSlots);
    try {
      await supabase.from('training_slots').delete().neq('id', 'temp_placeholder');
      await supabase.from('training_slots').insert(newSlots.filter(s => !s.isVirtual).map(s => ({
        id: s.id,
        time: s.time,
        isActive: s.isActive,
        capacity: s.capacity,
        date: s.date
      })));
    } catch (err) {
      console.error("Failed to update slots:", err);
    }
  };

  const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
    // 1. Update UI and Local Storage first for immediate feedback
    setSystemSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

    // 2. Prepare precise payload for Supabase to avoid schema mismatch
    const payload = {
      id: 1,
      panelName: newSettings.panelName,
      slotCapacity: newSettings.slotCapacity,
      tutorials: newSettings.tutorials,
      logo: newSettings.logo || ''
    };

    try {
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error("Supabase Save Error Details:", error);
        alert(`Server Error: ${error.message || 'Check connection'}. Data is saved locally for now.`);
      } else {
        // Success - optionally re-fetch to sync
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to save settings to server:", err);
      alert("Network Error: Data saved locally. Please check your internet connection.");
    }
  };

  const renderContent = () => {
    const internalBookings = bookings.filter(b => b.category !== 'Public Request');

    switch (activeTab) {
      case 'dashboard': return <Dashboard bookings={internalBookings} users={users} />;
      case 'mdb': return <MDBMasterHub />;
      case 'bookings': 
        return <BookingList bookings={internalBookings} onAdd={() => { setSelectedBookingForEdit(null); setIsBookingModalOpen(true); }} onEdit={(b) => { setSelectedBookingForEdit(b); setIsBookingModalOpen(true); }} onDelete={async (id) => { await supabase.from('bookings').delete().eq('id', id); fetchData(); }} />;
      case 'slot-report': 
        return <SlotReport bookings={bookings} onEdit={(b) => { setSelectedBookingForEdit(b); setIsSlotEditModalOpen(true); }} onDelete={async (id) => { await supabase.from('bookings').delete().eq('id', id); fetchData(); }} />;
      case 'tutorials': 
        return <TutorialManager 
          tutorials={systemSettings.tutorials || []} 
          onUpdate={(tuts) => handleUpdateSystemSettings({ ...systemSettings, tutorials: tuts })} 
        />;
      case 'kam': return <KAMManager kams={kams} onUpdate={async (newKams) => { setKams(newKams); await supabase.from('kams').delete().neq('id', 'temp_placeholder'); await supabase.from('kams').insert(newKams.map(n => ({ name: n }))); fetchData(); }} />;
      case 'packages': return <PackageManager packages={packages} onUpdate={async (newPkgs) => { setPackages(newPkgs); await supabase.from('packages').delete().neq('id', 'temp_placeholder'); await supabase.from('packages').insert(newPkgs.map(n => ({ name: n }))); fetchData(); }} />;
      case 'slots': return <SlotManager slots={slots} onUpdate={handleUpdateSlots} slotCapacity={systemSettings.slotCapacity} />;
      case 'reports': return <ReportModule bookings={internalBookings} />;
      case 'analytics': return <Analytics bookings={bookings} users={users} />;
      case 'users': return <UserManagement users={users} onAddUser={async (u) => { await supabase.from('users').insert([u]); fetchData(); }} onUpdateUser={async (u) => { await supabase.from('users').update(u).eq('id', u.id); fetchData(); }} onUpdateRole={async (id, role) => { await supabase.from('users').update({ role }).eq('id', id); fetchData(); }} onUpdatePassword={async (id, password) => { await supabase.from('users').update({ password }).eq('id', id); fetchData(); }} onUpdatePermissions={async (id, permissions) => { await supabase.from('users').update({ permissions }).eq('id', id); fetchData(); }} onDeleteUser={async (id) => { await supabase.from('users').delete().eq('id', id); fetchData(); }} />;
      case 'settings': return <Settings settings={systemSettings} onUpdate={handleUpdateSystemSettings} />;
      default: return <Dashboard bookings={internalBookings} users={users} />;
    }
  };

  if (!isLoggedIn || !currentUser) {
    if (authView === 'landing') return <PublicBookingPage slots={slots} bookings={bookings} onSubmit={async (d) => { 
      const newBooking: Partial<TrainingBooking> = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: d.companyName,
        assignedPerson: 'TBD',
        kamName: 'TBD',
        title: 'Training Request',
        category: 'Public Request',
        type: TrainingType.ONLINE,
        package: 'Basic',
        manpowerSubmissionDate: getLocalDateString(),
        date: d.date,
        startTime: d.slotTime,
        duration: 1,
        location: 'Remote',
        notes: `Phone: ${d.phoneNumber}. Requested via public portal.`,
        status: BookingStatus.PENDING,
        createdAt: new Date().toISOString(),
        history: [{ timestamp: new Date().toISOString(), user: 'Public Portal', action: 'Requested' }]
      };
      const { data: inserted, error } = await supabase.from('bookings').insert([newBooking]).select();
      if (error) throw error;
      fetchData();
      return inserted ? inserted[0].id : newBooking.id;
    }} onAdminClick={() => setAuthView('login')} systemSettings={systemSettings} />;
    return <Login onLogin={(u) => { setCurrentUser({ ...u, permissions: u.permissions || [] }); setIsLoggedIn(true); localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u)); }} users={users} onBack={() => setAuthView('landing')} />;
  }

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 size={40} className="text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => { setIsLoggedIn(false); setAuthView('landing'); }} systemSettings={systemSettings} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Menu size={20} /></button>
          <div className="text-sm font-black text-slate-800 tracking-tighter uppercase">{systemSettings.panelName}</div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 custom-scrollbar overflow-y-auto">{renderContent()}</div>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        onSubmit={async (b) => { 
          if (selectedBookingForEdit) await supabase.from('bookings').update(b).eq('id', b.id);
          else await supabase.from('bookings').insert([b]); 
          fetchData(); 
        }} 
        bookingToEdit={selectedBookingForEdit} 
        users={users} kams={kams} packages={packages} 
      />

      {isSlotEditModalOpen && selectedBookingForEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Slot Details</h3>
              <button onClick={() => setIsSlotEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            <form className="p-8 space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              const updated = { ...selectedBookingForEdit };
              await supabase.from('bookings').update(updated).eq('id', updated.id);
              fetchData();
              setIsSlotEditModalOpen(false);
            }}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center"><Briefcase size={12} className="mr-2" /> Company Name</label>
                <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.clientName} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, clientName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center"><CalendarIcon size={12} className="mr-2" /> Training Date</label>
                <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.date} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center"><Clock size={12} className="mr-2" /> Start Time</label>
                <input required type="time" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.startTime} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, startTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center"><CheckCircle2 size={12} className="mr-2" /> Status</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.status} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, status: e.target.value as BookingStatus})}>
                   <option value={BookingStatus.PENDING}>Pending</option>
                   <option value={BookingStatus.APPROVED}>Approved</option>
                   <option value={BookingStatus.DONE}>Done</option>
                   <option value={BookingStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Save Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
