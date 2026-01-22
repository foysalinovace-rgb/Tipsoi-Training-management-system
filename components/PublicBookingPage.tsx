
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  User, 
  Building2, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Loader2,
  LogIn,
  X,
  Zap,
  Shield,
  Sparkles,
  Trophy,
  MousePointer2,
  Fingerprint,
  Cpu,
  BarChart3,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Layers,
  PlayCircle,
  Video,
  ArrowLeft,
  Clock,
  Users,
  Flashlight,
  Package as PackageIcon,
  Crown,
  Smartphone,
  Globe,
  MapPin,
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Youtube,
  Info,
  AlertCircle,
  Play,
  PartyPopper,
  Home,
  Mail
} from 'lucide-react';
import { TrainingSlot, TrainingBooking, SystemSettings, TutorialItem } from '../types';

interface PublicBookingPageProps {
  slots: TrainingSlot[];
  bookings: TrainingBooking[];
  onSubmit: (data: any) => Promise<string | any>;
  onAdminClick: () => void;
  systemSettings: SystemSettings;
}

interface SelectedTutorial {
  title: string;
  url?: string;
  desc: string;
  icon: any;
  color: string;
}

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ slots, bookings, onSubmit, onAdminClick, systemSettings }) => {
  const [view, setView] = useState<'landing' | 'booking' | 'tutorials' | 'video-player' | 'success'>('landing');
  const [selectedTutorial, setSelectedTutorial] = useState<SelectedTutorial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    phoneNumber: '',
    date: new Date().toISOString().split('T')[0],
    slotId: '',
    slotTime: ''
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  const getSlotAvailability = (slotTime: string) => {
    if (!formData || !formData.date) return { count: 0, capacity: 3, isFull: true };
    const slot = slots.find(s => s.time === slotTime);
    const capacity = slot?.capacity || systemSettings.slotCapacity || 3;
    const existing = bookings.filter(b => b.date === formData.date && b.startTime === slotTime).length;
    return {
      count: Math.max(0, capacity - existing),
      capacity: capacity,
      isFull: existing >= capacity
    };
  };

  const handleSlotSelect = (slot: TrainingSlot) => {
    const { isFull } = getSlotAvailability(slot.time);
    if (isFull) return;
    setFormData(prev => ({ ...prev, slotId: slot.id, slotTime: slot.time }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slotId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const id = await onSubmit(formData);
      setConfirmedBookingId(id);
      setView('success');
    } catch (err: any) {
      console.error("Submission error details:", err);
      alert(`Could not complete registration: ${err.message || "Unknown Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmedBookingId('');
    setFormData({
      clientName: '',
      companyName: '',
      phoneNumber: '',
      date: new Date().toISOString().split('T')[0],
      slotId: '',
      slotTime: ''
    });
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [calendarMonth]);

  const changeMonth = (offset: number) => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1));
  };

  const isSelected = (date: Date) => {
    const [year, month, day] = formData.date.split('-').map(Number);
    return date.getDate() === day && 
           date.getMonth() === (month - 1) && 
           date.getFullYear() === year;
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const formatDateLabel = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'essential': return { icon: PackageIcon, color: 'bg-blue-50 text-blue-600' };
      case 'standard': return { icon: Layers, color: 'bg-indigo-50 text-indigo-600' };
      case 'premium': return { icon: Crown, color: 'bg-amber-50 text-amber-600' };
      case 'mobile': return { icon: Smartphone, color: 'bg-emerald-50 text-emerald-600' };
      case 'geo': return { icon: Globe, color: 'bg-teal-50 text-teal-600' };
      case 'location': return { icon: MapPin, color: 'bg-rose-50 text-rose-600' };
      default: return { icon: Video, color: 'bg-slate-50 text-slate-600' };
    }
  };

  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const handlePackageClick = (tut: TutorialItem) => {
    const config = getIconForType(tut.iconType);
    setSelectedTutorial({
      title: tut.title,
      url: tut.url,
      desc: tut.description,
      icon: config.icon,
      color: config.color
    });
    setView('video-player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const packageTuts = systemSettings.tutorials.filter(t => t.category === 'package');
  const addonTuts = systemSettings.tutorials.filter(t => t.category === 'addon');

  const renderNav = () => (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setView('landing')}>
          <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
            Tipsoi
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-10">
          <button onClick={() => setView('landing')} className={`text-sm font-semibold ${view === 'landing' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Home</button>
          <button onClick={() => setView('tutorials')} className={`text-sm font-semibold ${view === 'tutorials' || view === 'video-player' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Tutorials</button>
          <button onClick={() => setView('booking')} className={`text-sm font-semibold ${view === 'booking' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>New Booking</button>
        </div>
        
        <button 
          onClick={onAdminClick} 
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          Admin Access
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {renderNav()}

      {view === 'landing' && (
        <main className="min-h-screen pt-40 pb-20 px-6 relative flex flex-col items-center">
          <div className="max-w-5xl text-center space-y-10">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight">
                Book Your <span className="text-indigo-600">Tipsoi HRM</span> <br />
                Software Training Session
              </h1>
              <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Streamlined booking for professional training sessions. Check real-time availability and book your slots instantly for your team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <button onClick={() => setView('booking')} className="group flex items-center space-x-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 active:scale-[0.98]">
                <span>Book a Slot Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setView('tutorials')} className="group flex items-center space-x-3 px-10 py-5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]">
                <PlayCircle size={20} className="text-indigo-600" />
                <span>Video Tutorials</span>
              </button>
            </div>
            <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-20 duration-1000">
              {[
                { title: 'Fixed Daily Slots', desc: '4 convenient sessions available daily for maximum flexibility.', icon: Clock, color: 'bg-indigo-50 text-indigo-600' },
                { title: 'Small Groups', desc: 'Limited capacity of 3 participants per slot to ensure quality.', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                { title: 'Instant Confirmation', desc: 'Get your booking ID immediately upon successful reservation.', icon: Zap, color: 'bg-indigo-50 text-indigo-600' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {view === 'tutorials' && (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-in fade-in duration-700">
          <div className="mb-12">
            <button onClick={() => setView('landing')} className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors group mb-8">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
            </button>
            
            <div className="space-y-24">
              <div className="space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="w-1.5 h-10 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Software Packages</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packageTuts.map((tut, i) => (
                    <button 
                      key={tut.id} 
                      onClick={() => handlePackageClick(tut)}
                      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col items-start text-left group hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.1)] transition-all hover:-translate-y-1 outline-none"
                    >
                      <div className={`w-16 h-16 ${getIconForType(tut.iconType).color} rounded-[1.5rem] flex items-center justify-center mb-8`}>
                        {React.createElement(getIconForType(tut.iconType).icon, { size: 32 })}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4">{tut.title}</h3>
                      <p className="text-base text-slate-500 leading-relaxed font-medium mb-12 flex-grow">{tut.description}</p>
                      <div className="inline-flex items-center text-indigo-600 font-black text-sm group-hover:underline">
                        Watch Tutorial <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Add-on Modules</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {addonTuts.map((tut) => (
                    <div key={tut.id} onClick={() => handlePackageClick(tut)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.05)] flex items-center justify-between group cursor-pointer hover:-translate-y-1 transition-all">
                      <div className="flex items-center space-x-5">
                        <div className={`w-14 h-14 ${getIconForType(tut.iconType).color} rounded-2xl flex items-center justify-center`}>
                          {React.createElement(getIconForType(tut.iconType).icon, { size: 24 })}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{tut.title}</h4>
                          <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest">Module Tutorial</span>
                        </div>
                      </div>
                      <ChevronRightIcon size={24} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'video-player' && selectedTutorial && (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <button onClick={() => { setView('tutorials'); setSelectedTutorial(null); }} className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Back to Tutorials</span>
            </button>
            <div className="flex items-center space-x-4">
               <div className={`w-12 h-12 ${selectedTutorial.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <selectedTutorial.icon size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTutorial.title}</h2>
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Interactive Training Session</p>
               </div>
            </div>
          </div>
          <div className="space-y-10">
            <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white relative group">
              {selectedTutorial.url ? (
                <iframe src={getEmbedUrl(selectedTutorial.url)} className="w-full h-full" title={selectedTutorial.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 p-10 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse"><Play size={40} className="text-white/40 ml-1" /></div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Tutorial Link Required</h3>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 text-slate-400"><Info size={18} /><h3 className="text-[11px] font-black uppercase tracking-widest">Session Overview</h3></div>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">{selectedTutorial.desc}</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'booking' && (
        <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto animate-in fade-in duration-700">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Training Registration</h1>
            <p className="text-slate-500 font-medium">Select your preferred date and time slot to continue.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Section: Selection */}
            <div className="lg:col-span-7 space-y-12">
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">1. Select Date</h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    readOnly 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    value={formatDateLabel(formData.date)} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 cursor-pointer shadow-sm hover:border-slate-300 transition-all" 
                  />
                  <CalendarIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
                  
                  {isCalendarOpen && (
                    <div ref={calendarRef} className="absolute top-full left-0 mt-2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-[110] animate-in fade-in slide-in-from-top-2">
                       <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-slate-800 uppercase">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex space-x-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronLeft size={16} /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500"><ChevronRight size={16} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, idx) => (
                          <div key={idx} className="aspect-square flex items-center justify-center">
                            {date ? (
                              <button 
                                type="button" 
                                disabled={isPast(date)} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setFormData({ ...formData, date: date.toISOString().split('T')[0], slotId: '', slotTime: '' }); 
                                  setIsCalendarOpen(false); 
                                }} 
                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${isSelected(date) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isPast(date) ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-indigo-50 text-slate-600'}`}
                              >
                                {date.getDate()}
                              </button>
                            ) : <div className="w-10 h-10" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">2. Choose Time Slot</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slots.map((slot) => {
                    const { count, capacity, isFull } = getSlotAvailability(slot.time);
                    const isSelectedSlot = formData.slotId === slot.id;
                    return (
                      <button 
                        key={slot.id} 
                        type="button" 
                        disabled={!slot.isActive || isFull} 
                        onClick={() => handleSlotSelect(slot)} 
                        className={`p-10 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-3 ${isSelectedSlot ? 'bg-white border-indigo-600 ring-2 ring-indigo-600 ring-offset-0 shadow-lg' : isFull ? 'bg-slate-100 border-slate-100 opacity-60 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}
                      >
                        <span className="text-xl font-bold text-slate-900">{slot.time}</span>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isSelectedSlot ? 'bg-emerald-50 text-emerald-600' : isFull ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isFull ? 'FULLY BOOKED' : `${count}/${capacity} available`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Section: Form */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-28">
                <h2 className="text-lg font-bold text-slate-800 mb-8 tracking-tight">Company Information</h2>
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Company Name *</label>
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Acme Corp" 
                        className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300" 
                        value={formData.companyName} 
                        onChange={e => setFormData({...formData, companyName: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Contact Person *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300" 
                      value={formData.clientName} 
                      onChange={e => setFormData({...formData, clientName: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Phone Number *</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="01XXXXXXXXX" 
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300" 
                      value={formData.phoneNumber} 
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      disabled={!formData.slotId || isSubmitting} 
                      type="submit" 
                      className="w-full py-5 bg-slate-300 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center space-x-2 disabled:bg-slate-200 enabled:bg-slate-900 enabled:hover:bg-slate-800"
                    >
                      {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (
                        <>
                          <span>Complete Booking</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                    {!formData.slotId && (
                      <p className="text-center text-[11px] font-bold text-slate-400 italic">Please select a time slot first</p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'success' && (
        <main className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
           <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
             
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <CheckCircle2 size={48} className="animate-in zoom-in-50 duration-500 delay-200" />
                <PartyPopper size={20} className="absolute -top-1 -right-1 text-amber-500 animate-bounce" />
             </div>
             
             <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Booking <br /><span className="text-emerald-500">Confirmed!</span></h2>
             
             <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left space-y-4 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</span>
                   <span className="text-xs font-mono font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{confirmedBookingId}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Date</span>
                      <span className="text-xs font-bold text-slate-700">{formatDateLabel(formData.date)}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time Slot</span>
                      <span className="text-xs font-bold text-slate-700">{formData.slotTime}</span>
                   </div>
                </div>
             </div>
             
             <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
               Your registration is now pending review. Our coordinator will contact you shortly at <span className="text-slate-900 font-bold">{formData.phoneNumber}</span>.
             </p>
             
             <div className="flex flex-col space-y-3">
                <button onClick={resetForm} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center group shadow-xl shadow-slate-900/10">
                   <Home size={14} className="mr-2" />
                   Return to Homepage
                </button>
             </div>
           </div>
        </main>
      )}
    </div>
  );
};

export default PublicBookingPage;
