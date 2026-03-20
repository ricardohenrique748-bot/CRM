import React from 'react';
import { 
  Settings, User, Bell, Shield, Wallet, 
  ExternalLink, Smartphone, Globe, Mail, 
  Database, Zap, Key, Cpu, HelpCircle, 
  Trash2, LogOut, ChevronRight, MessageSquare, Clock 
} from 'lucide-react';

export const SettingsView = () => {
  const sections = [
    {
      title: 'Minha Conta',
      icon: User,
      items: [
        { label: 'Perfil do Vendedor', desc: 'Dados e metas comerciais', icon: User },
        { label: 'Segurança', desc: 'Autenticação em dois fatores', icon: Shield },
        { label: 'Sincronização', desc: 'Google Calendar e Outlook', icon: RefreshCw }
      ]
    },
    {
      title: 'Integrações Pro',
      icon: Zap,
      items: [
        { label: 'WhatsApp API', desc: 'Chip oficial conectado', icon: MessageSquare, status: 'Ativo', badge: 'PRO' },
        { label: 'ERP / Faturamento', desc: 'Conector de vendas real', icon: Database, status: 'Pendente' },
        { label: 'IA Copilot', desc: 'Dicas de abordagem em tempo real', icon: Cpu, badge: 'IA' }
      ]
    },
    {
      title: 'Preferências',
      icon: Bell,
      items: [
        { label: 'Notificações', desc: 'Push e lembretes de leads', icon: Bell },
        { label: 'Moeda e Formatos', desc: 'Configurações regionais', icon: Globe },
        { label: 'Relatórios por E-mail', desc: 'Resumo semanal de vendas', icon: Mail }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden shadow-indigo-200">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
              <Settings className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 italic italic">Painel de Configurações</p>
          </div>
          <h2 className="text-4xl font-black mb-3 italic tracking-tighter uppercase leading-none">Console do Gestor</h2>
          <p className="text-indigo-100/70 font-bold italic leading-relaxed max-w-lg">
            "Configure suas métricas de score, integre seu faturamento e gerencie as permissões da sua equipe comercial em um só lugar."
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto relative z-10 shrink-0">
          <button className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase italic tracking-widest transition-all">
            <Smartphone className="w-4 h-4" /> Versão Mobile
          </button>
          <button className="flex items-center gap-4 bg-white text-indigo-900 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase italic tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl">
             <ExternalLink className="w-4 h-4" /> Exportar Leads
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest italic">{section.title}</h3>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-black text-slate-800 text-xs uppercase italic tracking-widest">{item.label}</p>
                        {item.badge && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ring-1 ring-inset ${item.badge === 'IA' ? 'bg-indigo-50 text-indigo-600 ring-indigo-200' : 'bg-amber-50 text-amber-600 ring-amber-200'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic leading-none">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status && (
                      <span className={`text-[9px] font-black uppercase italic ${item.status === 'Ativo' ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {item.status}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">Assinatura Atual</p>
            <p className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">Plano Enterprise Elite</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">Armazenamento</p>
            <p className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">92% Disponível</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-8 py-4 text-rose-500 font-black text-xs uppercase italic tracking-widest hover:bg-rose-50 rounded-[1.5rem] transition-all flex items-center gap-3">
             <Trash2 className="w-4 h-4" /> Limpar Histórico
          </button>
          <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase italic tracking-widest hover:shadow-2xl transition-all shadow-xl active:scale-95 flex items-center gap-3">
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock RefreshCw for settings
const RefreshCw = ({ className }: { className: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
