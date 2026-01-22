
import React, { useState, useRef } from 'react';
import { 
  Save, 
  Layout, 
  RefreshCw, 
  UserCheck, 
  Package, 
  Plus, 
  Trash2, 
  Clock,
  Calendar,
  Edit3,
  Check,
  X,
  Layers
} from 'lucide-react';
import { SystemSettings, TrainingSlot } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  kams: string[];
  onUpdateKams: (kams: string[]) => void;
  packages: string[];
  onUpdatePackages: (packages: string[]) => void;
  slots: TrainingSlot[];
  onUpdateSlots: (slots: TrainingSlot[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdate, 
  kams, 
  onUpdateKams, 
  packages, 
  onUpdatePackages,
  slots,
  onUpdateSlots
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'kams' | 'packages' | 'slots'>('branding');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [newKam, setNewKam] = useState('');
  const [newPackage, setNewPackage] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  
  // Slot Editing State
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingSlotTime, setEditingSlotTime] = useState('');

  const formatTo12h = (time24: string) => {
    const [h, m] = time24.split(':');
    let hh = parseInt(h);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;
    const formattedTime = formatTo12h(newSlotTime);
    if (slots.some(s => s.time === formattedTime)) {
      alert("This time slot already exists.");
      return;
    }
    const newSlot: TrainingSlot = {
      id: `slot-${Date.now()}`,
      time: formattedTime,
      isActive: true
    };
    onUpdateSlots([...slots, newSlot]);
    setNewSlotTime('');
  };

  const handleStartEdit = (slot: TrainingSlot) => {
    setEditingSlotId(slot.id);
    // Try to convert 12h back to 24h for input value
    const [time, ampm] = slot.time.split(' ');
    let [h, m] = time.split(':');
    let hh = parseInt(h);
    if (ampm === 'PM' && hh < 12) hh += 12;
    if (ampm === 'AM' && hh === 12) hh = 0;
    setEditingSlotTime(`${String(hh).padStart(2, '0')}:${m}`);
  };

  const handleSaveEdit = () => {
    if (!editingSlotTime) return;
    const formatted = formatTo12h(editingSlotTime);
    const updated = slots.map(s => s.id === editingSlotId ? { ...s, time: formatted } : s);
    onUpdateSlots(updated);
    setEditingSlotId(null);
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Layout },
    { id: 'kams', label: 'KAM Master', icon: UserCheck },
    { id: 'packages', label: 'Package Master', icon: Package },
    { id: 'slots', label: 'Training Slots', icon: Clock },
  ];

  const handleSaveCapacity = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
        <p className="text-slate-500 text-xs md:text-sm font-medium">Global masters and branding settings</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <div className="w-full md:w-56 bg-slate-50/50 border-r border-slate-100 p-2 md:p-4 shrink-0 overflow-x-auto">
          <div className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-xl transition-all text-xs md:text-sm font-bold whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-md border border-slate-200' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-5 md:p-10">
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layout size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Visual Identity</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setIsSaving(true); setTimeout(() => { onUpdate(formData); setIsSaving(false); }, 800); }} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" value={formData.panelName} onChange={e => setFormData({ ...formData, panelName: e.target.value })} />
                </div>
                <div className="pt-6">
                  <button disabled={isSaving} type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50">
                    {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Update Identity
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Training Slot Master</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 mb-4 flex items-center"><Calendar size={14} className="mr-2" /> Define available daily training times</p>
                  <form onSubmit={handleAddSlot} className="flex flex-col gap-3">
                    <input required type="time" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-blue-500 transition-all" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
                    <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-800 shadow-xl flex items-center justify-center">
                      <Plus size={18} className="mr-2" /> Add New
                    </button>
                  </form>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-800 mb-4 flex items-center"><Layers size={14} className="mr-2" /> Slot Capacity Configuration</p>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bookings Allowed per Time Slot</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-black bg-white focus:border-blue-500 transition-all"
                      value={formData.slotCapacity}
                      onChange={e => setFormData({ ...formData, slotCapacity: parseInt(e.target.value) || 1 })}
                    />
                    <button 
                      onClick={handleSaveCapacity}
                      disabled={isSaving}
                      className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 shadow-lg flex items-center justify-center"
                    >
                      {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                      Save Capacity
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {slots.map((slot, idx) => (
                  <div key={slot.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px]">{idx + 1}</div>
                      {editingSlotId === slot.id ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="time" 
                            className="px-2 py-1 rounded-lg border border-blue-200 text-xs font-bold outline-none"
                            value={editingSlotTime}
                            onChange={e => setEditingSlotTime(e.target.value)}
                          />
                          <button onClick={handleSaveEdit} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"><Check size={14}/></button>
                          <button onClick={() => setEditingSlotId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><X size={14}/></button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-black text-slate-800">{slot.time}</p>
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-tighter">Active Slot</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                      {!editingSlotId && (
                        <button onClick={() => handleStartEdit(slot)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                      )}
                      <button onClick={() => onUpdateSlots(slots.filter(s => s.id !== slot.id))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'kams' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><UserCheck size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">KAM Registry</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if(newKam.trim()) { onUpdateKams([...kams, newKam.trim()]); setNewKam(''); }}} className="flex gap-2">
                <input required type="text" placeholder="KAM name" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white" value={newKam} onChange={e => setNewKam(e.target.value)} />
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 shadow-lg flex items-center justify-center"><Plus size={18} className="mr-2" /> Add</button>
              </form>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {kams.map((kam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group">
                    <span className="text-sm font-bold text-slate-700 truncate">{kam}</span>
                    <button onClick={() => onUpdateKams(kams.filter((_, i) => i !== idx))} className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Package size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Package Inventory</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if(newPackage.trim()) { onUpdatePackages([...packages, newPackage.trim()]); setNewPackage(''); }}} className="flex gap-2">
                <input required type="text" placeholder="Package code" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white" value={newPackage} onChange={e => setNewPackage(e.target.value)} />
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 shadow-lg flex items-center justify-center"><Plus size={18} className="mr-2" /> Add</button>
              </form>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group">
                    <span className="text-sm font-bold text-slate-700 truncate">{pkg}</span>
                    <button onClick={() => onUpdatePackages(packages.filter((_, i) => i !== idx))} className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
