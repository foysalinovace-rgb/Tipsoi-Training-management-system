
import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Image as ImageIcon, 
  Layout, 
  RefreshCw, 
  UserCheck, 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2,
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
  
  // Local states for management inputs
  const [newKam, setNewKam] = useState('');
  const [newPackage, setNewPackage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
    }, 600);
  };

  const handleAddKam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKam.trim()) {
      onUpdateKams([...kams, newKam.trim()]);
      setNewKam('');
    }
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPackage.trim()) {
      onUpdatePackages([...packages, newPackage.trim()]);
      setNewPackage('');
    }
  };

  const handleRemoveKam = (index: number) => {
    onUpdateKams(kams.filter((_, i) => i !== index));
  };

  const handleRemovePackage = (index: number) => {
    onUpdatePackages(packages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
          <p className="text-slate-500 text-sm">Manage system masters, branding, and global settings</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'branding' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Layout size={18} />
            <span>Branding</span>
          </button>
          <button 
            onClick={() => setActiveTab('kams')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'kams' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <UserCheck size={18} />
            <span>KAM</span>
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'packages' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Package size={18} />
            <span>Package</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center space-x-3 text-slate-800 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layout size={20} /></div>
                <h3 className="text-lg font-bold">Platform Branding</h3>
              </div>

              <form onSubmit={handleSubmitBranding} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Application Display Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-white font-medium shadow-sm"
                    value={formData.panelName}
                    onChange={e => setFormData({ ...formData, panelName: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">System Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon size={28} className="text-slate-300" />
                      )}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <span className="text-white text-[10px] font-bold uppercase">Edit</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Upload Logo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center disabled:opacity-70"
                  >
                    {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    Save Branding
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'kams' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><UserCheck size={20} /></div>
                  <h3 className="text-lg font-bold">KAM</h3>
                </div>
              </div>

              <form onSubmit={handleAddKam} className="flex space-x-2">
                <input 
                  required
                  type="text"
                  placeholder="Enter new KAM name..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium"
                  value={newKam}
                  onChange={e => setNewKam(e.target.value)}
                />
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md flex items-center"
                >
                  <Plus size={18} className="mr-2" /> Add
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {kams.map((kam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 group hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {kam.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{kam}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveKam(idx)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {kams.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <UserCheck size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No KAMs defined</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Package size={20} /></div>
                  <h3 className="text-lg font-bold">Package</h3>
                </div>
              </div>

              <form onSubmit={handleAddPackage} className="flex space-x-2">
                <input 
                  required
                  type="text"
                  placeholder="Enter new package name..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium"
                  value={newPackage}
                  onChange={e => setNewPackage(e.target.value)}
                />
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md flex items-center"
                >
                  <Plus size={18} className="mr-2" /> Add
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 group hover:border-purple-200 transition-all shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">
                        {pkg.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{pkg}</span>
                    </div>
                    <button 
                      onClick={() => handleRemovePackage(idx)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Package size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Packages defined</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
