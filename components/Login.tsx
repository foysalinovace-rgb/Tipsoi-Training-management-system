
import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-8 text-center bg-white border-b border-slate-100">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tipsoi CST</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Enterprise Portal</p>
          </div>
          
          <div className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center p-3 text-sm text-red-600 bg-white rounded-lg border border-red-200 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Secure Sign In'}
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center bg-white">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">&copy; 2026 Tipsoi CST v0.0.1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
