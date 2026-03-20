import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { Client } from '../types';
import { fmt } from '../utils';
import { Card } from './ui/Card';

interface DashboardViewProps {
  clients: Client[];
}

export const DashboardView = ({ clients }: DashboardViewProps) => {
  // Pipeline data analysis
  const stages = [
    { id: 0, label: 'Prospectando', prob: 0.1, color: '#f1f5f9', text: '#64748b' },
    { id: 1, label: 'Qualificando', prob: 0.25, color: '#eff6ff', text: '#3b82f6' },
    { id: 2, label: 'Proposta', prob: 0.5, color: '#f5f3ff', text: '#8b5cf6' },
    { id: 3, label: 'Negociando', prob: 0.75, color: '#fdf4ff', text: '#d946ef' },
    { id: 4, label: 'Contrato', prob: 0.95, color: '#f0fdf4', text: '#16a34a' },
  ];

  const stagesData = stages.map(s => {
    const stageClients = clients.filter(c => c.pipelineStage === s.id);
    const value = stageClients.reduce((acc, c) => acc + (c.ticketMedio || 0), 0);
    return { ...s, count: stageClients.length, value, weighted: value * s.prob };
  });

  const totalPipeline = stagesData.reduce((acc, s) => acc + s.value, 0);
  const totalWeighted = stagesData.reduce((acc, s) => acc + s.weighted, 0);
  const totalLeads = clients.length;
  const avgScore = clients.reduce((acc, c) => acc + (c.score || 0), 0) / (totalLeads || 1);

  return (
    <div className="space-y-8">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-2">Valor Total Pipeline</p>
          <p className="text-3xl font-black text-slate-900">{fmt(totalPipeline)}</p>
          <div className="mt-2 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" /> +12.5% vs mês ant.
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-indigo-200 shadow-xl text-white">
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-tight mb-2">Previsão Ponderada</p>
          <p className="text-3xl font-black">{fmt(totalWeighted)}</p>
          <p className="mt-2 text-indigo-200 text-xs font-medium italic opacity-80">*Baseado na probabilidade por estágio</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-2">Taxa de Conversão Est.</p>
          <p className="text-3xl font-black text-slate-900">22.4%</p>
          <p className="mt-2 text-slate-400 text-xs font-medium">Médio do segmento: 18%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-2">Score Médio Carteira</p>
          <p className="text-3xl font-black text-slate-900">{avgScore.toFixed(0)}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
            <div 
              className={`h-full rounded-full transition-all ${avgScore > 70 ? 'bg-emerald-500' : avgScore > 40 ? 'bg-indigo-500' : 'bg-rose-500'}`} 
              style={{ width: `${avgScore}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Funnel chart section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Visualização do Funil (Pipeline V2)</h2>
            <p className="text-sm text-slate-500 font-medium">Fluxo de receita e volume de leads por estágio comercial</p>
          </div>
        </div>

        <div className="space-y-6">
          {stagesData.map((s, idx) => {
            const maxVal = Math.max(...stagesData.map(st => st.value));
            const widthPerc = maxVal > 0 ? (s.value / maxVal) * 100 : 0;
            const dropPercent = idx > 0 && stagesData[idx-1].count > 0 
              ? ((s.count / stagesData[idx-1].count) * 100).toFixed(0) 
              : null;

            return (
              <div key={s.id} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                    <div className="w-0.5 h-6 bg-slate-100" />
                    <div className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-black text-slate-400 italic">
                      {dropPercent}% Conversão
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right pr-4">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.label}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{s.count} Leads</p>
                  </div>
                  <div className="col-span-6 relative h-14 flex items-center">
                    <div className="absolute inset-0 bg-slate-50 rounded-2xl" />
                    <div className="h-full rounded-2xl relative shadow-md overflow-hidden bg-slate-100 flex-1">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${widthPerc}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-2xl relative shadow-sm"
                        style={{ backgroundColor: s.color, border: `1px solid ${s.text}20` }}
                      >
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[10px] opacity-40 uppercase whitespace-nowrap" style={{ color: s.text }}>
                          {((s.weighted / (totalWeighted || 1)) * 100).toFixed(0)}% do Fluxo
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="col-span-3 pl-4">
                    <p className="text-base font-black text-slate-900">{fmt(s.value)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: s.text }}>
                      Prob: {(s.prob * 100).toFixed(0)}% · {fmt(s.weighted)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card 
          title="Saúde do Pipeline" 
          subtitle="Gargalos e Oportunidades Identificadas"
          className="shadow-sm"
        >
          <div className="space-y-5">
            {[
              { label: 'Leads Tier A Estagnados', value: clients.filter(c => c.tier === 'A' && c.pipelineStage < 2).length, trend: 'Critico', color: 'rose' },
              { label: 'Oportunidades com Proposta', value: clients.filter(c => c.pipelineStage === 2).length, trend: 'Acompanhar', color: 'indigo' },
              { label: 'Ciclo Médio Est.', value: '18 dias', trend: '-2 dias', color: 'emerald' },
              { label: 'Velocity do Funil', value: 'R$ 12k/dia', trend: 'Alta', color: 'amber' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:bg-slate-100/50 transition-all cursor-default group">
                <div>
                  <p className="text-base font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Métrica do Canal</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">{item.value}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.color === 'rose' ? 'bg-rose-100 text-rose-600' : item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Concentração por Tier" 
          subtitle="Volume Financeiro por Perfil de Cliente"
          className="shadow-sm"
        >
          <div className="flex flex-col h-full justify-between py-2">
            <div className="flex gap-4 items-end h-40 mb-6">
              {['A', 'B', 'C'].map(t => {
                const tierVal = clients.filter(c => c.tier === t).reduce((acc, c) => acc + (c.ticketMedio || 0), 0);
                const total = clients.reduce((acc, c) => acc + (c.ticketMedio || 0), 0);
                const h = total > 0 ? (tierVal / total) * 100 : 0;
                const colors: any = { A: '#6366f1', B: '#3b82f6', C: '#94a3b8' };
                
                return (
                  <div key={t} className="flex-1 flex flex-col items-center gap-3 h-full">
                    <div className="w-full bg-slate-50 rounded-xl relative group overflow-hidden flex-1 shadow-inner border border-slate-100">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="absolute bottom-0 left-0 right-0 shadow-lg"
                        style={{ backgroundColor: colors[t] }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                        <p className="text-[10px] font-black text-slate-700 bg-white px-2 py-1 rounded shadow-sm">{h.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-800">Tier {t}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">{fmt(tierVal)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-slate-500 italic leading-relaxed text-center px-4">
              "Gestor, sua visibilidade financeira está concentrada em <strong>Tier A</strong>. 
              Garanta que essas contas não tenham gargalos no estágio de Proposta."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
