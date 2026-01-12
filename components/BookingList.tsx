
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrainingBooking, BookingStatus } from '../types';
import { 
  Search, 
  Plus, 
  Edit3,
  Trash2,
  Clock,
  Briefcase,
  Package as PackageIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar as CalendarIcon,
  X,
  Filter,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

interface BookingListProps {
  bookings: TrainingBooking[];
  onAdd: () => void;
  onEdit: (booking: TrainingBooking) => void;
  onDelete: (id: string) => void;
}

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingList: React.FC<BookingListProps> = ({ bookings, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Date Range States
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [activeRangePicker, setActiveRangePicker] = useState<'start' | 'end' | null>(null);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        // Only close if we're not interacting with the nested range picker
        if (rangePickerRef.current && rangePickerRef.current.contains(event.target as Node)) return;
        setIsMoreOpen(false);
        setActiveRangePicker(null);
      }
      if (rangePickerRef.current && !rangePickerRef.current.contains(event.target as Node)) {
         setActiveRangePicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Utility to convert 24h time to 12h AM/PM
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  // Utility to format date for list
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calendar Logic for picking days
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const getCalendarDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = startDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, dateStr: '' });
    }
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  };

  const calendarData = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const rangeCalendarData = useMemo(() => getCalendarDays(rangeCalendarMonth), [rangeCalendarMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const changeRangeMonth = (offset: number) => {
    setRangeCalendarMonth(new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() + offset, 1));
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.DONE: return 'bg-green-50 text-green-700 border-green-100';
      case BookingStatus.TODO: return 'bg-blue-50 text-blue-700 border-blue-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleApplyRange = () => {
    if (rangeStartDate && rangeEndDate) {
      setIsRangeActive(true);
      setIsMoreOpen(false);
    }
  };

  const handleClearRange = () => {
    setRangeStartDate('');
    setRangeEndDate('');
    setIsRangeActive(false);
    setActiveRangePicker(null);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = false;
    if (isRangeActive && rangeStartDate && rangeEndDate) {
      matchesDate = b.date >= rangeStartDate && b.date <= rangeEndDate;
    } else {
      matchesDate = b.date === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  const hasBookingsOnDate = (dateStr: string) => bookings.some(b => b.date === dateStr);

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Training Bookings</h2>
          <p className="text-slate-500 text-sm font-medium">Manage and track your corporate training sessions</p>
        </div>
        <button 
          onClick={onAdd}
          className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add New Booking
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Advanced Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center gap-4 relative z-20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Client, or Package..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm bg-white"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto relative">
            {/* Main Date Filter Trigger */}
            <button 
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                setIsMoreOpen(false);
              }}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                isCalendarOpen ? 'bg-blue-600 text-white border-blue-600' : (isRangeActive ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')
              }`}
            >
              <CalendarIcon size={18} />
              <span className="whitespace-nowrap">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </button>

            {/* Small Floating Calendar for Single Date */}
            {isCalendarOpen && (
              <div 
                ref={calendarRef}
                className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex space-x-1">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={16}/></button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={16}/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarData.map((data, idx) => (
                    <div key={idx} className="aspect-square flex items-center justify-center">
                      {data.day && (
                        <button
                          onClick={() => {
                            setSelectedDate(data.dateStr);
                            setIsCalendarOpen(false);
                            setIsRangeActive(false);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center ${
                            selectedDate === data.dateStr && !isRangeActive
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {data.day}
                          {hasBookingsOnDate(data.dateStr) && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${selectedDate === data.dateStr && !isRangeActive ? 'bg-white' : 'bg-blue-400'}`}></span>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                  <button 
                    onClick={() => {
                      setSelectedDate(getLocalDateString());
                      setIsRangeActive(false);
                      setIsCalendarOpen(false);
                    }}
                    className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="relative" ref={moreRef}>
              <button 
                onClick={() => {
                  setIsMoreOpen(!isMoreOpen);
                  setIsCalendarOpen(false);
                  setActiveRangePicker(null);
                }}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl border transition-all text-sm font-bold shadow-sm ${
                  isMoreOpen || isRangeActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} className="mr-2" />
                More
              </button>

              {/* Advanced Filter Panel */}
              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Advanced Search</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range Filter</p>
                      <div className="grid grid-cols-2 gap-2">
                        {/* FROM DATE PICKER */}
                        <div className="space-y-1 relative">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">From</label>
                          <button 
                            type="button"
                            onClick={() => {
                              setActiveRangePicker(activeRangePicker === 'start' ? null : 'start');
                              if (rangeStartDate) setRangeCalendarMonth(new Date(rangeStartDate));
                            }}
                            className={`w-full px-3 py-2 rounded-lg border text-left text-[11px] font-bold outline-none transition-all ${
                              activeRangePicker === 'start' ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={rangeStartDate ? 'text-slate-800' : 'text-slate-400'}>
                              {rangeStartDate ? formatDateDisplay(rangeStartDate) : 'Select Date'}
                            </span>
                          </button>

                          {/* NESTED MINI CALENDAR FOR 'FROM' */}
                          {activeRangePicker === 'start' && (
                            <div ref={rangePickerRef} className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                                  {rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                </span>
                                <div className="flex space-x-1">
                                  <button type="button" onClick={() => changeRangeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={14}/></button>
                                  <button type="button" onClick={() => changeRangeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={14}/></button>
                                </div>
                              </div>
                              <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                  <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-0.5">
                                {rangeCalendarData.map((data, idx) => (
                                  <div key={idx} className="aspect-square flex items-center justify-center">
                                    {data.day && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRangeStartDate(data.dateStr);
                                          setActiveRangePicker(null);
                                        }}
                                        className={`w-6 h-6 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                                          rangeStartDate === data.dateStr ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {data.day}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* TO DATE PICKER */}
                        <div className="space-y-1 relative">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">To</label>
                          <button 
                            type="button"
                            onClick={() => {
                              setActiveRangePicker(activeRangePicker === 'end' ? null : 'end');
                              if (rangeEndDate) setRangeCalendarMonth(new Date(rangeEndDate));
                            }}
                            className={`w-full px-3 py-2 rounded-lg border text-left text-[11px] font-bold outline-none transition-all ${
                              activeRangePicker === 'end' ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={rangeEndDate ? 'text-slate-800' : 'text-slate-400'}>
                              {rangeEndDate ? formatDateDisplay(rangeEndDate) : 'Select Date'}
                            </span>
                          </button>

                          {/* NESTED MINI CALENDAR FOR 'TO' */}
                          {activeRangePicker === 'end' && (
                            <div ref={rangePickerRef} className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                                  {rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                </span>
                                <div className="flex space-x-1">
                                  <button type="button" onClick={() => changeRangeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={14}/></button>
                                  <button type="button" onClick={() => changeRangeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={14}/></button>
                                </div>
                              </div>
                              <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                  <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-0.5">
                                {rangeCalendarData.map((data, idx) => (
                                  <div key={idx} className="aspect-square flex items-center justify-center">
                                    {data.day && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRangeEndDate(data.dateStr);
                                          setActiveRangePicker(null);
                                        }}
                                        className={`w-6 h-6 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                                          rangeEndDate === data.dateStr ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {data.day}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleClearRange}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center"
                    >
                      <RotateCcw size={12} className="mr-2" /> Reset
                    </button>
                    <button 
                      onClick={handleApplyRange}
                      disabled={!rangeStartDate || !rangeEndDate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Check size={12} className="mr-2" /> Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Date/Range Indicator Banner */}
        <div className={`px-6 py-2.5 border-b border-slate-100 flex items-center justify-between ${isRangeActive ? 'bg-slate-900 text-white' : 'bg-blue-50/50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRangeActive ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isRangeActive ? 'text-blue-200' : 'text-blue-700'}`}>
              {isRangeActive 
                ? `Results for Period: ${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}`
                : `Schedule for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-3">
             {isRangeActive && (
               <button onClick={handleClearRange} className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors">
                 Clear Filter
               </button>
             )}
             <span className={`text-[10px] font-bold uppercase ${isRangeActive ? 'text-slate-400' : 'text-slate-400'}`}>
               {filteredBookings.length} Entry Found
             </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Client Information</th>
                <th className="px-6 py-4">Assigned Professional</th>
                <th className="px-6 py-4">Package Plan</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <Briefcase size={14} className="mr-2 text-slate-400" />
                      {booking.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-700">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center mr-2 text-[10px] font-black text-blue-600 border border-blue-200">
                        {booking.assignedPerson.charAt(0)}
                      </div>
                      <span className="font-semibold">{booking.assignedPerson}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <PackageIcon size={14} className="mr-2 text-slate-400" />
                      {booking.package}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-[10px] font-bold text-slate-600">
                      <span className="text-slate-400 uppercase tracking-tighter mb-0.5">
                        {formatDateDisplay(booking.date)}
                      </span>
                      <span className="flex items-center text-slate-900 text-[11px]">
                        <Clock size={12} className="mr-1.5 text-blue-500" /> 
                        {formatTime12h(booking.startTime)}
                      </span>
                      <span className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-[8px]">
                        {booking.duration} hr session
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border inline-block min-w-[70px] text-center ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => onEdit(booking)}
                        className="p-2 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                        title="Edit Booking"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(booking.id)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                        title="Delete Booking"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Info size={32} className="text-slate-200" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">Empty Schedule</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
                {isRangeActive 
                  ? "No records found within the specified date range."
                  : "There are no training sessions booked for this specific date."
                }
              </p>
              <button 
                onClick={() => {
                  setSelectedDate(getLocalDateString());
                  handleClearRange();
                }}
                className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100 shadow-inner">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Confirm Deletion</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Are you sure you want to remove this training record <span className="text-slate-900 font-bold">({deleteConfirmId})</span>? 
                This action is irreversible and will remove all associated cloud data.
              </p>
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-sm"
              >
                No, Keep it
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
