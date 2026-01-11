
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Plus, 
  UserPlus, 
  Shield, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Edit3, 
  CheckCircle2,
  LayoutDashboard,
  BookOpenCheck,
  FileSpreadsheet,
  BarChart3,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ShieldIcon
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdatePassword: (userId: string, newPassword: string) => void;
  onDeleteUser: (userId: string) => void;
}

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Training Bookings', icon: BookOpenCheck },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
];

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onUpdateUser,
  onUpdateRole, 
  onUpdatePassword, 
  onDeleteUser 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  });
  const [showResetModal, setShowResetModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.STAFF,
    permissions: ['dashboard']
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    permissions: [] as string[]
  });

  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleTogglePermission = (modId: string, isEdit: boolean) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(modId) 
          ? prev.permissions.filter(p => p !== modId)
          : [...prev.permissions, modId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(modId) 
          ? prev.permissions.filter(p => p !== modId)
          : [...prev.permissions, modId]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `U-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...formData,
      avatar: ''
    };
    onAddUser(newUser);
    setShowAddModal(false);
    setFormData({ name: '', email: '', password: '', role: UserRole.STAFF, permissions: ['dashboard'] });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showEditModal.user) {
      const updatedUser: User = {
        ...showEditModal.user,
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        permissions: editFormData.permissions
      };
      onUpdateUser(updatedUser);
      setShowEditModal({ isOpen: false, user: null });
    }
  };

  const openEditModal = (user: User) => {
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });
    setShowEditModal({ isOpen: true, user });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePassword(showResetModal.userId, resetPasswordValue);
    setShowResetModal({ isOpen: false, userId: '', userName: '' });
    setResetPasswordValue('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System User Management</h2>
          <p className="text-slate-500 text-sm font-medium">Configure team access levels and security permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <UserPlus size={18} className="mr-2" />
          Provision New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Communications</th>
              <th className="px-6 py-4">Module Authorization</th>
              <th className="px-6 py-4">Security</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center text-xs font-semibold text-slate-600">
                    <Mail size={14} className="mr-2 text-slate-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {user.permissions?.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase border border-blue-100 whitespace-nowrap">
                        {p}
                      </span>
                    ))}
                    {(!user.permissions || user.permissions.length === 0) && <span className="text-slate-300 text-[10px] italic font-medium">No system access</span>}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <code className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono text-xs border border-slate-200">
                      {showPasswords[user.id] ? user.password : '••••••••'}
                    </code>
                    <button 
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                      title="Edit Permissions"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowResetModal({ isOpen: true, userId: user.id, userName: user.name })}
                      className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all"
                      title="Reset Credentials"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.role === UserRole.SUPER_ADMIN && users.filter(u => u.role === UserRole.SUPER_ADMIN).length <= 1}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal Permission Section Refined */}
      {(showAddModal || showEditModal.isOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 my-8">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  {showAddModal ? 'Create New System Account' : 'Edit Access Permissions'}
                </h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Define role and module authorization</p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal({ isOpen: false, user: null }); }} 
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full text-slate-400 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleSubmit : handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all" 
                    placeholder="e.g. John Smith"
                    value={showAddModal ? formData.name : editFormData.name} 
                    onChange={e => showAddModal ? setFormData({...formData, name: e.target.value}) : setEditFormData({...editFormData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all" 
                    placeholder="john@tipsoi.com"
                    value={showAddModal ? formData.email : editFormData.email} 
                    onChange={e => showAddModal ? setFormData({...formData, email: e.target.value}) : setEditFormData({...editFormData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {showAddModal && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                    <input 
                      required 
                      type="password" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all" 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                )}
                <div className={`space-y-1.5 ${!showAddModal ? 'col-span-2' : ''}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Base Role</label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                    value={showAddModal ? formData.role : editFormData.role} 
                    onChange={e => showAddModal ? setFormData({...formData, role: e.target.value as UserRole}) : setEditFormData({...editFormData, role: e.target.value as UserRole})} 
                  >
                    <option value={UserRole.STAFF}>General Staff</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Administrator</option>
                    <option value={UserRole.TRAINER}>Certified Trainer</option>
                    <option value={UserRole.KAM}>Account Manager</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center">
                    <ShieldIcon size={14} className="mr-2 text-blue-600" />
                    Module Access Authorization
                  </label>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Select Multiple</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {MODULES.map(mod => {
                    const isSelected = showAddModal 
                      ? formData.permissions.includes(mod.id)
                      : editFormData.permissions.includes(mod.id);
                      
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleTogglePermission(mod.id, !showAddModal)}
                        className={`flex items-center space-x-3 p-4 rounded-[1.25rem] border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                          isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                          <mod.icon size={20} className={isSelected ? 'text-white' : 'text-slate-400'} />
                        </div>
                        <div className="flex-1">
                          <span className={`text-[11px] font-black block leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>{mod.label}</span>
                          <span className={`text-[9px] font-bold mt-1 block uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {isSelected ? 'Enabled' : 'Restricted'}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                             <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setShowEditModal({ isOpen: false, user: null }); }} 
                  className="flex-1 px-6 py-4 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  {showAddModal ? 'Confirm & Create' : 'Save Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Modal remained as is for consistency but keeping same font weight logic */}
      {showResetModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Credential Refresh</h3>
                <p className="text-xs text-slate-500">Updating keys for {showResetModal.userName}</p>
              </div>
              <button onClick={() => setShowResetModal({ isOpen: false, userId: '', userName: '' })} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New System Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required autoFocus type="text" className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm bg-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="Minimum 6 characters" value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowResetModal({ isOpen: false, userId: '', userName: '' })} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
