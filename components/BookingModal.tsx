
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Briefcase, 
  Tag, 
  Hash, 
  FileText, 
  CheckCircle2, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Database
} from 'lucide-react';
import { TrainingBooking, BookingStatus, TrainingType, User as UserType } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: TrainingBooking) => void;
  bookingToEdit?: TrainingBooking | null;
  users: UserType[];
  kams: string[]; 
  packages: string[]; 
}

interface SheetMapping {
  clientName: string;
  ticketId: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, bookingToEdit, users, kams, packages }) => {
  const [formData, setFormData] = useState({
    ticketId: '',
    clientName: '',
    assignedPerson: '',
    kamName: '',
    package: '',
    manpowerSubmissionDate: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    status: BookingStatus.TODO,
    notes: '',
    title: '',
    category: 'Corporate Training',
    type: TrainingType.ON_SITE,
    duration: 1,
    location: 'Corporate Office',
  });

  const [activePicker, setActivePicker] = useState<'submission' | 'training' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [sheetMappings, setSheetMappings] = useState<SheetMapping[]>([]);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch Master Ticket ID Data from Google Sheet
  useEffect(() => {
    if (isOpen && !bookingToEdit) {
      const fetchSheetData = async () => {
        setIsSheetLoading(true);
        try {
          // Public CSV Export URL for the provided Sheet
          const sheetId = '1l8B6jdStatgm0sItoFHMHoQTNh7n5VjnuvNDVMR4d3A';
          const gid = '128281966';
          const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          
          const response = await fetch(url);
          const csvText = await response.text();
          
          // Basic CSV parsing logic
          const lines = csvText.split(/\r?\n/);
          const mappings: SheetMapping[] = [];
          
          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            
            // Split by comma but handle commas inside quotes
            const columns = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            // Column D (index 3) is Ticket ID
            // Column F (index 5) is Client Name
            const ticketId = columns[3]?.replace(/^"|"$/g, '').trim();
            const clientName = columns[5]?.replace(/^"|"$/g, '').trim();
            
            if (ticketId && clientName) {
              mappings.push({ ticketId, clientName });
            }
          }
          setSheetMappings(mappings);
        } catch (error) {
          console.error("Failed to fetch sheet data:", error);
        } finally {
          setIsSheetLoading(false);
        }
      };
      fetchSheetData();
    }
  }, [isOpen, bookingToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (bookingToEdit) {
        setFormData({
          ticketId: bookingToEdit.id,
          clientName: bookingToEdit.clientName,
          assignedPerson: bookingToEdit.assignedPerson,
          kamName: bookingToEdit.kamName || '',
          package: bookingToEdit.package,
          manpowerSubmissionDate: bookingToEdit.manpowerSubmissionDate,
          date: bookingToEdit.date,
          startTime: bookingToEdit.startTime,
          status: bookingToEdit.status,
          notes: bookingToEdit.notes,
          title: bookingToEdit.title,
          category: bookingToEdit.category,
          type: bookingToEdit.type,
          duration: bookingToEdit.duration,
          location: bookingToEdit.location,
        });
      } else {
        setFormData(prev => ({ 
          ...prev, 
          ticketId: '', // Start empty to allow auto-fill
          clientName: '',
          assignedPerson: users.length > 0 ? users[0].name : '',
          kamName: kams.length > 0 ? kams[0] : '',
          package: packages.length > 0 ? packages[0] : '',
          status: BookingStatus.TODO,
          notes: '',
          date: new Date().toISOString().split('T')[0],
          manpowerSubmissionDate: new Date().toISOString().split('T')[0]
        }));
      }
    }
  }, [isOpen, bookingToEdit, users, kams, packages]);

  // Lookup Logic for Client Name
  const handleClientNameChange = (val: string) => {
    setFormData(prev => {
      const updatedData = { ...prev, clientName: val };
      
      // If we're not editing an existing record, check for master sheet match
      if (!bookingToEdit && sheetMappings.length > 0) {
        const match = sheetMappings.find(
          m => m.clientName.toLowerCase() === val.toLowerCase().trim()
        );
        if (match) {
          updatedData.ticketId = match.ticketId;
        }
      }
      return updatedData;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setActivePicker(null);
      }
    };
    if (activePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePicker]);

  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, dateStr: '' });
    }
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [calendarMonth]);

  const changeMonth = (offset: number) => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.assignedPerson || !formData.ticketId || !formData.kamName) {
      alert("Please fill in all required fields. Ticket ID is required.");
      return;
    }

    const bookingData: TrainingBooking = {
      id: formData.ticketId,
      clientName: formData.clientName,
      assignedPerson: formData.assignedPerson,
      kamName: formData.kamName,
      title: formData.title || `Training for ${formData.clientName}`,
      category: formData.category,
      type: formData.type,
      package: formData.package,
      manpowerSubmissionDate: formData.manpowerSubmissionDate,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      location: formData.location,
      notes: formData.notes,
      status: formData.status,
      createdAt: bookingToEdit?.createdAt || new Date().toISOString(),
      history: bookingToEdit?.history || [{ timestamp: new Date().toISOString(), user: 'System', action: bookingToEdit ? 'Updated' : 'Created' }]
    };
    
    onSubmit(bookingData);
    onClose();
  };

  const renderDatePicker = (type: 'submission' | 'training') => {
    const selectedDate = type === 'submission' ? formData.manpowerSubmissionDate : formData.date;
    
    return (
      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[70]" ref={calendarRef}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
            {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex space-x-1">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={16}/></button>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={16}/></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[9px] font-black text-slate-300 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((data, idx) => (
            <div key={idx} className="aspect-square flex items-center justify-center">
              {data.day && (
                <button
                  type="button"
                  onClick={() => {
                    if (type === 'submission') setFormData({...formData, manpowerSubmissionDate: data.dateStr});
                    else setFormData({...formData, date: data.dateStr});
                    setActivePicker(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all relative flex items-center justify-center ${
                    selectedDate === data.dateStr 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {data.day}
                  {data.dateStr === new Date().toISOString().split('T')[0] && (
                    <span className={`absolute bottom-0.5 w-0.5 h-0.5 rounded-full ${selectedDate === data.dateStr ? 'bg-white' : 'bg-blue-400'}`}></span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">{bookingToEdit ? 'Edit Booking' : 'Add New Booking'}</h3>
            <p className="text-[11px] text-slate-500 uppercase tracking-tighter">Enter scheduling information</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id="booking-form" onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <Hash size={11} className="mr-1.5" /> Ticket ID
              </label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  readOnly={!!bookingToEdit}
                  placeholder={isSheetLoading ? "Syncing ID database..." : "Enter or auto-fill ID"}
                  className={`w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none transition-all text-xs font-mono font-bold ${bookingToEdit ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`}
                  value={formData.ticketId}
                  onChange={e => setFormData({...formData, ticketId: e.target.value})}
                />
                {!bookingToEdit && isSheetLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <Briefcase size={11} className="mr-1.5" /> Client Name
              </label>
              <div className="relative">
                <input 
                  required
                  type="text"
                  placeholder="Client/Company name"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  value={formData.clientName}
                  onChange={e => handleClientNameChange(e.target.value)}
                />
                {!bookingToEdit && !isSheetLoading && sheetMappings.length > 0 && (
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 group">
                      <Database size={12} className="text-slate-300" />
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                        Synced with Master Sheet
                      </div>
                   </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <User size={11} className="mr-1.5" /> Assigned Professional
              </label>
              <select 
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                value={formData.assignedPerson}
                onChange={e => setFormData({...formData, assignedPerson: e.target.value})}
              >
                <option value="" disabled>Select Professional</option>
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <UserCheck size={11} className="mr-1.5" /> KAM Responsible
              </label>
              <select 
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                value={formData.kamName}
                onChange={e => setFormData({...formData, kamName: e.target.value})}
              >
                <option value="" disabled>Select KAM</option>
                {kams.map((kam, i) => (
                  <option key={i} value={kam}>{kam}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <Tag size={11} className="mr-1.5" /> Package
              </label>
              <select 
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                value={formData.package}
                onChange={e => setFormData({...formData, package: e.target.value})}
              >
                <option value="" disabled>Select Package</option>
                {packages.map((pkg, i) => (
                  <option key={i} value={pkg}>{pkg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <FileText size={11} className="mr-1.5" /> Submission Date
              </label>
              <button 
                type="button"
                onClick={() => {
                  setActivePicker(activePicker === 'submission' ? null : 'submission');
                  setCalendarMonth(new Date(formData.manpowerSubmissionDate));
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs outline-none transition-all ${activePicker === 'submission' ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="font-semibold">{formData.manpowerSubmissionDate}</span>
                <CalendarIcon size={14} className="text-slate-400" />
              </button>
              {activePicker === 'submission' && renderDatePicker('submission')}
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <CalendarIcon size={11} className="mr-1.5" /> Training Date
              </label>
              <button 
                type="button"
                onClick={() => {
                  setActivePicker(activePicker === 'training' ? null : 'training');
                  setCalendarMonth(new Date(formData.date));
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs outline-none transition-all ${activePicker === 'training' ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="font-semibold">{formData.date}</span>
                <CalendarIcon size={14} className="text-slate-400" />
              </button>
              {activePicker === 'training' && renderDatePicker('training')}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <Clock size={11} className="mr-1.5" /> Training Time
              </label>
              <input 
                required
                type="time" 
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                <CheckCircle2 size={11} className="mr-1.5" /> Current Status
              </label>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 h-[34px]">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: BookingStatus.TODO})}
                  className={`flex-1 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap ${formData.status === BookingStatus.TODO ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  To Do
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: BookingStatus.DONE})}
                  className={`flex-1 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap ${formData.status === BookingStatus.DONE ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block tracking-wider">Notes / Instructions</label>
            <textarea 
              rows={2}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs bg-white resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              placeholder="Enter details..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50/30 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button 
            form="booking-form"
            type="submit"
            className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            {bookingToEdit ? 'Update Booking' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
