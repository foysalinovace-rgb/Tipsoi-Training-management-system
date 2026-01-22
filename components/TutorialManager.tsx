
import React, { useState } from 'react';
import { 
  Video, 
  PlusCircle, 
  Trash2, 
  Video as VideoIcon, 
  Edit3, 
  Save, 
  X, 
  Type, 
  Link as LinkIcon, 
  Layout, 
  Smile,
  Box,
  Layers,
  Crown,
  Smartphone,
  Globe,
  MapPin,
  Info
} from 'lucide-react';
import { TutorialItem } from '../types';

interface TutorialManagerProps {
  tutorials: TutorialItem[];
  onUpdate: (tutorials: TutorialItem[]) => void;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({ tutorials, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<TutorialItem>>({
    title: '',
    description: '',
    url: '',
    category: 'package',
    iconType: 'essential'
  });

  const handleAddOrUpdate = async () => {
    if (!formData.title || !formData.url) {
      alert("Title (Package Name) and YouTube URL are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = tutorials.map(t => 
          t.id === editingId ? { ...t, ...formData } as TutorialItem : t
        );
        await onUpdate(updated);
        setEditingId(null);
      } else {
        const item: TutorialItem = {
          id: `tut-${Date.now()}`,
          title: formData.title || '',
          description: formData.description || '',
          url: formData.url || '',
          category: formData.category as any,
          iconType: formData.iconType as any
        };
        await onUpdate([...tutorials, item]);
      }
      
      setFormData({ title: '', description: '', url: '', category: 'package', iconType: 'essential' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (tut: TutorialItem) => {
    setEditingId(tut.id);
    setFormData({
      title: tut.title,
      description: tut.description,
      url: tut.url,
      category: tut.category,
      iconType: tut.iconType
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', url: '', category: 'package', iconType: 'essential' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this tutorial and its video link?")) {
      await onUpdate(tutorials.filter(t => t.id !== id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'essential': return <Box size={16} />;
      case 'standard': return <Layers size={16} />;
      case 'premium': return <Crown size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'geo': return <Globe size={16} />;
      case 'location': return <MapPin size={16} />;
      default: return <VideoIcon size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Video size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Tutorial Management</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Customize packages & video links</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                {editingId ? 'Edit Package Info' : 'Add New Content'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                  <Type size={10} className="mr-1" /> Package/Module Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Essential Package" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                  <LinkIcon size={10} className="mr-1" /> YouTube Video URL
                </label>
                <input 
                  type="text" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all" 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})} 
                />
                <p className="text-[8px] text-slate-400 font-medium ml-1">Copy and paste the full link from your browser.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <Layout size={10} className="mr-1" /> Category
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50 focus:bg-white outline-none" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="package">Main Package</option>
                    <option value="addon">Add-on Module</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                    <Smile size={10} className="mr-1" /> Branding Icon
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50 focus:bg-white outline-none" 
                    value={formData.iconType} 
                    onChange={e => setFormData({...formData, iconType: e.target.value as any})}
                  >
                    <option value="essential">Essential (Blue)</option>
                    <option value="standard">Standard (Layers)</option>
                    <option value="premium">Premium (Gold)</option>
                    <option value="mobile">Mobile (Green)</option>
                    <option value="geo">Geo (Globe)</option>
                    <option value="location">Location (Rose)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                  Feature Description
                </label>
                <textarea 
                  placeholder="Summarize what this package offers..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all h-24 resize-none" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </div>

            <button 
              onClick={handleAddOrUpdate} 
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingId ? <><Save size={16} className="mr-2" /> Update Content</> : <><PlusCircle size={16} className="mr-2" /> Publish Content</>}
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Configured Content ({tutorials.length})</h3>
            <div className="flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <Info size={10} className="mr-1.5" /> CHANGES AUTO-SYNC TO PUBLIC VIEW
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {tutorials.map((tut, idx) => (
              <div 
                key={tut.id} 
                className={`bg-white p-6 rounded-[2rem] border transition-all flex items-center justify-between group shadow-sm ${editingId === tut.id ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${tut.category === 'package' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    {getIcon(tut.iconType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-base font-black text-slate-800">{tut.title}</h5>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tut.category === 'package' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {tut.category === 'package' ? 'PACKAGE' : 'ADD-ON'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-md">{tut.description || "No description provided."}</p>
                    <div className="flex items-center text-[9px] text-indigo-500 font-mono">
                      <LinkIcon size={10} className="mr-1" /> {tut.url ? (tut.url.length > 50 ? tut.url.substring(0, 50) + '...' : tut.url) : 'No URL Configured'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => startEdit(tut)} 
                    className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Edit Content"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(tut.id)} 
                    className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Content"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {tutorials.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                <VideoIcon size={48} className="mx-auto text-slate-200 mb-4" />
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Library Empty</h4>
                <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Start by publishing your first training video</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialManager;
