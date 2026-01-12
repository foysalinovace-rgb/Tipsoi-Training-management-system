
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Filter as FilterIcon,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check
} from 'lucide-react';
import { TrainingBooking, BookingStatus } from '../types';
import { jsPDF } from 'jspdf';

interface ReportModuleProps {
  bookings: TrainingBooking[];
}

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ReportModule: React.FC<ReportModuleProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Date Range States
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeRangePicker, setActiveRangePicker] = useState<'start' | 'end' | null>(null);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

  // Close elements when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        if (rangePickerRef.current && rangePickerRef.current.contains(event.target as Node)) return;
        setIsFilterOpen(false);
        setActiveRangePicker(null);
      }
      if (rangePickerRef.current && !rangePickerRef.current.contains(event.target as Node)) {
        setActiveRangePicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar Logic
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

  const hasBookingsOnDate = (dateStr: string) => bookings.some(b => b.date === dateStr);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleApplyRange = () => {
    if (rangeStartDate && rangeEndDate) {
      setIsRangeActive(true);
      setIsFilterOpen(false);
    }
  };

  const handleClearRange = () => {
    setRangeStartDate('');
    setRangeEndDate('');
    setIsRangeActive(false);
    setActiveRangePicker(null);
  };

  const filteredData = bookings.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.kamName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = false;
    if (isRangeActive && rangeStartDate && rangeEndDate) {
      matchesDate = b.date >= rangeStartDate && b.date <= rangeEndDate;
    } else {
      matchesDate = b.date === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); 
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); 
      doc.text('Tipsoi CST - Training Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); 
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      const dateDisplay = isRangeActive 
        ? `${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}`
        : selectedDate;
      doc.text(`Report for Period: ${dateDisplay}`, 14, 33);
      doc.text(`Total Records: ${filteredData.length}`, 14, 38);
      
      doc.setDrawColor(226, 232, 240); 
      doc.line(14, 43, pageWidth - 14, 43);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105); 
      let y = 53;
      doc.text('Client Name', 14, y);
      doc.text('Ticket ID', 60, y);
      doc.text('Assigned Prof.', 90, y);
      doc.text('KAM', 130, y);
      doc.text('Package', 170, y);
      doc.text('Training Date', 200, y);
      doc.text('Status', 250, y);

      doc.line(14, y + 2, pageWidth - 14, y + 2);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      y += 10;

      filteredData.forEach((report) => {
        if (y > 180) { 
          doc.addPage('a4', 'l');
          y = 20;
        }
        doc.text(report.clientName.substring(0, 25), 14, y);
        doc.text(report.id, 60, y);
        doc.text(report.assignedPerson.substring(0, 20), 90, y);
        doc.text((report.kamName || 'N/A').substring(0, 20), 130, y);
        doc.text(report.package, 170, y);
        doc.text(report.date, 200, y);
        doc.text(report.status, 250, y);
        y += 8;
      });

      doc.save(`Tipsoi-CST-Report-${isRangeActive ? 'Range' : selectedDate}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.DONE: 
      case BookingStatus.COMPLETED:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
            <CheckCircle size={12} className="mr-1.5" />
            {status}
          </span>
        );
      case BookingStatus.TODO:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <Clock size={12} className="mr-1.5" />
            {status}
          </span>
        );
      case BookingStatus.CANCELLED:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            <XCircle size={12} className="mr-1.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reports</h2>
          <p className="text-slate-500 text-sm font-medium">Generate and export training audit reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || filteredData.length === 0}
            className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Download size={18} className="mr-2" />}
            {isExporting ? 'Generating PDF...' : 'Export Data (PDF)'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center gap-4 relative z-20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter report by Client, Ticket ID or KAM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm bg-white font-medium shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto relative">
            {/* Main Date Filter Trigger */}
            <button 
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                setIsFilterOpen(false);
              }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all text-sm font-bold shadow-sm ${
                isCalendarOpen ? 'bg-blue-600 text-white border-blue-600' : (isRangeActive ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')
              }`}
            >
              <CalendarIcon size={18} />
              <span className="whitespace-nowrap">{formatDateDisplay(selectedDate)}</span>
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

            {/* Range Filter (Sync with BookingList "More" style) */}
            <div className="relative" ref={filterPanelRef}>
              <button 
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsCalendarOpen(false);
                  setActiveRangePicker(null);
                }}
                className={`inline-flex items-center px-4 py-3 rounded-2xl border transition-all text-sm font-bold shadow-sm ${
                  isFilterOpen || isRangeActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FilterIcon size={16} className="mr-2" />
                Filter
              </button>

              {/* Advanced Filter Panel */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Advanced Filter</h4>
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

        {/* Selected Date Indicator Banner */}
        <div className={`px-6 py-2.5 border-b border-slate-100 flex items-center justify-between ${isRangeActive ? 'bg-slate-900 text-white' : 'bg-blue-50/50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRangeActive ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isRangeActive ? 'text-blue-200' : 'text-blue-700'}`}>
              {isRangeActive 
                ? `Report for Period: ${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}`
                : `Report for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
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
               {filteredData.length} Entry Found
             </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Client Name</th>
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Assigned Professional</th>
                <th className="px-6 py-5">KAM</th>
                <th className="px-6 py-5">Package</th>
                <th className="px-6 py-5">Submission</th>
                <th className="px-6 py-5">Training Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">More</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800 leading-tight">
                      {report.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                      {report.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center mr-2 text-[10px] font-black text-slate-500">
                        {report.assignedPerson.charAt(0)}
                      </div>
                      {report.assignedPerson}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-blue-600">
                      {report.kamName || 'Not Assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{report.package}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                    {report.manpowerSubmissionDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-700">{report.date}</div>
                    <div className="text-[10px] text-slate-400">{report.startTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-white transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-24 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                <FileSpreadsheet size={40} className="text-slate-200" />
              </div>
              <h3 className="text-slate-800 font-bold text-xl">No Report Data</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
                No records found for the selected criteria. 
                {isRangeActive ? " Try adjusting the date range." : ` Records for ${selectedDate} will appear here.`}
              </p>
              <button 
                onClick={() => {
                  setSelectedDate(getLocalDateString());
                  handleClearRange();
                }}
                className="mt-6 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex space-x-4">
            <span>Total Shown: {filteredData.length}</span>
            <span>Last Sync: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center">
            <Info size={12} className="mr-2" /> System Protected Data
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModule;
