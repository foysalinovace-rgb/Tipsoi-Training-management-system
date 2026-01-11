
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
  AlertTriangle
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

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
    const matchesDate = b.date === selectedDate;
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
            {/* Date Filter Trigger */}
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                isCalendarOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CalendarIcon size={18} />
              <span>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </button>

            {/* Small Floating Calendar */}
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
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center ${
                            selectedDate === data.dateStr 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {data.day}
                          {hasBookingsOnDate(data.dateStr) && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${selectedDate === data.dateStr ? 'bg-white' : 'bg-blue-400'}`}></span>
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

            <button className="hidden sm:inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={16} className="mr-2" />
              More
            </button>
          </div>
        </div>

        {/* Selected Date Indicator Banner */}
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-widest">
              Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            {filteredBookings.length} Entry Found
          </span>
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
                There are no training sessions booked for this specific date. 
                Use the calendar filter above to explore other dates.
              </p>
              <button 
                onClick={() => setSelectedDate(getLocalDateString())}
                className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Return to Today
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
