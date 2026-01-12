
import React, { useState, useEffect, useMemo } from 'react';
import { TrainingBooking, BookingStatus, User as UserType } from '../types';
import { Users, Calendar, CheckCircle2, Clock, TrendingUp, Building2, RefreshCw, Loader2, FileDown, ShieldAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  bookings: TrainingBooking[];
  users: UserType[];
}

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CountdownTimer: React.FC<{ startTime: string; duration: number; date: string }> = ({ startTime, duration, date }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [statusLabel, setStatusLabel] = useState<string>('Upcoming');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      
      const sessionStart = new Date(date);
      sessionStart.setHours(hours, minutes, 0, 0);
      
      const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 60 * 1000);
      
      let diff = 0;
      if (now < sessionStart) {
        diff = sessionStart.getTime() - now.getTime();
        setStatusLabel('Starts in');
      } else if (now < sessionEnd) {
        diff = sessionEnd.getTime() - now.getTime();
        setStatusLabel('Ends in');
      } else {
        setTimeLeft('Completed');
        setStatusLabel('Status');
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const mLabel = m < 10 ? `0${m}` : m;
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      const sLabel = s < 10 ? `0${s}` : s;

      setTimeLeft(`${h}h ${mLabel}m ${sLabel}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration, date]);

  return (
    <div className="flex flex-col items-end">
      <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-tighter">{statusLabel}</span>
      <span className={`text-[11px] md:text-xs font-mono font-bold ${timeLeft === 'Completed' ? 'text-green-500' : 'text-blue-600'}`}>
        {timeLeft}
      </span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ bookings, users }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const todayStr = getLocalDateString();
  
  const todayTrainings = useMemo(() => {
    return bookings
      .filter(b => {
        const isCompleted = b.status === BookingStatus.DONE || b.status === BookingStatus.COMPLETED;
        const isCancelled = b.status === BookingStatus.CANCELLED;
        return b.date === todayStr && !isCompleted && !isCancelled;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings, todayStr]);

  const upcomingTrainings = useMemo(() => {
    return bookings
      .filter(b => {
        const isCompleted = b.status === BookingStatus.DONE || b.status === BookingStatus.COMPLETED;
        const isCancelled = b.status === BookingStatus.CANCELLED;
        return b.date > todayStr && !isCompleted && !isCancelled;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [bookings, todayStr]);

  const completedToday = bookings.filter(b => 
    b.date === todayStr && (b.status === BookingStatus.DONE || b.status === BookingStatus.COMPLETED)
  );

  const stats = [
    { label: 'Total Trainings', value: bookings.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Upcoming', value: todayTrainings.length + upcomingTrainings.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Completed Today', value: completedToday.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Team Capacity', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246);
      doc.text('Tipsoi CST', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Enterprise Training Management System - Dashboard Report', 20, 26);
      doc.save(`Tipsoi-CST-Dashboard-${todayStr}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const trainerOccupancy = users.map(user => {
    const userTodayBookings = bookings.filter(b => 
      b.assignedPerson === user.name && 
      b.date === todayStr && 
      b.status !== BookingStatus.DONE && 
      b.status !== BookingStatus.COMPLETED &&
      b.status !== BookingStatus.CANCELLED
    );
    return {
      name: user.name,
      role: user.role,
      occupiedSlots: userTodayBookings.map(b => ({ time: b.startTime, duration: b.duration, title: b.title, date: b.date })),
      isOccupied: userTodayBookings.length > 0
    };
  });

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Executive Summary</h2>
          <div className="flex flex-col mt-1">
             <span className="text-blue-600 font-bold text-sm">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
             </span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
             </span>
          </div>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} disabled={isExporting} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-all">
            {isExporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <FileDown size={14} className="mr-2 text-slate-400" />}
            <span className="hidden xs:inline">Export PDF</span><span className="xs:hidden">Export</span>
          </button>
          <button onClick={handleRefresh} className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            {isRefreshing ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4 hover:border-blue-200 transition-colors">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
              <div className="flex items-center text-[9px] text-green-600 font-black uppercase mt-0.5">
                <TrendingUp size={10} className="mr-1" />
                <span>Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real-time Occupancy */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-red-50/20 flex items-center space-x-3">
            <div className="p-2 bg-red-600 text-white rounded-lg shadow-lg shadow-red-500/20">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Occupancy Real-Time</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Personnel Monitor</p>
            </div>
          </div>
          <div className="p-0">
            <div className="divide-y divide-slate-100">
              {trainerOccupancy.map((trainer, idx) => (
                <div key={idx} className={`p-4 hover:bg-slate-50 transition-colors ${trainer.isOccupied ? 'bg-blue-50/20' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${trainer.isOccupied ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                        {trainer.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{trainer.name}</h4>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{trainer.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${trainer.isOccupied ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {trainer.isOccupied ? 'On Training' : 'Available'}
                    </span>
                    {trainer.isOccupied && (
                      <div className="flex items-center text-blue-600">
                        <Clock size={10} className="mr-1" />
                        <span className="text-[9px] font-bold">Active</span>
                      </div>
                    )}
                  </div>

                  {trainer.isOccupied && (
                    <div className="mt-3 space-y-2">
                      {trainer.occupiedSlots.map((slot, sIdx) => (
                        <div key={sIdx} className="bg-white p-2.5 rounded-xl border border-blue-100 flex flex-col space-y-1 shadow-sm">
                          <p className="text-[9px] font-black text-slate-800 uppercase leading-none truncate">{slot.title}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-[8px] text-slate-400 font-bold">{slot.time}</p>
                            <CountdownTimer startTime={slot.time} duration={slot.duration} date={slot.date} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule & Upcoming */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-amber-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Today's Active Schedule</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <span className="w-fit px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase">
                {todayTrainings.length} Active Sessions
              </span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {todayTrainings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {todayTrainings.map((training) => (
                    <div key={training.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm truncate">{training.title}</h4>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-tighter shrink-0">In Progress</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                            {training.clientName} <span className="mx-1 text-slate-300">|</span> <span className="text-slate-800 font-bold">{training.startTime}</span> <span className="mx-1 text-slate-300">|</span> {training.assignedPerson}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:block justify-end">
                        <CountdownTimer startTime={training.startTime} duration={training.duration} date={training.date} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <CheckCircle2 size={32} className="text-slate-100 mb-3" />
                  <h4 className="text-slate-800 font-bold uppercase tracking-widest text-xs">Clear Schedule</h4>
                  <p className="text-slate-400 text-[10px] mt-0.5">No active sessions for today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Upcoming Schedules</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Future commitments</p>
                </div>
              </div>
              <span className="w-fit px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">
                {upcomingTrainings.length} Planned
              </span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {upcomingTrainings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingTrainings.map((training) => (
                    <div key={training.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm truncate">{training.title}</h4>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200 uppercase tracking-tighter shrink-0">
                              {training.date}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                            {training.clientName} <span className="mx-1 text-slate-300">|</span> <span className="text-slate-800 font-bold">{training.startTime}</span> <span className="mx-1 text-slate-300">|</span> {training.assignedPerson}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Scheduled</span>
                        <span className="text-[11px] font-bold text-slate-600">{training.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <Calendar size={32} className="text-slate-100 mb-3" />
                  <h4 className="text-slate-800 font-bold uppercase tracking-widest text-xs">Empty Pipeline</h4>
                  <p className="text-slate-400 text-[10px] mt-0.5">No future sessions planned.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
