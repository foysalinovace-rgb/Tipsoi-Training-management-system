
import React, { useState } from 'react';
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
  Layers,
  Users,
  Video,
  Youtube,
  Smartphone,
  Globe,
  MapPin,
  Crown
} from 'lucide-react';
import { SystemSettings, TrainingSlot, TutorialItem } from '../types';

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
  const [activeTab, setActiveTab] = useState<'branding' | 'tutorials' | 'kams' | 'packages' | 'slots'>('branding');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTutorialId, setEditingTutorialId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<TutorialItem>>({});

  const [newKam, setNewKam] = useState('');
  const [newPackage, setNewPackage] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotCapacity, setNewSlotCapacity] = useState<number>(2);
  
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingSlotTime, setEditingSlotTime] = useState('');
  const [editingSlotCapacity, setEditingSlotCapacity] = useState<number>(2);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'Invalid URL';
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'essential': return { icon: Package, color: 'bg-blue-50 text-blue-600' };
      case 'standard': return { icon: Layers, color: 'bg-indigo-50 text-indigo-600' };
      case 'premium': return { icon: Crown, color: 'bg-amber-50 text-amber-600' };
      case 'mobile': return { icon: Smartphone, color: 'bg-emerald-50 text-emerald-600' };
      case 'geo': return { icon: Globe, color: 'bg-teal-50 text-teal-600' };
      case 'location': return { icon: MapPin, color: 'bg-rose-50 text-rose-600' };
      default: return { icon: Video, color: 'bg-slate-50 text-slate-600' };
    }
  };

  const handleStartEditTutorial = (tut: TutorialItem) => {
    setEditingTutorialId(tut.id);
    setEditFields({ title: tut.title, description: tut.description, url: tut.url });
  };

  const handleSaveTutorial = () => {
    if (!editingTutorialId) return;
    const updatedTutorials = formData.tutorials.map(t => 
      t.id === editingTutorialId ? { ...t, ...editFields } : t
    );
    const newSettings = { ...formData, tutorials: updatedTutorials as TutorialItem[] };
    setFormData(newSettings);
    onUpdate(newSettings);
    setEditingTutorialId(null);
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Layout },
    { id: 'tutorials', label: 'Tutorials', icon: Video },
    { id: 'kams', label: 'KAM Master', icon: UserCheck },
    { id: 'packages', label: 'Package Master', icon: Package },
    { id: 'slots', label: 'Training Slots', icon: Clock },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
        <p className="text-slate-500 text-xs md:text-sm font-medium">Manage global masters, branding and tutorials</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-56 bg-slate-50/50 border-r border-slate-100 p-2 md:p-4 shrink-0 overflow-x-auto">
          <div className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-xl transition-all text-xs md:text-sm font-bold whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-blue-600 shadow-md border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
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
                  <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-blue-500 transition-all" value={formData.panelName} onChange={e => setFormData({ ...formData, panelName: e.target.value })} />
                </div>
                <button disabled={isSaving} type="submit" className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50">
                  {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                  Update Identity
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tutorials' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Video size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tutorial Content Manager</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Landing Page Content</p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.tutorials.map((tut) => (
                  <div key={tut.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                    {editingTutorialId === tut.id ? (
                      <div className="p-6 bg-slate-50 space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-500"
                              value={editFields.title}
                              onChange={e => setEditFields({...editFields, title: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">YouTube URL</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-500"
                              value={editFields.url}
                              onChange={e => setEditFields({...editFields, url: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                          <textarea 
                            rows={2}
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500 resize-none"
                            value={editFields.description}
                            onChange={e => setEditFields({...editFields, description: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => setEditingTutorialId(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                          <button onClick={handleSaveTutorial} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md">Apply Changes</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 flex items-center justify-between transition-colors hover:bg-blue-50/10">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getIconForType(tut.iconType).color}`}>
                            {React.createElement(getIconForType(tut.iconType).icon, { size: 20 })}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{tut.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[400px] mb-1">{tut.description}</p>
                            <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Youtube size={12} className="mr-1 text-red-500" />
                              ID: <span className="ml-1 text-slate-600">{getYoutubeId(tut.url)}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleStartEditTutorial(tut)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Rest of slots, kams, packages tabs remain standard */}
          {activeTab === 'slots' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Training Slot Master</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSlotTime) return;
                    const formatTo12h = (t: string) => {
                      let [h, m] = t.split(':');
                      let hh = parseInt(h);
                      const ampm = hh >= 12 ? 'PM' : 'AM';
                      hh = hh % 12 || 12;
                      return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
                    };
                    const formatted = formatTo12h(newSlotTime);
                    onUpdateSlots([...slots, { id: `slot-${Date.now()}`, time: formatted, isActive: true, capacity: newSlotCapacity }]);
                    setNewSlotTime('');
                  }} className="space-y-3">
                    <input required type="time" className="w-full px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-white" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
                    <input required type="number" min="1" className="w-full px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-white" value={newSlotCapacity} onChange={e => setNewSlotCapacity(parseInt(e.target.value))} />
                    <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase"><Plus size={18} className="inline mr-2" /> Add New</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
