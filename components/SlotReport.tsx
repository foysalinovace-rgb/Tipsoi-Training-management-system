
import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { TrainingBooking, BookingStatus } from '../types';

interface SlotReportProps {
  bookings: TrainingBooking[];
  onEdit: (booking: TrainingBooking) => void;
  onDelete: (id: string) => void;
}

const SlotReport: React.FC<SlotReportProps> = ({ bookings, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Updated to show all bookings instead of just public requests
  const filtered = bookings.filter(b => 
    b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.companyName && b.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.DONE: return 'bg-green-50 text-green-600 border-green-100';
      case BookingStatus.TODO: return 'bg-blue-50 text-blue-600 border-blue-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Slot Booking Report</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Global Session Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-[10px] font-black uppercase tracking-widest">
            {filtered.length} Bookings
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by client, company or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-[11px] font-bold bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {booking.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{booking.clientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{booking.assignedPerson}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex items-center text-[10px] font-bold text-blue-600 uppercase">
                        <Calendar size={12} className="mr-1.5" /> {booking.date}
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-slate-400">
                        <Clock size={12} className="mr-1.5" /> {booking.startTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border tracking-tight ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(booking)} className="p-2 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"><Edit3 size={14}/></button>
                      <button onClick={() => setDeleteConfirmId(booking.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <ClipboardList size={40} className="mb-2 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No slot bookings found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Confirm Deletion</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">Remove booking <span className="text-slate-900 font-bold">{deleteConfirmId}</span>? This data will be removed from all reports.</p>
            </div>
            <div className="p-4 bg-slate-50 grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="py-2.5 bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</button>
              <button onClick={() => { onDelete(deleteConfirmId); setDeleteConfirmId(null); }} className="py-2.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotReport;
