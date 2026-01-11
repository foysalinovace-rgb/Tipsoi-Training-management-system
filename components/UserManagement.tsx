
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, UserPlus, Shield, Trash2, Mail, ShieldCheck, ShieldAlert, X, Key, Eye, EyeOff, Edit3, CheckCircle2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdatePassword: (userId: string, newPassword: string) => void;
  onDeleteUser: (userId: string) => void;
}

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings', label: 'Training Bookings' },
  { id: 'reports', label: 'Reports' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'users', label: 'User Management' },
  { id: 'settings', label: 'Settings' }
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
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm">Create and manage access levels for system users</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
        >
          <UserPlus size={18} className="mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Name & ID</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Permissions</th>
              <th className="px-6 py-4">Password</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail size={14} className="mr-2 text-slate-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {user.permissions?.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase border border-slate-200">
                        {p}
                      </span>
                    ))}
                    {(!user.permissions || user.permissions.length === 0) && <span className="text-slate-300 text-[10px] italic">No access</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <code className="bg-slate-50 px-2 py-1 rounded text-slate-600 font-mono text-xs border border-slate-100">
                      {showPasswords[user.id] ? user.password : '••••••••'}
                    </code>
                    <button 
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                      title="Edit User"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowResetModal({ isOpen: true, userId: user.id, userName: user.name })}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.role === UserRole.SUPER_ADMIN && users.filter(u => u.role === UserRole.SUPER_ADMIN).length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
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

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add New System User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <input required type="password" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Base Role</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} >
                    <option value={UserRole.STAFF}>Staff</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                    <option value={UserRole.TRAINER}>Trainer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Module Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map(mod => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleTogglePermission(mod.id, false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                        formData.permissions.includes(mod.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 grayscale hover:grayscale-0'
                      }`}
                    >
                      <span className="text-xs font-bold">{mod.label}</span>
                      {formData.permissions.includes(mod.id) && <CheckCircle2 size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg shadow-lg">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit User Permissions</h3>
              <button onClick={() => setShowEditModal({ isOpen: false, user: null })} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value as UserRole})} >
                  <option value={UserRole.STAFF}>Staff</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  <option value={UserRole.TRAINER}>Trainer</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Module Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map(mod => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleTogglePermission(mod.id, true)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                        editFormData.permissions.includes(mod.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 grayscale hover:grayscale-0'
                      }`}
                    >
                      <span className="text-xs font-bold">{mod.label}</span>
                      {editFormData.permissions.includes(mod.id) && <CheckCircle2 size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowEditModal({ isOpen: false, user: null })} className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg shadow-lg">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                <p className="text-xs text-slate-500">Updating credentials for {showResetModal.userName}</p>
              </div>
              <button onClick={() => setShowResetModal({ isOpen: false, userId: '', userName: '' })} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required autoFocus type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter new strong password" value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowResetModal({ isOpen: false, userId: '', userName: '' })} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
