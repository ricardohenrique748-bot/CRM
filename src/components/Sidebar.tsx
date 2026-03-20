import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Zap, 
  Users, 
  GitMerge, 
  Settings, 
  LogOut,
  FileText
} from 'lucide-react';

export type Tab = 'dashboard' | 'matrix' | 'nurture' | 'clients' | 'pipeline' | 'settings';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  authUser: { name: string; role: string } | null;
  onLogout: () => void;
  tierACount: number;
}

const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'matrix', label: 'Análise de Funil', icon: BarChart3 },
  { id: 'nurture', label: 'Nutrição Inteligente', icon: Zap },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'pipeline', label: 'Canal de Vendas', icon: GitMerge },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  authUser, 
  onLogout,
  tierACount
}) => {
  if (!authUser) return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col z-50 shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">CRM</p>
            <p className="text-[10px] text-slate-400">Sales Machine</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {authUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{authUser.name}</p>
            <p className="text-[10px] text-indigo-500">{authUser.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-500' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 mb-4">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Nutrição Ativa</span>
          </div>
          <p className="text-[10px] text-emerald-600 leading-tight">
            Você tem {tierACount} clientes Tier A precisando de conteúdo.
          </p>
        </div>
      </div>

      <div className="p-3 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
