import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, LogIn, ShieldCheck, Zap, Database } from 'lucide-react';
import { User } from '../types';
import { STORAGE_KEY, USERS } from '../constants';

interface LoginPageProps {
  onLogin: (u: User) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) {
          setEmail(parsed.email);
          setPassword(parsed.password);
          setRemember(true);
        }
      } catch (e) {
        console.error('Error loading saved credentials', e);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      if (user) {
        if (remember) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        setWelcome(user.name);
        setTimeout(() => onLogin(user as User), 1500);
      } else {
        setError('E-mail ou senha incorretos. Tente novamente.');
        setLoading(false);
      }
    }, 1200);
  };

  if (welcome) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Bem-vindo, {welcome}!</h2>
          <p className="text-slate-400">Preparando seu ambiente personalizado...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-emerald-500/30">
      <div className="flex-1 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-0 p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CRM Builder <span className="text-emerald-500">v2.4</span></span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 p-20 max-w-2xl">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">Controle absoluto sobre sua <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">operação comercial.</span></h1>
          <p className="text-xl text-slate-400 font-medium mb-12">O CRM Builder transforma dados em estratégia, garantindo que nenhum contato esfrie e nenhum Tier A seja esquecido.</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Performance</span>
              </div>
              <p className="text-2xl font-bold text-white">40% <span className="text-xs text-slate-500 font-normal">Fast-track</span></p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Data Guard</span>
              </div>
              <p className="text-2xl font-bold text-white">99.9% <span className="text-xs text-slate-500 font-normal">Seguros</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[600px] bg-white flex items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">CB</div>
              <span className="font-bold text-slate-900">CRM Builder</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Entrar na conta</h2>
            <p className="text-slate-500 font-medium">Informe suas credenciais de acesso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                  <div className="w-8 h-8 rounded-full bg-rose-200/50 flex items-center justify-center flex-shrink-0">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Seu E-mail</label>
              <div className="relative group">
                <input type="email" required placeholder="exemplo@empresa.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-5 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500/20 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Sua Senha</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Esqueceu a senha?</button>
              </div>
              <div className="relative group">
                <input type={show ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500/20 focus:bg-white transition-all outline-none" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200/50 rounded-xl transition-colors">
                  {show ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="hidden" />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all ${remember ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                    {remember && <LogIn className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Lembrar de mim</span>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-slate-900/10 relative overflow-hidden group">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Acessar Painel <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">© 2025 CRM Builder — Sistema Proprietário</p>
          </div>
        </div>
      </div>
    </div>
  );
};
