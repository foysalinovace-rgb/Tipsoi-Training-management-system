
import React, { useState } from 'react';
import { Save, Layout, RefreshCw } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200"><Layout size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Settings</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Branding & Global Controls</p>
        </div>
      </div>

      <div className="max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Name</label>
            <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-sm font-bold focus:border-slate-900 outline-none transition-all" value={formData.panelName} onChange={e => setFormData({ ...formData, panelName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Default Slot Capacity</label>
            <input required type="number" className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-sm font-bold focus:border-slate-900 outline-none transition-all" value={formData.slotCapacity} onChange={e => setFormData({ ...formData, slotCapacity: parseInt(e.target.value) })} />
          </div>
          <button disabled={isSaving} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl active:scale-95">
            {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
            Save Branding
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
