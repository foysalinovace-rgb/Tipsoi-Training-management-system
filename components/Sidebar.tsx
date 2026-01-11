
import React from 'react';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  LogOut, 
  BarChart3,
  Users as UsersIcon,
  Settings as SettingsIcon,
  FileSpreadsheet
} from 'lucide-react';
import { User, SystemSettings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  systemSettings: SystemSettings;
  isOpen: boolean; 
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, systemSettings, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Training Bookings', icon: BookOpenCheck },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: UsersIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Filter menu items based on user's granular permissions
  const filteredMenu = menuItems.filter(item => 
    currentUser.permissions?.includes(item.id)
  );

  return (
    <div className={`w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        {systemSettings.logo && (
          <div className="w-10 h-10 shrink-0 bg-white/5 rounded-lg p-1.5 overflow-hidden">
            <img src={systemSettings.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold tracking-tight text-blue-400 line-clamp-1">{systemSettings.panelName}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Enterprise</p>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-slate-500'} />
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
