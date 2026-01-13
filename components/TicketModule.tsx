
import React, { useState } from 'react';
import { 
  Ticket as TicketIcon, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  ArrowUpRight,
  Activity,
  Inbox
} from 'lucide-react';

interface TicketRecord {
  id: string;
  client: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  date: string;
}

const TicketModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<TicketRecord[]>([]); // Initialized as empty array

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-600';
      case 'In Progress': return 'text-amber-600';
      case 'Resolved': return 'text-emerald-600';
      default: return 'text-slate-400';
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
            <TicketIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Ticket Management</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Support & Service Desk Operations</p>
          </div>
        </div>
        <button className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
          <Plus size={18} className="mr-2" />
          Create Ticket
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets by ID, Client or Subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium bg-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} />
            </button>
            <div className="h-10 w-px bg-slate-200 mx-2 hidden lg:block"></div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar flex-1">
          {filteredTickets.length > 0 ? (
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-5">Ticket ID</th>
                  <th className="px-6 py-5">Client Information</th>
                  <th className="px-6 py-5">Issue Subject</th>
                  <th className="px-6 py-5">Priority</th>
                  <th className="px-6 py-5">Assigned To</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{ticket.client}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Corporate Account</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-600 line-clamp-1">{ticket.subject}</span>
                        <ArrowUpRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border tracking-tighter ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {ticket.assignedTo.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{ticket.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${getStatusStyle(ticket.status)}`}>
                        {ticket.status === 'Open' && <Clock size={12} className="mr-1.5" />}
                        {ticket.status === 'In Progress' && <Activity size={12} className="mr-1.5 animate-pulse" />}
                        {ticket.status === 'Resolved' && <CheckCircle2 size={12} className="mr-1.5" />}
                        {ticket.status === 'Closed' && <AlertCircle size={12} className="mr-1.5" />}
                        {ticket.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Inbox size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No active tickets found</h3>
              <p className="text-slate-400 text-xs font-medium max-w-xs mt-1">All issues have been processed or no data is currently available in the system.</p>
              <button className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Sync Database
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <span>Displaying {filteredTickets.length} of {tickets.length} Total Tickets</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-all disabled:opacity-30" disabled>Prev</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-all disabled:opacity-30" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModule;
