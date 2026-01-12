
import React, { useState, useRef } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Layout, 
  RefreshCw, 
  UserCheck, 
  Package, 
  Plus, 
  Trash2, 
  X
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  kams: string[];
  onUpdateKams: (kams: string[]) => void;
  packages: string[];
  onUpdatePackages: (packages: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdate, 
  kams, 
  onUpdateKams, 
  packages, 
  onUpdatePackages 
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'kams' | 'packages'>('branding');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [newKam, setNewKam] = useState('');
  const [newPackage, setNewPackage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Layout },
    { id: 'kams', label: 'KAM Master', icon: UserCheck },
    { id: 'packages', label: 'Package Master', icon: Package },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
        <p className="text-slate-500 text-xs md:text-sm font-medium">Global masters and branding settings</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Responsive Tabs/Sidebar */}
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

        {/* Content Area */}
        <div className="flex-1 p-5 md:p-10">
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layout size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Visual Identity</h3>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setIsSaving(true); setTimeout(() => { onUpdate(formData); setIsSaving(false); }, 800); }} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" value={formData.panelName} onChange={e => setFormData({ ...formData, panelName: e.target.value })} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Logo</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden group relative">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon size={32} className="text-slate-200" />
                      )}
                      <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                         <RefreshCw size={16} className="text-white animate-spin-slow" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100">Browse Files</button>
                       <p className="text-[10px] text-slate-400 mt-2">Recommended: SVG or PNG (Transparent)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button disabled={isSaving} type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50">
                    {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Update Identity
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'kams' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><UserCheck size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">KAM Registry</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if(newKam.trim()) { onUpdateKams([...kams, newKam.trim()]); setNewKam(''); }}} className="flex flex-col sm:flex-row gap-2">
                <input required type="text" placeholder="Full name of Key Account Manager" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white" value={newKam} onChange={e => setNewKam(e.target.value)} />
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center"><Plus size={18} className="mr-2" /> Add Entry</button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kams.map((kam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                    <span className="text-sm font-bold text-slate-700 truncate">{kam}</span>
                    <button onClick={() => onUpdateKams(kams.filter((_, i) => i !== idx))} className="p-1.5 text-slate-200 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
               <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Package size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Package Inventory</h3>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if(newPackage.trim()) { onUpdatePackages([...packages, newPackage.trim()]); setNewPackage(''); }}} className="flex flex-col sm:flex-row gap-2">
                <input required type="text" placeholder="Package name or code" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-bold bg-white" value={newPackage} onChange={e => setNewPackage(e.target.value)} />
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center"><Plus size={18} className="mr-2" /> Add Item</button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-purple-200 transition-all">
                    <span className="text-sm font-bold text-slate-700 truncate">{pkg}</span>
                    <button onClick={() => onUpdatePackages(packages.filter((_, i) => i !== idx))} className="p-1.5 text-slate-200 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
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
