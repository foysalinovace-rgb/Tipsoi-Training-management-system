
import React, { useState, useEffect, useMemo } from 'react';
import { TrainingBooking, BookingStatus, User as UserType } from '../types';
import { Users, Calendar, CheckCircle2, Clock, TrendingUp, Building2, RefreshCw, Loader2, FileDown, ShieldAlert, CircleUser } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  bookings: TrainingBooking[];
  users: UserType[];
}

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
        // Upcoming
        diff = sessionStart.getTime() - now.getTime();
        setStatusLabel('Starts in');
      } else if (now < sessionEnd) {
        // Ongoing
        diff = sessionEnd.getTime() - now.getTime();
        setStatusLabel('Ends in');
      } else {
        // Completed
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
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{statusLabel}</span>
      <span className={`text-xs font-mono font-bold ${timeLeft === 'Completed' ? 'text-green-500' : 'text-blue-600'}`}>
        {timeLeft}
      </span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ bookings, users }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Executive Summary</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time training metrics and future roadmap</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleExportPDF} disabled={isExporting} className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-all">
            {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileDown size={16} className="mr-2 text-slate-400" />}
            Export PDF
          </button>
          <button onClick={handleRefresh} className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            {isRefreshing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4 hover:border-blue-200 transition-colors">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              <div className="flex items-center text-[10px] text-green-600 font-black uppercase mt-1">
                <TrendingUp size={12} className="mr-1" />
                <span>Sync Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Occupancy (MOVED TO LEFT) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center space-x-3">
            <div className="p-2 bg-orange-500 text-white rounded-lg shadow-lg shadow-orange-500/20">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Occupancy Real-Time</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Today's Active Personnel</p>
            </div>
          </div>
          <div className="p-0 overflow-y-auto max-h-[850px] custom-scrollbar">
            <div className="divide-y divide-slate-100">
              {trainerOccupancy.map((trainer, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${trainer.isOccupied ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {trainer.isOccupied ? <Clock size={18} /> : <CircleUser size={18} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{trainer.name}</h4>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{trainer.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${trainer.isOccupied ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      {trainer.isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  
                  {trainer.isOccupied && (
                    <div className="mt-3 space-y-2 pl-12 border-l-2 border-orange-100 ml-4">
                      {trainer.occupiedSlots.map((slot, sIdx) => (
                        <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                          <div className="max-w-[120px]">
                            <p className="text-[10px] font-bold text-slate-700 truncate">{slot.title}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{slot.time}</p>
                          </div>
                          <CountdownTimer startTime={slot.time} duration={slot.duration} date={slot.date} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Lists (MOVED TO RIGHT) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-amber-50/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Today's Training Schedule</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active commitments for {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                {todayTrainings.length} Total
              </span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {todayTrainings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {todayTrainings.map((training) => (
                    <div key={training.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                          <Building2 size={22} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-800">{training.title}</h4>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-100">LIVE TODAY</span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {training.clientName} <span className="mx-1 text-slate-300">•</span> {training.startTime} <span className="mx-1 text-slate-300">•</span> {training.assignedPerson}
                          </p>
                        </div>
                      </div>
                      <CountdownTimer startTime={training.startTime} duration={training.duration} date={training.date} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <CheckCircle2 size={24} className="text-slate-200" />
                  </div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Active Sessions Today</h4>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Upcoming Training Schedule</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Future Roadmap & Pipeline</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                {upcomingTrainings.length} Planned
              </span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              {upcomingTrainings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingTrainings.map((training) => (
                    <div key={training.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Building2 size={22} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-800">{training.title}</h4>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded border bg-slate-50 text-slate-400 border-slate-100">
                              {training.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {training.clientName} <span className="mx-1 text-slate-300">•</span> {training.startTime} <span className="mx-1 text-slate-300">•</span> {training.assignedPerson}
                          </p>
                        </div>
                      </div>
                      <CountdownTimer startTime={training.startTime} duration={training.duration} date={training.date} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Calendar size={24} className="text-slate-200" />
                  </div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Future Sessions Planned</h4>
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
