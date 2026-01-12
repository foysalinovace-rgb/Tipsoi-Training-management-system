
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
  
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [activeRangePicker, setActiveRangePicker] = useState<'start' | 'end' | null>(null);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
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

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCalendarDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push({ day: null, dateStr: '' });
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  };

  const calendarData = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const rangeCalendarData = useMemo(() => getCalendarDays(rangeCalendarMonth), [rangeCalendarMonth]);

  const changeMonth = (offset: number) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  const changeRangeMonth = (offset: number) => setRangeCalendarMonth(new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() + offset, 1));

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.DONE: return 'bg-green-50 text-green-700 border-green-100';
      case BookingStatus.TODO: return 'bg-blue-50 text-blue-700 border-blue-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = isRangeActive && rangeStartDate && rangeEndDate 
      ? b.date >= rangeStartDate && b.date <= rangeEndDate 
      : b.date === selectedDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Training Bookings</h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Manage corporate training sessions</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          New Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Responsive Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row items-center gap-3 relative z-20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Client, or Package..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm bg-white font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <button 
                onClick={() => { setIsCalendarOpen(!isCalendarOpen); setIsMoreOpen(false); }}
                className={`w-full lg:w-auto flex items-center justify-center space-x-3 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                  isCalendarOpen ? 'bg-blue-600 text-white border-blue-600' : (isRangeActive ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')
                }`}
              >
                <CalendarIcon size={16} />
                <span className="whitespace-nowrap">{formatDateDisplay(selectedDate)}</span>
              </button>

              {isCalendarOpen && (
                <div ref={calendarRef} className="absolute top-full right-0 lg:left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <div className="flex space-x-1">
                      <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={16}/></button>
                      <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={16}/></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[9px] font-black text-slate-300 uppercase">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((data, idx) => (
                      <div key={idx} className="aspect-square flex items-center justify-center">
                        {data.day && (
                          <button
                            onClick={() => { setSelectedDate(data.dateStr); setIsCalendarOpen(false); setIsRangeActive(false); }}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${selectedDate === data.dateStr && !isRangeActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
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

            <div className="relative flex-1 lg:flex-none" ref={moreRef}>
              <button 
                onClick={() => { setIsMoreOpen(!isMoreOpen); setIsCalendarOpen(false); }}
                className={`w-full lg:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all text-xs font-bold shadow-sm ${
                  isMoreOpen || isRangeActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} className="mr-2" />
                Filter
              </button>

              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Advanced Filter</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1 relative">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Start Date</label>
                        <button 
                          onClick={() => setActiveRangePicker(activeRangePicker === 'start' ? null : 'start')}
                          className="w-full px-3 py-2 rounded-lg border text-left text-xs font-bold bg-white"
                        >
                          {rangeStartDate ? formatDateDisplay(rangeStartDate) : 'Select Start'}
                        </button>
                        {activeRangePicker === 'start' && (
                          <div ref={rangePickerRef} className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60]">
                            {/* Simplified Calendar Rendering */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase">{rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                              <div className="flex space-x-1">
                                <button onClick={() => changeRangeMonth(-1)}><ChevronLeft size={14}/></button>
                                <button onClick={() => changeRangeMonth(1)}><ChevronRight size={14}/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 text-center">
                              {getCalendarDays(rangeCalendarMonth).map((d, i) => d.day && (
                                <button key={i} onClick={() => { setRangeStartDate(d.dateStr); setActiveRangePicker(null); }} className={`w-6 h-6 rounded text-[10px] font-bold ${rangeStartDate === d.dateStr ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                  {d.day}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">End Date</label>
                        <button 
                          onClick={() => setActiveRangePicker(activeRangePicker === 'end' ? null : 'end')}
                          className="w-full px-3 py-2 rounded-lg border text-left text-xs font-bold bg-white"
                        >
                          {rangeEndDate ? formatDateDisplay(rangeEndDate) : 'Select End'}
                        </button>
                        {activeRangePicker === 'end' && (
                          <div ref={rangePickerRef} className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60]">
                             <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase">{rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                              <div className="flex space-x-1">
                                <button onClick={() => changeRangeMonth(-1)}><ChevronLeft size={14}/></button>
                                <button onClick={() => changeRangeMonth(1)}><ChevronRight size={14}/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 text-center">
                              {getCalendarDays(rangeCalendarMonth).map((d, i) => d.day && (
                                <button key={i} onClick={() => { setRangeEndDate(d.dateStr); setActiveRangePicker(null); }} className={`w-6 h-6 rounded text-[10px] font-bold ${rangeEndDate === d.dateStr ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                  {d.day}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button onClick={() => { setRangeStartDate(''); setRangeEndDate(''); setIsRangeActive(false); setIsMoreOpen(false); }} className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Reset</button>
                    <button onClick={() => { if(rangeStartDate && rangeEndDate) { setIsRangeActive(true); setIsMoreOpen(false); }}} disabled={!rangeStartDate || !rangeEndDate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`px-4 md:px-6 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 ${isRangeActive ? 'bg-slate-900 text-white' : 'bg-blue-50/50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRangeActive ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'}`}></div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">
              {isRangeActive ? `${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}` : formatDateDisplay(selectedDate)}
            </span>
          </div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase text-slate-400">{filteredBookings.length} Results</span>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Professional</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <Briefcase size={14} className="mr-2 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{booking.clientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-700">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2 text-[10px] font-black text-blue-600">
                        {booking.assignedPerson.charAt(0)}
                      </div>
                      <span className="font-semibold truncate max-w-[120px]">{booking.assignedPerson}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-center">
                      <PackageIcon size={14} className="mr-2 text-slate-300" />
                      {booking.package}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-[10px] font-bold text-slate-600">
                      <span className="text-slate-900 text-[11px] flex items-center">
                        <Clock size={12} className="mr-1 text-blue-500" /> {formatTime12h(booking.startTime)}
                      </span>
                      <span className="text-slate-400 uppercase tracking-tighter mt-0.5">{booking.duration} hr</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border inline-block min-w-[70px] ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(booking)} className="p-2 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => setDeleteConfirmId(booking.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="p-20 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                <Info size={32} />
              </div>
              <h3 className="text-slate-800 font-bold">No Records Found</h3>
              <p className="text-slate-400 text-sm mt-1">Refine your search or date filters.</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirm Deletion</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">Permanent removal of record <span className="text-slate-900 font-bold">{deleteConfirmId}</span>? This cannot be undone.</p>
            </div>
            <div className="p-6 bg-slate-50 grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={() => { onDelete(deleteConfirmId); setDeleteConfirmId(null); }} className="py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
