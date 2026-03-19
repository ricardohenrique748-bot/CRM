import React from 'react';
import { 
  LayoutDashboard, Users, TrendingUp, Target, BarChart3, 
  Settings, LogOut, KeyRound, Zap, MessageSquare, Clock
} from 'lucide-react';
import { Tab, User } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  user: User | null;
  onLogout: () => void;
  onOpenBling: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, user, onLogout, onOpenBling }: SidebarProps) => {
  const menu = [
    { id: 'dashboard', label: 'Estratégia', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'pipeline', label: 'Funil', icon: TrendingUp },
    { id: 'matrix', label: 'Matriz', icon: Target },
    { id: 'nurture', label: 'Nutrição', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900 ring-2 ring-indigo-500/50">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">CRM <span className="text-indigo-500">Flux</span></h1>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase mt-1">Enterprise</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menu.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-[1.02] ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:pl-7'}`}>
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`text-sm font-black uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <button onClick={onOpenBling} className="w-full flex items-center gap-4 px-5 py-4 bg-slate-800/100 border border-slate-700/50 hover:bg-slate-700 rounded-2xl transition-all group overflow-hidden relative">
          <KeyRound className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Conexão Bling</span>
          <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/100 rounded-[2rem] border border-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center text-indigo-400 font-black relative ring-2 ring-slate-800">
               {user?.name?.[0]}
               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role}</p>
            </div>
            <button onClick={onLogout} className="p-2.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all transform hover:rotate-12">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
