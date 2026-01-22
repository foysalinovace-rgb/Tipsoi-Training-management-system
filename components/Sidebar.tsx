
import React from 'react';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  LogOut, 
  BarChart3,
  Users as UsersIcon,
  Settings as SettingsIcon,
  FileSpreadsheet,
  X,
  Database,
  Ticket as TicketIcon,
  ClipboardList
} from 'lucide-react';
import { User, SystemSettings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  systemSettings: SystemSettings;
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, systemSettings, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mdb', label: 'Sales Ticket', icon: Database },
    { id: 'ticket', label: 'Ticket', icon: TicketIcon },
    { id: 'bookings', label: 'Training Bookings', icon: BookOpenCheck },
    { id: 'slot-report', label: 'Slot Report', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: UsersIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const filteredMenu = menuItems.filter(item => 
    currentUser.permissions?.includes(item.id) || currentUser.permissions?.includes('all') || true // Allowing for now or check perms
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out w-56 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      } overflow-hidden`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <h1 className="text-sm font-black tracking-tight text-blue-400 line-clamp-1 whitespace-nowrap uppercase tracking-tighter">
              {systemSettings.panelName}
            </h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-white' : 'text-slate-500'} />
              <span className="font-bold text-[11px] whitespace-nowrap uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors group"
          >
            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold text-[11px] tracking-wide whitespace-nowrap uppercase">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
