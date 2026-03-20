import React from 'react';
import { Zap, Clock, Filter, MoreHorizontal, Send, Sparkles } from 'lucide-react';
import { Client } from '../types';
import { NURTURE_STEPS, TIER_COLORS } from '../constants';
import { sendWhatsApp } from '../utils';

interface NurtureViewProps {
  clients: Client[];
  onEditClient: (c: Client) => void;
}

export const NurtureView = ({ clients, onEditClient }: NurtureViewProps) => {
  const activeLeads = clients.filter(c => c.nurtureActive);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Nurture Funnel Header */}
      <div className="relative bg-[#0F172A] rounded-[3rem] p-12 text-white overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="max-w-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white backdrop-blur-xl">
                  <Zap className="w-6 h-6 fill-amber-400 stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 italic">Automação de Conteúdo Estratégico</p>
             </div>
             <h2 className="text-5xl font-black mb-4 italic tracking-tighter uppercase leading-[0.9]">Motor de Nutrição <span className="text-indigo-400">Ativado</span></h2>
             <p className="text-indigo-100/60 font-bold italic text-lg leading-relaxed">
               "Nossa IA gera prova social e autoridade automaticamente via WhatsApp para leads que ainda não converteram. Converta no piloto automático."
             </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl flex flex-col items-center min-w-[120px]">
                <p className="text-[10px] font-black text-indigo-400 uppercase italic mb-1">Leads Ativos</p>
                <p className="text-4xl font-black italic tracking-tighter">{activeLeads.length}</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl flex flex-col items-center min-w-[120px]">
                <p className="text-[10px] font-black text-emerald-400 uppercase italic mb-1">Taxa Abr.</p>
                <p className="text-4xl font-black italic tracking-tighter">84%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {NURTURE_STEPS.slice(0, 3).map((step, idx) => (
           <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 scale-150">
                <step.icon className="w-20 h-20 text-indigo-600" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 group-hover:scale-110 transition-all">
                    <step.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Nível {idx + 1}</p>
                    <h4 className="font-black text-slate-800 uppercase italic leading-none">{step.label}</h4>
                 </div>
              </div>
              <p className="text-xs font-bold text-slate-500 italic leading-relaxed mb-6">{step.desc}</p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 uppercase italic">U{i}</div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black text-indigo-600 uppercase italic tracking-tighter">12 Leads aqui</span>
              </div>
           </div>
         ))}
      </div>

      {/* Main Table Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
              <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest italic">Interações Programadas</h3>
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <Filter className="w-3 h-3" /> Filtrar Segmento
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 italic transition-all active:scale-95">
                <Sparkles className="w-3 h-3" /> Sugerir Abordagem IA
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Lead / Empresa</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Fluxo Atual</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Ação Próxima</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase italic tracking-widest text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLeads.map(client => {
                const tierStyle = TIER_COLORS[client.tier];
                return (
                  <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onEditClient(client)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm italic group-hover:scale-110 transition-transform">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-black text-slate-900 uppercase italic tracking-tighter">{client.name}</p>
                            <span 
                              className="px-1.5 py-0.5 rounded text-[8px] font-black italic border"
                              style={{ 
                                backgroundColor: tierStyle.bg, 
                                borderColor: tierStyle.border, 
                                color: tierStyle.text 
                              }}
                            >
                              T{client.tier}
                            </span>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase italic opacity-60">{client.contato} · {client.type} {client.endereco && ` · ${client.endereco}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-lg">
                          {React.createElement(NURTURE_STEPS[client.nurtureStep].icon, { className: 'w-4 h-4' })}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-900 uppercase italic leading-none mb-1">{NURTURE_STEPS[client.nurtureStep].label}</p>
                          <div className="flex gap-1">
                            {NURTURE_STEPS.map((_, i) => (
                              <div key={i} className={`h-1 rounded-full transition-all ${i === client.nurtureStep ? 'w-4 bg-indigo-600' : 'w-1 bg-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <p className="text-[10px] font-black text-slate-500 uppercase italic">Em 48 horas</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 italic">"Envio automático de: {NURTURE_STEPS[Math.min(client.nurtureStep + 1, 4)].label}"</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                         <button 
                          onClick={(e) => { e.stopPropagation(); sendWhatsApp(client.whatsapp, `Olá ${client.contato}, passando para compartilhar...`); }}
                          className="p-3 hover:bg-emerald-50 text-emerald-500 rounded-2xl transition-all border border-transparent hover:border-emerald-100 flex items-center gap-2"
                         >
                           <Send className="w-5 h-5" />
                           <span className="text-[10px] font-black uppercase italic tracking-tighter">Enviar Agora</span>
                         </button>
                         <button className="p-3 hover:bg-slate-100 text-slate-300 hover:text-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                           <MoreHorizontal className="w-5 h-5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
