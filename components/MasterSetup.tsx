
import React from 'react';
import { Client, Trainer, KAM } from '../types';
import { MOCK_CLIENTS, MOCK_TRAINERS, MOCK_KAMS } from '../constants';
import { Contact2, Users, MapPin, Mail, Phone, BookOpen, Plus } from 'lucide-react';

const MasterSetup: React.FC = () => {
  const handleAction = (type: string) => {
    alert(`${type} management module is now ready for editing. You can add or modify entries here.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Data Configuration</h2>
          <p className="text-slate-500 text-sm">System masters and entity management for the enterprise</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">Import Excel</button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all">System Config</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Client Master */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Contact2 size={20} /></div>
              <h3 className="font-bold text-slate-800">Client Master</h3>
            </div>
            <button onClick={() => handleAction('Client')} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_CLIENTS.map(client => (
              <div key={client.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{client.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded uppercase font-bold text-slate-500">{client.id}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{client.company}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center"><Mail size={12} className="mr-1.5" /> {client.email}</div>
                  <div className="flex items-center"><Phone size={12} className="mr-1.5" /> {client.contact}</div>
                  <div className="flex items-center col-span-2"><MapPin size={12} className="mr-1.5" /> {client.address}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => handleAction('Client Master')} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">View Full Directory</button>
          </div>
        </div>

        {/* Trainer Master */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
              <h3 className="font-bold text-slate-800">Trainer Master</h3>
            </div>
            <button onClick={() => handleAction('Trainer')} className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              <Plus size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_TRAINERS.map(trainer => (
              <div key={trainer.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">{trainer.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded uppercase font-bold text-slate-500">{trainer.id}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {trainer.expertise.map((exp, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold">{exp}</span>
                  ))}
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Mail size={12} className="mr-1.5" /> {trainer.email}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => handleAction('Trainer Master')} className="text-[10px] font-bold uppercase tracking-widest text-purple-600 hover:underline">View Training Roster</button>
          </div>
        </div>

        {/* KAM Master */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden xl:col-span-2">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BookOpen size={20} /></div>
              <h3 className="font-bold text-slate-800">KAM Master</h3>
            </div>
            <button onClick={() => handleAction('KAM')} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all">Assign New KAM</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_KAMS.map(kam => (
              <div key={kam.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-green-300 transition-all cursor-pointer group">
                <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-green-600">{kam.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{kam.role}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <Mail size={12} className="mr-1.5" /> {kam.contact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterSetup;
