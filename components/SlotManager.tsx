
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, Calendar, Plus, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Edit3, Save, X } from 'lucide-react';
import { TrainingSlot } from '../types';

interface SlotManagerProps {
  slots: TrainingSlot[];
  onUpdate: (slots: TrainingSlot[]) => void;
  slotCapacity: number;
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_TIMES = ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'];

const SlotManager: React.FC<SlotManagerProps> = ({ slots, onUpdate, slotCapacity = 2 }) => {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const calRef = useRef<HTMLDivElement>(null);

  const [newTime, setNewTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editCapacity, setEditCapacity] = useState<number>(2);

  const currentSlots = useMemo(() => {
    const daySlots = slots.filter(s => s.date === selectedDate);
    if (daySlots.length === 0) {
      return DEFAULT_TIMES.map((time, idx) => ({
        id: `virtual-${selectedDate}-${idx}`,
        time,
        isActive: true,
        capacity: slotCapacity || 2,
        date: selectedDate,
        isVirtual: true 
      }));
    }
    return daySlots;
  }, [slots, selectedDate, slotCapacity]);

  const handleToggle = (slot: any) => {
    let updated = [...slots];
    if (slot.isVirtual) {
      const materialized = currentSlots.map(s => ({
        id: `slot-${Math.random().toString(36).substr(2, 9)}`,
        time: s.time,
        isActive: s.id === slot.id ? !s.isActive : s.isActive,
        capacity: s.capacity,
        date: selectedDate
      }));
      updated = [...updated, ...materialized];
    } else {
      updated = slots.map(s => s.id === slot.id ? { ...s, isActive: !s.isActive } : s);
    }
    onUpdate(updated);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    let updated = [...slots];
    const isVirtual = editingId.startsWith('virtual-');

    if (isVirtual) {
      const materialized = currentSlots.map(s => {
        const isTarget = s.id === editingId;
        return {
          id: `slot-${Math.random().toString(36).substr(2, 9)}`,
          time: isTarget ? editTime : s.time,
          isActive: s.isActive,
          capacity: isTarget ? Number(editCapacity) : s.capacity,
          date: selectedDate
        };
      });
      updated = [...updated, ...materialized];
    } else {
      updated = slots.map(s => s.id === editingId ? { ...s, time: editTime, capacity: Number(editCapacity) } : s);
    }

    onUpdate(updated);
    setEditingId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    
    let updated = [...slots];
    if (!slots.some(s => s.date === selectedDate)) {
      const materialized = currentSlots.map(s => ({
        id: `slot-${Math.random().toString(36).substr(2, 9)}`,
        time: s.time,
        isActive: s.isActive,
        capacity: s.capacity,
        date: selectedDate
      }));
      updated = [...updated, ...materialized];
    }

    const newSlot: TrainingSlot = { 
      id: `slot-${Date.now()}`, 
      time: format12(newTime), 
      isActive: true, 
      capacity: slotCapacity || 2, 
      date: selectedDate 
    };
    onUpdate([...updated, newSlot]);
    setNewTime('');
  };

  const format12 = (t: string) => {
    if (!t.includes(':')) return t;
    let [h, m] = t.split(':');
    let hh = parseInt(h);
    const ap = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2, '0')}:${m} ${ap}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><Clock size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Session Slots</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configure date-wise availability</p>
          </div>
        </div>
        <div className="relative" ref={calRef}>
          <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex items-center space-x-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={18} className="text-blue-600" />
            <span className="uppercase tracking-tight">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </button>
          {isCalendarOpen && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-50 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-tight">{calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <div className="flex space-x-1">
                  <button onClick={() => setCalMonth(new Date(calMonth.setMonth(calMonth.getMonth()-1)))} className="p-1 hover:bg-slate-50 rounded-lg"><ChevronLeft size={16}/></button>
                  <button onClick={() => setCalMonth(new Date(calMonth.setMonth(calMonth.getMonth()+1)))} className="p-1 hover:bg-slate-50 rounded-lg"><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[9px] font-black text-slate-300">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => {
                  const day = i - new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay() + 1;
                  const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                  if (day <= 0 || day > new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate()) return <div key={i} />;
                  const str = getLocalDateString(d);
                  return <button key={i} onClick={() => { setSelectedDate(str); setIsCalendarOpen(false); }} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${str === selectedDate ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-50 text-slate-600'}`}>{day}</button>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center animate-in slide-in-from-left duration-500">
          <h4 className="text-[10px] font-black uppercase text-blue-600 mb-6 tracking-[0.2em] ml-1">New Custom Time</h4>
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Session Start</label>
              <input 
                required 
                type="time" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 text-sm font-black bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner" 
                value={newTime} 
                onChange={e => setNewTime(e.target.value)} 
              />
            </div>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center">
              <Plus size={16} className="mr-2" /> Add Session
            </button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
            <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
              New slots will default to 2 capacity. You can modify this after creation using the edit tool.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Daily Capacity Allocation</h3>
          </div>
          <div className="space-y-3">
            {currentSlots.map(slot => (
              <div key={slot.id} className={`p-6 rounded-3xl border transition-all duration-300 ${slot.isActive ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' : 'bg-red-50/30 border-red-100 opacity-80'}`}>
                {editingId === slot.id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Edit Time</label>
                          <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-xs bg-white outline-none focus:border-blue-500" value={editTime} onChange={e => setEditTime(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Capacity</label>
                          <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-xs bg-white outline-none focus:border-blue-500" value={editCapacity} onChange={e => setEditCapacity(parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={handleSaveEdit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center shadow-lg shadow-blue-500/20"><Save size={14} className="mr-2"/>Save Changes</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase flex items-center justify-center"><X size={14} className="mr-2"/>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${slot.isActive ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-600'}`}><Clock size={22}/></div>
                      <div>
                        <h5 className={`text-lg font-black tracking-tight ${slot.isActive ? 'text-slate-900' : 'text-red-700'}`}>{slot.time}</h5>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity: {slot.capacity}</span>
                          {slot.isVirtual && <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">Default</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                      <button onClick={() => handleToggle(slot)} className={`p-3 rounded-xl transition-all ${slot.isActive ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-red-600 bg-red-100'}`} title={slot.isActive ? "Deactivate" : "Activate"}>
                        {slot.isActive ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                      </button>
                      <button onClick={() => { setEditingId(slot.id); setEditTime(slot.time); setEditCapacity(slot.capacity); }} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Session">
                        <Edit3 size={18}/>
                      </button>
                      {!slot.isVirtual && (
                        <button onClick={() => onUpdate(slots.filter(s => s.id !== slot.id))} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Permanent Slot">
                          <Trash2 size={18}/>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {currentSlots.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                 <Clock size={40} className="mx-auto text-slate-100 mb-4" />
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No slots defined for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotManager;
