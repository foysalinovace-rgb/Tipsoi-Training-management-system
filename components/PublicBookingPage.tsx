import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle, 
  Video, 
  ArrowLeft, 
  Clock, 
  Package as PackageIcon, 
  Crown, 
  Smartphone, 
  Globe, 
  MapPin, 
  ChevronRight as ChevronRightIcon, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Play, 
  Loader2,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  MousePointerClick,
  Monitor,
  Info,
  Box,
  Layers as LayersIcon,
  ChevronRight as ArrowRightIcon,
  XCircle
} from 'lucide-react';
import { TrainingSlot, TrainingBooking, SystemSettings, TutorialItem, BookingStatus } from '../types';

interface PublicBookingPageProps {
  slots: TrainingSlot[];
  bookings: TrainingBooking[];
  onSubmit: (data: any) => Promise<string | any>;
  onAdminClick: () => void;
  systemSettings: SystemSettings;
}

const toLocalISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const normalizeTime = (timeStr: string): string => {
  if (!timeStr) return "00:00";
  const cleaned = timeStr.trim().toUpperCase();
  const match12 = cleaned.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  const match24 = cleaned.match(/(\d+):(\d+)/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return cleaned;
};

const DEFAULT_TIMES = ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'];

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ slots, bookings, onSubmit, onAdminClick, systemSettings }) => {
  const [view, setView] = useState<'landing' | 'booking' | 'tutorials' | 'video-player' | 'success'>('landing');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    clientName: '', 
    companyName: '',
    phoneNumber: '',
    date: toLocalISO(new Date()),
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

  const currentDaySlots = useMemo(() => {
    const daySlots = slots.filter(s => s.date === formData.date);
    if (daySlots.length === 0) {
      return DEFAULT_TIMES.map((time, idx) => ({
        id: `default-${formData.date}-${idx}`,
        time,
        isActive: true,
        capacity: systemSettings.slotCapacity || 2,
        date: formData.date,
        isVirtual: true
      }));
    }
    return daySlots;
  }, [slots, formData.date, systemSettings.slotCapacity]);

  const getSlotAvailability = (slot: TrainingSlot) => {
    if (!formData || !formData.date) return { count: 0, capacity: 2, isFull: true };
    if (!slot.isActive) return { count: 0, capacity: slot.capacity, isFull: true, isDeactivated: true };
    const capacity = slot.capacity || systemSettings.slotCapacity || 2;
    const normalizedSlotTime = normalizeTime(slot.time);
    const existing = bookings.filter(b => {
      const isCancelled = b.status === BookingStatus.CANCELLED;
      return b.date === formData.date && normalizeTime(b.startTime) === normalizedSlotTime && !isCancelled;
    }).length;
    const availableCount = Math.max(0, capacity - existing);
    return { count: availableCount, capacity: capacity, isFull: availableCount <= 0, isDeactivated: false };
  };

  const handleSlotSelect = (slot: TrainingSlot) => {
    const { isFull, isDeactivated } = getSlotAvailability(slot);
    if (isFull || isDeactivated) return;
    setFormData(prev => ({ ...prev, slotId: slot.id, slotTime: slot.time }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slotId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, clientName: formData.companyName });
      setView('success');
    } catch (err: any) {
      console.error("Submission Error:", err);
      alert(`Error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      companyName: '',
      phoneNumber: '',
      date: toLocalISO(new Date()),
      slotId: '',
      slotTime: ''
    });
    setView('landing');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'essential': return <Box size={24} className="text-indigo-600" />;
      case 'standard': return <LayersIcon size={24} className="text-indigo-600" />;
      case 'premium': return <Crown size={24} className="text-amber-500" />;
      case 'mobile': return <Smartphone size={22} className="text-[#10B981]" />;
      case 'geo': return <Smartphone size={22} className="text-[#10B981]" />;
      case 'location': return <MapPin size={22} className="text-rose-500" />;
      default: return <Video size={22} />;
    }
  };

  const tutorialsByType = useMemo(() => {
    const tuts = systemSettings.tutorials || [];
    return {
      packages: tuts.filter(t => t.category === 'package'),
      addons: tuts.filter(t => t.category === 'addon')
    };
  }, [systemSettings.tutorials]);

  const handlePlayVideo = (url: string) => {
    if (!url) {
      alert("Tutorial video URL not configured for this module.");
      return;
    }
    setActiveVideoUrl(url);
    setView('video-player');
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const start = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < start; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(new Date(year, month, i));
    return days;
  }, [calendarMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="text-2xl font-black text-slate-900 tracking-tighter hover:text-indigo-600 transition-colors" onClick={() => setView('landing')}>
            TIPSOI<span className="text-indigo-600">.</span>
          </button>
          <div className="flex items-center space-x-4">
            <button onClick={onAdminClick} className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Admin Access
            </button>
          </div>
        </div>
      </nav>

      {view === 'landing' && (
        <main className="relative z-10">
          <section className="min-h-[90vh] pt-48 pb-20 px-6 flex flex-col items-center text-center">
            <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-2">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Bangladesh’s No. 1 HRM System</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Tipsoi HRM</span> <br /> Software Training Session
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                Streamlined booking for professional training sessions. Check real-time availability and book your slots instantly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                <button 
                  onClick={() => setView('booking')} 
                  className="group relative px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Book your Slot Now <ArrowRight size={22} className="ml-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button 
                  onClick={() => setView('tutorials')} 
                  className="px-12 py-6 bg-white border border-slate-200 text-slate-700 rounded-[2rem] font-black text-lg flex items-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <PlayCircle size={24} className="mr-3 text-indigo-600" /> 
                  Watch Tutorials
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {view === 'tutorials' && (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-12"
          >
            <ChevronLeft size={16} className="mr-1" /> BACK TO HOME
          </button>

          <div className="space-y-24">
            {/* Software Packages Section */}
            <div className="space-y-12">
              <div className="flex items-center space-x-5">
                <div className="w-1.5 h-10 bg-indigo-600 rounded-full"></div>
                <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">Software Packages</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tutorialsByType.packages.map((tut, idx) => (
                  <div 
                    key={tut.id} 
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all group flex flex-col items-start h-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both cursor-pointer"
                    onClick={() => handlePlayVideo(tut.url)}
                  >
                    <div className="w-20 h-20 bg-[#F1F5F9] rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-500">
                      {getIconForType(tut.iconType)}
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-[#1E293B]">{tut.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-12 flex-grow text-sm">{tut.description}</p>
                    <button 
                      className="inline-flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors group/btn"
                    >
                      Watch Tutorial <ArrowRightIcon size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-on Modules Section */}
            <div className="space-y-12">
              <div className="flex items-center space-x-5">
                <div className="w-1.5 h-10 bg-[#10B981] rounded-full"></div>
                <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">Add-on Modules</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tutorialsByType.addons.map((tut, idx) => (
                  <button 
                    key={tut.id}
                    onClick={() => handlePlayVideo(tut.url)}
                    style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                    className="bg-white p-7 rounded-[2.25rem] border border-slate-50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all flex items-center justify-between group animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${tut.iconType === 'location' ? 'bg-rose-50' : 'bg-[#ECFDF5]'}`}>
                        {getIconForType(tut.iconType)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-black text-[#1E293B] leading-tight mb-1">{tut.title}</h4>
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.15em]">MODULE TUTORIAL</span>
                      </div>
                    </div>
                    <ChevronRightIcon size={22} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'video-player' && (
        <main className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setView('tutorials')}
              className="absolute top-6 right-6 z-[210] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
            >
              <XCircle size={24} />
            </button>
            {activeVideoUrl ? (
               <iframe 
                src={activeVideoUrl.includes('youtube.com') 
                  ? activeVideoUrl.replace('watch?v=', 'embed/') + '?autoplay=1'
                  : activeVideoUrl
                }
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <Video size={64} className="mb-4 text-slate-700" />
                <p className="text-lg font-bold">Video not available</p>
              </div>
            )}
          </div>
        </main>
      )}

      {view === 'booking' && (
        <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Training Registration</h2>
            <p className="text-base text-slate-500 font-medium">Select your preferred date and time slot to continue.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4" ref={calendarRef}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">1. Select Date</h3>
                <div className="relative max-w-lg">
                  <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 font-bold text-sm cursor-pointer shadow-sm flex items-center justify-between hover:border-indigo-500 transition-all"
                  >
                    <span className="text-slate-800">
                      {new Date(formData.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </span>
                    <CalendarIcon size={18} className="text-slate-800" />
                  </button>

                  {isCalendarOpen && (
                    <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 p-8 z-50 animate-in zoom-in-95">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-base font-black">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex space-x-2">
                          <button type="button" className="p-2 hover:bg-slate-50 rounded-xl" onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth()-1)))}><ChevronLeft size={18}/></button>
                          <button type="button" className="p-2 hover:bg-slate-50 rounded-xl" onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth()+1)))}><ChevronRight size={18}/></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center font-black text-[9px] text-slate-300 uppercase mb-4">{['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}</div>
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, idx) => {
                          const isPast = date && date < today;
                          return (
                            <div key={idx} className="aspect-square flex items-center justify-center">
                              {date ? (
                                <button 
                                  disabled={isPast || false}
                                  onClick={() => { setFormData({...formData, date: toLocalISO(date), slotId: '', slotTime: ''}); setIsCalendarOpen(false); }} 
                                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                    formData.date === toLocalISO(date) 
                                      ? 'bg-indigo-600 text-white shadow-lg' 
                                      : isPast 
                                        ? 'text-slate-200 cursor-not-allowed' 
                                        : 'hover:bg-indigo-50 text-slate-600'
                                  }`}
                                >
                                  {date.getDate()}
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">2. Choose Time Slot</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentDaySlots.map(slot => {
                    const { count, capacity, isFull, isDeactivated } = getSlotAvailability(slot);
                    const isSelected = formData.slotId === slot.id;
                    return (
                      <button 
                        key={slot.id} 
                        disabled={isFull || isDeactivated} 
                        onClick={() => handleSlotSelect(slot)} 
                        className={`p-10 rounded-2xl border transition-all relative flex flex-col items-center justify-center space-y-2 ${
                          isSelected 
                            ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-md' 
                            : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200'
                        }`}
                      >
                        <span className="text-2xl font-bold text-slate-900">{slot.time}</span>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDeactivated ? 'bg-red-50 text-red-500' : (isFull ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-500')
                        }`}>
                          {isDeactivated ? 'Disabled' : (isFull ? 'Full' : `${count}/${capacity} available`)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleFinalSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Company Information</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Company Name *</label>
                    <input 
                      required 
                      placeholder="e.g. Acme Corp" 
                      className="w-full px-5 py-4 rounded-xl bg-[#F8FAFC] border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium" 
                      value={formData.companyName} 
                      onChange={e => setFormData({...formData, companyName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Phone Number *</label>
                    <input 
                      required 
                      type="tel"
                      placeholder="01XXXXXXXXX" 
                      className="w-full px-5 py-4 rounded-xl bg-[#F8FAFC] border-transparent focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium" 
                      value={formData.phoneNumber} 
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!formData.slotId || isSubmitting || !formData.companyName || !formData.phoneNumber} 
                  className="w-full py-5 bg-[#121926] text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all active:scale-95 mt-4"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Complete Booking</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {view === 'success' && (
        <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border border-slate-100 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4 text-slate-900">Booking Confirmed!</h2>
            <p className="text-base text-slate-500 font-medium mb-10 leading-relaxed">
              Your session for <span className="text-slate-900 font-bold">{formData.companyName}</span> has been locked in. Our team will contact you shortly.
            </p>
            <button onClick={resetForm} className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95">Back to Home</button>
          </div>
        </main>
      )}
    </div>
  );
};

export default PublicBookingPage;