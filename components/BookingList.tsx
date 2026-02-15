import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrainingBooking, BookingStatus } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Filter, 
  AlertTriangle, 
  History,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';

interface BookingListProps {
  bookings: TrainingBooking[];
  onAdd: () => void;
  onEdit: (booking: TrainingBooking) => void;
  onDelete: (ids: string[]) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Delete Modal State
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);
  
  // Filter States
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [activeRangePicker, setActiveRangePicker] = useState<'start' | 'end' | null>(null);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(new Date());

  const moreRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isRangeActive, rangeStartDate, rangeEndDate, rowsPerPage]);

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
    if (!dateStr) return 'All Time';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
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

  const changeRangeMonth = (offset: number) => setRangeCalendarMonth(new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() + offset, 1));

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.DONE: return 'bg-green-50 text-green-700 border-green-100';
      case BookingStatus.TODO: return 'bg-blue-50 text-blue-700 border-blue-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const matchesSearch = 
          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesDate = true;
        if (isRangeActive && rangeStartDate && rangeEndDate) {
          matchesDate = b.date >= rangeStartDate && b.date <= rangeEndDate;
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        if (a.startTime !== b.startTime) return b.startTime.localeCompare(a.startTime);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [bookings, searchTerm, isRangeActive, rangeStartDate, rangeEndDate]);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBookings.map(b => b.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      setDeleteConfirmIds(Array.from(selectedIds));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Training Bookings</h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Manage corporate training sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs md:text-sm hover:bg-red-100 transition-all active:scale-95"
            >
              <Trash2 size={18} className="mr-2" />
              Delete ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={onAdd}
            className="flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative z-10">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row items-center gap-3 relative z-30 rounded-t-2xl">
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
            <div className="relative flex-1 lg:flex-none" ref={moreRef}>
              <button 
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`w-full lg:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl border transition-all text-xs font-bold shadow-sm ${
                  isMoreOpen || isRangeActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} className="mr-2" />
                {isRangeActive ? 'Filter Active' : 'Filter by Range'}
              </button>

              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 overflow-visible">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Date Range Selection</h4>
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
                          <div ref={rangePickerRef} className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase">{rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                              <div className="flex space-x-1">
                                <button onClick={() => changeRangeMonth(-1)}><ChevronLeft size={14}/></button>
                                <button onClick={() => changeRangeMonth(1)}><ChevronRight size={14}/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 text-center">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>)}
                              {getCalendarDays(rangeCalendarMonth).map((d, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                  {d.day ? (
                                    <button onClick={() => { setRangeStartDate(d.dateStr); setActiveRangePicker(null); }} className={`w-6 h-6 rounded text-[10px] font-bold ${rangeStartDate === d.dateStr ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100'}`}>
                                      {d.day}
                                    </button>
                                  ) : <div className="w-6 h-6" />}
                                </div>
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
                          <div ref={rangePickerRef} className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[60]">
                             <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase">{rangeCalendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                              <div className="flex space-x-1">
                                <button onClick={() => changeRangeMonth(-1)}><ChevronLeft size={14}/></button>
                                <button onClick={() => changeRangeMonth(1)}><ChevronRight size={14}/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 text-center">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>)}
                              {getCalendarDays(rangeCalendarMonth).map((d, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                  {d.day ? (
                                    <button onClick={() => { setRangeEndDate(d.dateStr); setActiveRangePicker(null); }} className={`w-6 h-6 rounded text-[10px] font-bold ${rangeEndDate === d.dateStr ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100'}`}>
                                      {d.day}
                                    </button>
                                  ) : <div className="w-6 h-6" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button onClick={() => { setRangeStartDate(''); setRangeEndDate(''); setIsRangeActive(false); setIsMoreOpen(false); }} className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Reset</button>
                    <button onClick={() => { if(rangeStartDate && rangeEndDate) { setIsRangeActive(true); setIsMoreOpen(false); }}} disabled={!rangeStartDate || !rangeEndDate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/10">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`px-4 md:px-6 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 relative z-20 ${isRangeActive ? 'bg-slate-900 text-white' : 'bg-blue-50/50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRangeActive ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'}`}></div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">
              {isRangeActive ? `Range: ${formatDateDisplay(rangeStartDate)} — ${formatDateDisplay(rangeEndDate)}` : 'Showing All Historical Bookings'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-[9px] md:text-[10px] font-bold uppercase text-slate-400">{filteredBookings.length} Total Records Found</span>
             {!isRangeActive && (
               <div className="flex items-center text-blue-600 text-[10px] font-black uppercase">
                 <History size={12} className="mr-1.5" /> Full History Mode
               </div>
             )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {selectedIds.size === paginatedBookings.length && paginatedBookings.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Professional</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Training Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(booking.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelectOne(booking.id)} className={`${selectedIds.has(booking.id) ? 'text-blue-600' : 'text-slate-300'} hover:text-blue-600 transition-colors`}>
                      {selectedIds.has(booking.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
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
                  <td className="px-6 py-4 text-xs text-slate-600 font-bold uppercase tracking-tighter">
                    {booking.package}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-700">{booking.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[10px] font-bold text-slate-600">
                      <Clock size={12} className="mr-1.5 text-blue-500" /> {formatTime12h(booking.startTime)}
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
                      <button onClick={() => setDeleteConfirmIds([booking.id])} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16}/></button>
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
              <h3 className="text-slate-800 font-bold uppercase tracking-widest text-sm">No Records Found</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Adjust filters to see more data</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page:</span>
              <div className="relative">
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1 pr-8 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4">
              Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center px-4">
              <span className="text-[11px] font-black text-slate-700">Page {currentPage} of {totalPages || 1}</span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {deleteConfirmIds && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed tracking-wide">
                Permanent removal of <span className="text-slate-900 font-bold">{deleteConfirmIds.length} record{deleteConfirmIds.length > 1 ? 's' : ''}</span>? This action is irreversible.
              </p>
            </div>
            <div className="p-4 bg-slate-50 grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteConfirmIds(null)} className="py-2.5 bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
              <button 
                onClick={() => { 
                  onDelete(deleteConfirmIds); 
                  setDeleteConfirmIds(null); 
                  setSelectedIds(new Set());
                }} 
                className="py-2.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;