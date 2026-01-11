
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Activity,
  BarChart3,
  Filter,
  UserCheck
} from 'lucide-react';
import { TrainingBooking, BookingStatus, User as UserType } from '../types';

interface AnalyticsProps {
  bookings: TrainingBooking[];
  users: UserType[];
}

const Analytics: React.FC<AnalyticsProps> = ({ bookings, users }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeMonth = (offset: number) => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + offset, 1));
  };

  const monthLabel = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Filter bookings for the selected month
  const monthlyBookings = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    return bookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getFullYear() === year && bDate.getMonth() === month;
    });
  }, [bookings, selectedMonth]);

  const doneBookings = useMemo(() => 
    monthlyBookings.filter(b => b.status === BookingStatus.DONE || b.status === BookingStatus.COMPLETED),
  [monthlyBookings]);

  // 2. User Performance (Total Trainings Given by each User)
  const userPerformanceData = useMemo(() => {
    return users.map(user => {
      const count = doneBookings.filter(b => b.assignedPerson === user.name).length;
      return {
        name: user.name,
        count: count,
        shortName: user.name.split(' ')[0]
      };
    }).sort((a, b) => b.count - a.count);
  }, [users, doneBookings]);

  // 3. Weekly Logic (Break month into weeks)
  const weeklyData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks = [];
    let currentStart = new Date(firstDay);
    
    while (currentStart <= lastDay) {
      let currentEnd = new Date(currentStart);
      currentEnd.setDate(currentStart.getDate() + 6);
      if (currentEnd > lastDay) currentEnd = new Date(lastDay);
      
      const count = doneBookings.filter(b => {
        const d = new Date(b.date);
        return d >= currentStart && d <= currentEnd;
      }).length;

      weeks.push({
        name: `Week ${weeks.length + 1}`,
        count: count,
        range: `${currentStart.getDate()} - ${currentEnd.getDate()}`
      });
      
      currentStart.setDate(currentStart.getDate() + 7);
    }
    return weeks;
  }, [selectedMonth, doneBookings]);

  // 4. Status Breakdown for Pie Chart
  const statusData = useMemo(() => {
    const todo = monthlyBookings.filter(b => b.status === BookingStatus.TODO).length;
    const done = doneBookings.length;
    const cancelled = monthlyBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    
    return [
      { name: 'Completed', value: done, color: '#10B981' },
      { name: 'To Do', value: todo, color: '#3B82F6' },
      { name: 'Cancelled', value: cancelled, color: '#EF4444' }
    ].filter(d => d.value > 0);
  }, [monthlyBookings, doneBookings]);

  const topPerformer = userPerformanceData[0]?.count > 0 ? userPerformanceData[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
            <BarChart3 className="mr-3 text-blue-600" />
            Performance Analytics
          </h2>
          <p className="text-slate-500 text-sm font-medium">Insights for {monthLabel}</p>
        </div>
        
        <div className="relative" ref={pickerRef}>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center space-x-3 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all min-w-[180px] justify-center"
            >
              <CalendarIcon size={18} />
              <span>{monthLabel}</span>
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Goal</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{doneBookings.length}</h3>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-tighter">Sessions Completed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {monthlyBookings.length > 0 ? Math.round((doneBookings.length / monthlyBookings.length) * 100) : 0}%
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-tighter">Completion Rate</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><UserCheck size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Star Performer</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 truncate">{topPerformer ? topPerformer.name : 'N/A'}</h3>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-tighter">
            {topPerformer ? `${topPerformer.count} Trainings Done` : 'No data for this month'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pipeline</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{monthlyBookings.length}</h3>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-tighter">Total Scheduled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Bar Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Weekly Performance</h3>
              <p className="text-xs text-slate-500">Distribution of done trainings across weeks</p>
            </div>
            <Filter size={16} className="text-slate-300" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#60A5FA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Contribution Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">User Wise Contribution</h3>
              <p className="text-xs text-slate-500">Total trainings completed per team member</p>
            </div>
            <Users size={16} className="text-slate-300" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={userPerformanceData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="shortName" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (Pie Chart) */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Booking Status Distribution</h3>
            <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded">Real-time</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-around">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full max-w-[150px]">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">{item.value}</span>
                </div>
              ))}
              {statusData.length === 0 && (
                 <div className="text-center py-10 opacity-50">
                   <p className="text-xs font-bold text-slate-400">NO DATA</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed User Table Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Performance Leaderboard</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Done Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userPerformanceData.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.count > 0 ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-bold uppercase">Idle</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{user.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
