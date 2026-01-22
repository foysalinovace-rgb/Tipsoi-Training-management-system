
import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, LogIn, ShieldAlert, X, ArrowLeft } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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
    }, 800);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-[480px] z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="p-10 flex flex-col items-center relative">
            
            {onBack && (
              <button 
                onClick={onBack}
                className="absolute top-8 left-8 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={14} className="mr-1" />
                Back to Booking
              </button>
            )}

            {/* Top Icon Area */}
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-8 mt-4">
              <LogIn className="text-slate-800" size={28} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Tipsoi CST</h1>
            <p className="text-slate-400 text-center text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
              training management system
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {error && (
                <div className="flex items-center p-4 text-xs font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  required
                  type="email"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-right px-1">
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#1e2229] hover:bg-[#2d333d] text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center mt-2"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Log in'}
              </button>
            </form>

            <div className="mt-12 text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Software Version 0.0.1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Security Protocol</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                To reset your password or recover access, please reach out to the <span className="text-slate-900 font-bold">System Super Administrator</span>.
              </p>
              
              <button 
                onClick={() => setShowForgotModal(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
              >
                Understood
              </button>
            </div>
            
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
