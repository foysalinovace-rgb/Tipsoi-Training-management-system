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
  Check,
  CalendarDays
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

const formatTo12h = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  const m = minutes;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const ReportModule: React.FC<ReportModuleProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Changed: Initialized to empty string to show all reports by default
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeRangePicker, setActiveRangePicker] = useState<'start' | 'end' | null>(null);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const rangePickerRef = useRef<HTMLDivElement>(null);

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

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const changeRangeMonth = (offset: number) => {
    setRangeCalendarMonth(new Date(rangeCalendarMonth.getFullYear(), rangeCalendarMonth.getMonth() + offset, 1));
  };

  const formatDateDisplay = (dateStr: string) => {
    // Changed: Handle empty string to display "All Records"
    if (!dateStr) return 'All Records';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleApplyRange = () => {
    if (rangeStartDate && rangeEndDate) {
      setIsRangeActive(true);
      setSelectedDate(''); // Clear single date when range is active
      setIsFilterOpen(false);
    }
  };

  const handleClearRange = () => {
    setRangeStartDate('');
    setRangeEndDate('');
    setIsRangeActive(false);
    setSelectedDate(''); // Reset to All Records
    setActiveRangePicker(null);
  };

  const filteredData = bookings.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.kamName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true; // Default to showing all
    if (isRangeActive && rangeStartDate && rangeEndDate) {
      matchesDate = b.date >= rangeStartDate && b.date <= rangeEndDate;
    } else if (selectedDate) {
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
      doc.text(`Generated on: ${new Date().toLocaleString('en-US', { hour12: true })}`, 14, 28);
      const dateDisplay = isRangeActive 
        ? `${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}`
        : (selectedDate ? formatDateDisplay(selectedDate) : 'All Records');
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
      doc.text('Time', 230, y);
      doc.text('Status', 260, y);

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
        doc.text(formatTo12h(report.startTime), 230, y);
        doc.text(report.status, 260, y);
        y += 8;
      });

      doc.save(`Tipsoi-CST-Report-${isRangeActive ? 'Range' : (selectedDate || 'All')}.pdf`);
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
          <p className="text-slate-500 text-sm font-medium">Generate and export training reports</p>
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] relative z-10">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center gap-4 relative z-40 rounded-t-2xl">
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

            {isCalendarOpen && (
              <div 
                ref={calendarRef}
                className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]"
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
                      {data.day ? (
                        <button
                          onClick={() => {
                            setSelectedDate(data.dateStr);
                            setIsCalendarOpen(false);
                            setIsRangeActive(false);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center ${
                            selectedDate === data.dateStr && !isRangeActive
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {data.day}
                        </button>
                      ) : <div className="w-8 h-8" />}
                    </div>
                  ))}
                </div>
                {selectedDate && (
                  <button 
                    onClick={() => {
                      setSelectedDate('');
                      setIsCalendarOpen(false);
                    }}
                    className="w-full mt-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
                  >
                    <RotateCcw size={12} className="mr-2" /> Show All Records
                  </button>
                )}
              </div>
            )}

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

              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Advanced Filter</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 relative">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">From</label>
                        <button 
                          type="button"
                          onClick={() => setActiveRangePicker(activeRangePicker === 'start' ? null : 'start')}
                          className="w-full px-3 py-2 rounded-lg border text-left text-[11px] font-bold bg-white"
                        >
                          {rangeStartDate ? formatDateDisplay(rangeStartDate) : 'Select Date'}
                        </button>
                        {activeRangePicker === 'start' && (
                          <div ref={rangePickerRef} className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[70]">
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
                        <label className="text-[9px] font-bold text-slate-500 uppercase">To</label>
                        <button 
                          type="button"
                          onClick={() => setActiveRangePicker(activeRangePicker === 'end' ? null : 'end')}
                          className="w-full px-3 py-2 rounded-lg border text-left text-[11px] font-bold bg-white"
                        >
                          {rangeEndDate ? formatDateDisplay(rangeEndDate) : 'Select Date'}
                        </button>
                        {activeRangePicker === 'end' && (
                          <div ref={rangePickerRef} className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[70]">
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
                    <button onClick={handleClearRange} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Reset</button>
                    <button onClick={handleApplyRange} disabled={!rangeStartDate || !rangeEndDate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/10">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`px-6 py-2.5 border-b border-slate-100 flex items-center justify-between relative z-20 ${isRangeActive ? 'bg-slate-900 text-white' : 'bg-blue-50/50'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRangeActive ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isRangeActive ? 'text-blue-200' : 'text-blue-700'}`}>
              {isRangeActive 
                ? `Report for Period: ${formatDateDisplay(rangeStartDate)} to ${formatDateDisplay(rangeEndDate)}`
                : (selectedDate 
                    ? `Report for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                    : 'Showing All Historical Training Records')
              }
            </span>
          </div>
          <div className="flex items-center space-x-3">
             <span className={`text-[10px] font-bold uppercase ${isRangeActive ? 'text-slate-400' : 'text-slate-400'}`}>
               {filteredData.length} Entry Found
             </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-2xl">
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
                    <div className="text-[10px] text-slate-400">{formatTo12h(report.startTime)}</div>
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
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 rounded-b-2xl">
          <div className="flex space-x-4">
            <span>Total Shown: {filteredData.length}</span>
            <span>Last Sync: {new Date().toLocaleTimeString('en-US', { hour12: true })}</span>
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