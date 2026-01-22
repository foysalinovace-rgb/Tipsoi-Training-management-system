
import React, { useState } from 'react';
import { UserCheck, Plus, Trash2 } from 'lucide-react';

interface KAMManagerProps {
  kams: string[];
  onUpdate: (kams: string[]) => void;
}

const KAMManager: React.FC<KAMManagerProps> = ({ kams, onUpdate }) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onUpdate([...kams, name.trim()]);
    setName('');
  };

  const handleDelete = (val: string) => onUpdate(kams.filter(k => k !== val));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200"><UserCheck size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">KAM</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Key Account Management personnel</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex space-x-4 mb-10">
          <input type="text" placeholder="Enter Full Name..." className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 text-sm font-bold focus:border-emerald-600 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={handleAdd} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center">
            <Plus size={18} className="mr-2" /> Add KAM
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kams.map(k => (
            <div key={k} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all">
              <span className="text-sm font-bold text-slate-700">{k}</span>
              <button onClick={() => handleDelete(k)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KAMManager;
