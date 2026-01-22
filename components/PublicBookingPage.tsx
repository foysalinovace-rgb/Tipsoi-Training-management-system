
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
  Layers
} from 'lucide-react';
import { TrainingSlot, TrainingBooking, SystemSettings } from '../types';

interface PublicBookingPageProps {
  slots: TrainingSlot[];
  bookings: TrainingBooking[];
  onSubmit: (data: any) => Promise<any>;
  onAdminClick: () => void;
  systemSettings: SystemSettings;
}

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ slots, bookings, onSubmit, onAdminClick, systemSettings }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Custom Calendar State
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

  // Detect click outside to close calendar
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
    if (!formData || !formData.date) return { count: 0, isFull: true };
    const existing = bookings.filter(b => b.date === formData.date && b.startTime === slotTime).length;
    const capacity = systemSettings.slotCapacity || 2;
    return {
      count: Math.max(0, capacity - existing),
      isFull: existing >= capacity
    };
  };

  const handleSlotSelect = (slot: TrainingSlot) => {
    const { isFull } = getSlotAvailability(slot.time);
    if (isFull) return;
    setFormData(prev => ({ ...prev, slotId: slot.id, slotTime: slot.time }));
  };

  const handleFinalSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setShowConfirmPopup(false);
    } catch (err: any) {
      console.error("Submission error details:", err);
      alert(`Could not complete registration: ${err.message || "Unknown Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowConfirmPopup(false);
    setSuccess(false);
    setFormData({
      clientName: '',
      companyName: '',
      phoneNumber: '',
      date: new Date().toISOString().split('T')[0],
      slotId: '',
      slotTime: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calendar Helper Functions
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [calendarMonth]);

  const changeMonth = (offset: number) => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
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
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Success Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[160px]"></div>
        </div>
        
        <div className="max-w-md w-full bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] p-10 text-center animate-in zoom-in-95 duration-700 relative z-10">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Reservation Logged</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-8 leading-loose">
            Successfully scheduled for <span className="text-slate-900">{formData.companyName}</span><br/>
            On <span className="text-blue-600">{formData.date}</span> @ <span className="text-blue-600">{formData.slotTime}</span>
          </p>
          <button 
            onClick={resetForm} 
            className="group w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl shadow-slate-900/10"
          >
            New Session
            <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Soft Light Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[120px] animate-pulse opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* Modern Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] block leading-none text-slate-900">{systemSettings.panelName}</span>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1 block opacity-80">Official Partner</span>
            </div>
          </div>
          
          <button 
            onClick={onAdminClick} 
            className="group flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <LogIn size={12} className="group-hover:rotate-12 transition-transform" />
            <span>Staff Portal</span>
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Information Section */}
          <div className="lg:col-span-6 space-y-10 pt-4">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                <Sparkles size={12} className="animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bangladesh's #1 HRM Solution</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight uppercase">
                Book Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Tipsoi HRM</span> <br />
                Training.
              </h1>
              
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md uppercase tracking-wide">
                Tipsoi is the pioneer of smart attendance and automated HR systems in Bangladesh. Empower your organization with our expert-led training sessions.
              </p>
            </div>

            {/* Feature Bento Tiles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Fingerprint size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-widest">Smart IoT</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Real-time biometrics</p>
              </div>
              <div className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Cpu size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-widest">Automation</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Zero-error payroll</p>
              </div>
              <div className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-widest">Analytics</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Insightful HR reports</p>
              </div>
              <div className="p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-purple-200 transition-all group shadow-sm">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Cloud size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-widest">Scalability</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Cloud-ready infrastructure</p>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Session Entry Box */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            {/* Blue Glow Backdrop */}
            <div className="absolute -inset-10 bg-blue-500/10 rounded-[4rem] blur-[100px] opacity-70 pointer-events-none"></div>
            
            {/* Resized Container: w-full max-w-[400px] for a more compact form factor */}
            <div className="relative w-full max-w-[400px] bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] border border-blue-50 overflow-hidden ring-1 ring-blue-100/30 group/box">
              
              {/* Box Header - Compact */}
              <div className="px-6 py-5 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover/box:rotate-6 transition-transform">
                    <Zap size={16} fill="white" />
                  </div>
                  <div>
                    <h2 className="text-slate-900 text-[10px] font-black tracking-[0.2em] uppercase">
                      Session Entry
                    </h2>
                    <p className="text-[6px] font-black text-blue-500 uppercase tracking-widest mt-0.5 opacity-60">Secured Node</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                </div>
              </div>

              <div className="p-7">
                <form onSubmit={(e) => { e.preventDefault(); if (formData.slotId) setShowConfirmPopup(true); }} className="space-y-6">
                  <div className="space-y-6">
                    {/* Identification Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <User size={12} strokeWidth={3} />
                        <h3 className="text-[8px] font-black uppercase tracking-[0.15em]">Contact</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          { label: 'Coordinator Name', key: 'clientName', placeholder: ' Sarah Jenkins', type: 'text' },
                          { label: 'Company Name', key: 'companyName', placeholder: ' Organization', type: 'text' },
                          { label: 'Primary Contact', key: 'phoneNumber', placeholder: ' +880 000 0000', type: 'tel' }
                        ].map(field => (
                          <div key={field.key} className="relative group/input">
                            <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within/input:text-blue-600 transition-colors">{field.label}</label>
                            <input 
                              required 
                              type={field.type} 
                              placeholder={field.placeholder} 
                              className="w-full px-1 py-1 bg-transparent border-b border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-900 transition-all placeholder:text-slate-200 focus:pl-2" 
                              value={(formData as any)[field.key]} 
                              onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <CalendarIcon size={12} strokeWidth={3} />
                        <h3 className="text-[8px] font-black uppercase tracking-[0.15em]">Timeline</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="relative group/input">
                          <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within/input:text-blue-600 transition-colors">Target Date</label>
                          <button
                            type="button"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className="w-full flex items-center justify-between py-1 bg-transparent border-b border-slate-200 focus:border-blue-600 outline-none text-xs font-bold text-slate-900 transition-all hover:text-blue-600 text-left hover:pl-2"
                          >
                            <span>{formatDateLabel(formData.date)}</span>
                            <CalendarIcon size={12} className="text-blue-400" />
                          </button>

                          {/* Float Calendar Dropdown - Compact */}
                          {isCalendarOpen && (
                            <div 
                              ref={calendarRef}
                              className="absolute top-full left-0 mt-2 w-full bg-white rounded-[1.5rem] shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-blue-50 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                                  {calendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                </span>
                                <div className="flex space-x-1">
                                  <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><ChevronLeft size={14} /></button>
                                  <button type="button" onClick={() => changeMonth(1)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><ChevronRight size={14} /></button>
                                </div>
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[7px] font-black text-slate-300 uppercase">{d}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1.5">
                                {calendarDays.map((date, idx) => (
                                  <div key={idx} className="aspect-square flex items-center justify-center">
                                    {date ? (
                                      <button
                                        type="button"
                                        disabled={isPast(date)}
                                        onClick={() => {
                                          setFormData({ ...formData, date: date.toISOString().split('T')[0], slotId: '', slotTime: '' });
                                          setIsCalendarOpen(false);
                                        }}
                                        className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all relative flex items-center justify-center ${
                                          isSelected(date) 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                            : isPast(date) 
                                              ? 'text-slate-200' 
                                              : 'hover:bg-blue-50 text-slate-600'
                                        }`}
                                      >
                                        {date.getDate()}
                                      </button>
                                    ) : <div className="w-7 h-7" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Time Frame</label>
                          <div className="grid grid-cols-2 gap-2">
                            {slots.map((slot) => {
                              const { count, isFull } = getSlotAvailability(slot.time);
                              const isSelectedSlot = formData.slotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={!slot.isActive || isFull}
                                  onClick={() => handleSlotSelect(slot)}
                                  className={`p-3 rounded-xl border-2 transition-all relative flex flex-col items-center justify-center space-y-0.5 ${
                                    isSelectedSlot 
                                      ? 'bg-slate-900 border-slate-900 text-white scale-[1.03] shadow-md' 
                                      : isFull 
                                        ? 'bg-slate-50 border-slate-50 text-slate-200' 
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'
                                  }`}
                                >
                                  <span className="text-[10px] font-black uppercase tracking-tight">{slot.time}</span>
                                  <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-full ${isSelectedSlot ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                                    {isFull ? 'LOCK' : `${count} LEFT`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button 
                      disabled={!formData.slotId || isSubmitting} 
                      type="submit" 
                      className="w-[65%] py-8 bg-slate-900 text-white rounded-[1.25rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:scale-[1.02] shadow-[0_24px_48px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center group/btn"
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Confirm
                          <ArrowRight size={14} className="ml-3 group-hover/btn:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[6px] font-black text-slate-300 uppercase tracking-widest text-center">Encrypted Connection Active</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Verification Receipt Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.25)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <button onClick={() => setShowConfirmPopup(false)} className="absolute top-8 right-8 p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={16} /></button>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[1.2rem] flex items-center justify-center mb-6 border border-blue-100 shadow-sm"><MousePointer2 size={24} /></div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Please verify your submission</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Entity</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">{formData.companyName}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
                  <span className="text-xs font-bold text-blue-600 block">{formData.date}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Contact</span>
                  <span className="text-xs font-bold text-slate-900 block">{formData.clientName}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Slot</span>
                  <span className="text-xs font-bold text-blue-600 block">{formData.slotTime}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 shadow-xl flex items-center justify-center transition-all active:scale-95 disabled:bg-slate-300">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin mr-3" /> : 'Submit'}
                </button>
                <button disabled={isSubmitting} onClick={() => setShowConfirmPopup(false)} className="w-full py-2 text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Return to Interface</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </div>
  );
};

export default PublicBookingPage;
