
import React, { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';

interface PackageManagerProps {
  packages: string[];
  onUpdate: (packages: string[]) => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ packages, onUpdate }) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onUpdate([...packages, name.trim()]);
    setName('');
  };

  const handleDelete = (val: string) => onUpdate(packages.filter(p => p !== val));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200"><Package size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Package Configuration</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage system software editions</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex space-x-4 mb-10">
          <input type="text" placeholder="Edition Name..." className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 text-sm font-bold focus:border-amber-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={handleAdd} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center">
            <Plus size={18} className="mr-2" /> New Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(p => (
            <div key={p} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-amber-200 transition-all">
              <span className="text-sm font-bold text-slate-700">{p}</span>
              <button onClick={() => handleDelete(p)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageManager;
