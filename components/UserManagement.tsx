
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
  ShieldIcon,
  User as UserIcon,
  Lock,
  Database,
  Ticket as TicketIcon
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdatePassword: (userId: string, newPassword: string) => void;
  onUpdatePermissions: (userId: string, permissions: string[]) => void;
  onDeleteUser: (userId: string) => void;
}

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mdb', label: 'Sales Ticket', icon: Database },
  { id: 'ticket', label: 'Ticket', icon: TicketIcon },
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
          Create New User
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

      {(showAddModal || showEditModal.isOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {showAddModal ? 'Create New User' : 'Edit User Access'}
                </h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-tighter">Define identity and system permissions</p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal({ isOpen: false, user: null }); }} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form 
              id="user-form" 
              onSubmit={showAddModal ? handleSubmit : handleEditSubmit} 
              className="p-5 space-y-4 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                    <UserIcon size={11} className="mr-1.5" /> Full Name
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none transition-all text-xs font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    value={showAddModal ? formData.name : editFormData.name} 
                    onChange={e => showAddModal ? setFormData({...formData, name: e.target.value}) : setEditFormData({...editFormData, name: e.target.value})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                    <Mail size={11} className="mr-1.5" /> Email Address
                  </label>
                  <input 
                    required 
                    type="email" 
                    placeholder="name@tipsoi.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none transition-all text-xs font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    value={showAddModal ? formData.email : editFormData.email} 
                    onChange={e => showAddModal ? setFormData({...formData, email: e.target.value}) : setEditFormData({...editFormData, email: e.target.value})} 
                  />
                </div>

                {showAddModal && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                      <Lock size={11} className="mr-1.5" /> Initial Password
                    </label>
                    <input 
                      required 
                      type="password" 
                      placeholder="Minimum 6 chars"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none transition-all text-xs font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center tracking-wider">
                    <Shield size={11} className="mr-1.5" /> System Role
                  </label>
                  <select 
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-xs font-bold bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    value={showAddModal ? formData.role : editFormData.role} 
                    onChange={e => showAddModal ? setFormData({...formData, role: e.target.value as UserRole}) : setEditFormData({...editFormData, role: e.target.value as UserRole})} 
                  >
                    <option value={UserRole.STAFF}>General Staff</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                    <option value={UserRole.TRAINER}>Trainer</option>
                    <option value={UserRole.KAM}>KAM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center mb-2 tracking-wider">
                  <ShieldIcon size={12} className="mr-1.5 text-blue-500" /> Authorized Modules
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MODULES.map(mod => {
                    const isSelected = showAddModal 
                      ? formData.permissions.includes(mod.id)
                      : editFormData.permissions.includes(mod.id);
                      
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleTogglePermission(mod.id, !showAddModal)}
                        className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 ${
                          isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <mod.icon size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                        <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>{mod.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end space-x-2 bg-slate-50/30 shrink-0">
              <button 
                type="button" 
                onClick={() => { setShowAddModal(false); setShowEditModal({ isOpen: false, user: null }); }} 
                className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                form="user-form"
                type="submit" 
                className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md hover:bg-slate-800 transition-all active:scale-95"
              >
                {showAddModal ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
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
