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
  { id: 't-5', category: 'addon', title: 'Geo Fencing', iconType: 'mobile', description: 'Restricting attendance within specific geographic boundaries.', url: '' },
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
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
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
    setIsDataRefreshing(true);
    try {
      const { data: bData, error: bError } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bError) console.error("Bookings Fetch Error:", bError);
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
        setSystemSettings(prevSettings => {
          let dbTutorials = stData.tutorials;
          if (typeof dbTutorials === 'string' && dbTutorials.startsWith('[')) {
            try { dbTutorials = JSON.parse(dbTutorials); } catch { dbTutorials = prevSettings.tutorials; }
          }
          const newSettings = {
            ...prevSettings,
            ...stData,
            slotCapacity: stData.slotCapacity || prevSettings.slotCapacity || 2,
            tutorials: Array.isArray(dbTutorials) ? dbTutorials : prevSettings.tutorials
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
          return newSettings;
        });
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
      setIsDataRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

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
    setSystemSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    const fullPayload = {
      id: 1,
      panelName: newSettings.panelName,
      slotCapacity: newSettings.slotCapacity,
      tutorials: newSettings.tutorials,
      logo: newSettings.logo || ''
    };
    const { error: jsonError } = await supabase.from('settings').upsert(fullPayload, { onConflict: 'id' });
    if (!jsonError) return;
    const payloadWithStringifiedTutorials = { ...fullPayload, tutorials: JSON.stringify(newSettings.tutorials) };
    const { error: textError } = await supabase.from('settings').upsert(payloadWithStringifiedTutorials, { onConflict: 'id' });
    if (!textError) return;
    const { tutorials, ...basePayload } = fullPayload;
    await supabase.from('settings').upsert(basePayload, { onConflict: 'id' });
  };

  const renderContent = () => {
    const internalBookings = bookings.filter(b => b.category !== 'Public Request');
    switch (activeTab) {
      case 'dashboard': return <Dashboard bookings={internalBookings} users={users} />;
      case 'mdb': return <MDBMasterHub />;
      case 'bookings': 
        return <BookingList bookings={internalBookings} onAdd={() => { setSelectedBookingForEdit(null); setIsBookingModalOpen(true); }} onEdit={(b) => { setSelectedBookingForEdit(b); setIsBookingModalOpen(true); }} onDelete={async (ids) => { await supabase.from('bookings').delete().in('id', ids); fetchData(); }} />;
      case 'slot-report': 
        return <SlotReport bookings={bookings} onEdit={(b) => { setSelectedBookingForEdit(b); setIsSlotEditModalOpen(true); }} onDelete={async (id) => { await supabase.from('bookings').delete().eq('id', id); fetchData(); }} onRefresh={fetchData} isRefreshing={isDataRefreshing} />;
      case 'tutorials': 
        return <TutorialManager tutorials={systemSettings.tutorials || []} onUpdate={(tuts) => handleUpdateSystemSettings({ ...systemSettings, tutorials: tuts })} />;
      case 'kam': 
        return <KAMManager kams={kams} onUpdate={async (newKams) => {
            await supabase.from('kams').delete().neq('name', 'placeholder');
            if (newKams.length > 0) await supabase.from('kams').insert(newKams.map(n => ({ name: n })));
            fetchData();
          }} />;
      case 'packages': 
        return <PackageManager packages={packages} onUpdate={async (newPkgs) => {
            await supabase.from('packages').delete().neq('name', 'placeholder');
            if (newPkgs.length > 0) await supabase.from('packages').insert(newPkgs.map(n => ({ name: n })));
            fetchData();
          }} />;
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
      const timestamp = Date.now().toString().slice(-8);
      const notesWithPhone = `Customer requested via public portal. Phone: ${d.phoneNumber}`;
      
      const newBooking: any = {
        id: `REQ-${timestamp}-${Math.floor(Math.random() * 1000)}`,
        clientName: d.companyName,
        phoneNumber: d.phoneNumber, // Try including it first
        assignedPerson: 'TBD',
        kamName: 'TBD',
        title: 'Online Training Session',
        category: 'Public Request',
        type: TrainingType.ONLINE,
        package: 'Basic Training',
        manpowerSubmissionDate: getLocalDateString(),
        date: d.date,
        startTime: d.slotTime,
        duration: 1,
        location: 'Remote',
        notes: notesWithPhone,
        status: BookingStatus.PENDING,
        createdAt: new Date().toISOString(),
        history: [{ timestamp: new Date().toISOString(), user: 'Public Portal', action: 'Requested' }]
      };
      
      // Step 1: Attempt standard insert
      let result = await supabase.from('bookings').insert([newBooking]).select();
      
      // Step 2: Handle missing column schema error (PostgREST 42703 error code or column message)
      if (result.error && (result.error.message.includes('phoneNumber') || result.error.code === '42703')) {
        console.warn("Schema mismatch detected: 'phoneNumber' column missing. Retrying with phone in 'notes'...");
        const { phoneNumber, ...fallbackBooking } = newBooking;
        const retry = await supabase.from('bookings').insert([fallbackBooking]).select();
        if (retry.error) throw retry.error;
        result = retry;
      } else if (result.error) {
        throw result.error;
      }
      
      await fetchData();
      return result.data ? result.data[0].id : newBooking.id;
    }} onAdminClick={() => setAuthView('login')} systemSettings={systemSettings} />;
    
    return <Login onLogin={(u) => { setCurrentUser({ ...u, permissions: u.permissions || [] }); setIsLoggedIn(true); localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u)); }} users={users} onBack={() => setAuthView('landing')} />;
  }

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 size={40} className="text-blue-500 animate-spin" /></div>;

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
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} onSubmit={async (b) => { 
          if (selectedBookingForEdit) await supabase.from('bookings').update(b).eq('id', b.id);
          else await supabase.from('bookings').insert([b]); 
          fetchData(); 
        }} bookingToEdit={selectedBookingForEdit} users={users} kams={kams} packages={packages} />
      
      {isSlotEditModalOpen && selectedBookingForEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Modify Slot Record</h3>
              <button onClick={() => setIsSlotEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form className="p-8 space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              await supabase.from('bookings').update(selectedBookingForEdit).eq('id', selectedBookingForEdit.id);
              fetchData();
              setIsSlotEditModalOpen(false);
            }}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.clientName} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, clientName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Date</label>
                <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.date} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Time</label>
                <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.startTime} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, startTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all" value={selectedBookingForEdit.status} onChange={e => setSelectedBookingForEdit({...selectedBookingForEdit, status: e.target.value as BookingStatus})}>
                   <option value={BookingStatus.PENDING}>Pending</option>
                   <option value={BookingStatus.APPROVED}>Approved</option>
                   <option value={BookingStatus.DONE}>Done</option>
                   <option value={BookingStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Save Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;