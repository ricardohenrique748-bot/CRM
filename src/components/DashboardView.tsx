import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, DollarSign, Target, TrendingUp, AlertTriangle, 
  ArrowUpRight, ChevronRight, BarChart3, Clock, Award
} from 'lucide-react';
import { Client, Tier, Tab } from '../types';
import { TIER_COLORS, TYPE_COLORS } from '../constants';
import { fmt } from '../utils';
import { Card } from './ui/Card';

interface DashboardViewProps {
  clients: Client[];
  setActiveTab: (tab: Tab) => void;
  setFilterTier: (tier: string) => void;
}

export const DashboardView = ({ clients, setActiveTab, setFilterTier }: DashboardViewProps) => {
  const totalTicket = clients.reduce((s, c) => s + c.ticketMedio, 0);
  const totalPotencial = clients.reduce((s, c) => s + c.potencialTotal, 0);
  const totalGap = clients.reduce((s, c) => s + c.gapVenda, 0);
  const mortoVivos = clients.filter(c => !c.potencialMapeado);
  
  const tierCounts = {
    A: clients.filter(c => c.tier === 'A').length,
    B: clients.filter(c => c.tier === 'B').length,
    C: clients.filter(c => c.tier === 'C').length,
  };

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

  const totalWeighted = stagesData.reduce((acc, s) => acc + s.weighted, 0);
  const avgScore = clients.reduce((acc, c) => acc + (c.score || 0), 0) / (clients.length || 1);

  return (
    <div className="space-y-6">
      {/* Alerta Morto-Vivo */}
      {mortoVivos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">⚠️ {mortoVivos.length} cliente{mortoVivos.length > 1 ? 's' : ''} "morto-vivo" detectado{mortoVivos.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">Clientes sem potencial mapeado: {mortoVivos.slice(0, 3).map(c => c.name).join(', ')}{mortoVivos.length > 3 ? '...' : ''}</p>
          </div>
          <button onClick={() => { setActiveTab('clients'); setFilterTier('Todos'); }} 
            className="text-xs font-bold text-amber-700 px-4 py-2 bg-white border border-amber-200 rounded-xl hover:bg-amber-100 transition-all shadow-sm">
            Mapear Potencial →
          </button>
        </motion.div>
      )}

      {/* Mini Cards Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Ativos', value: clients.length.toString(), icon: Users, color: '#6366f1', sub: `${mortoVivos.length} aguardando` },
          { label: 'Ticket Total/Mês', value: fmt(totalTicket), icon: DollarSign, color: '#10b981', sub: 'Carteira atual' },
          { label: 'Potencial Total', value: fmt(totalPotencial), icon: Target, color: '#3b82f6', sub: 'Carteira mapeada' },
          { label: 'Gap de Vendas', value: fmt(totalGap), icon: TrendingUp, color: '#f59e0b', sub: 'A capturar' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-3xl border border-slate-200/60 p-5 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100" style={{ background: s.color }}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-black text-slate-300 uppercase group-hover:text-slate-400 transition-colors">Indicador</div>
            </div>
            <p className="text-2xl font-black text-slate-800 tabular-nums">{s.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-200" /> {s.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Inteligência de Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(['A', 'B', 'C'] as Tier[]).map(t => {
          const tc = TIER_COLORS[t];
          const tclients = clients.filter(c => c.tier === t);
          const tpot = tclients.reduce((s, c) => s + c.potencialTotal, 0);
          const labels = { A: 'Key Accounts — Alta prioridade', B: 'Crescimento — Mid Touch', C: 'Volume — Low Touch / Automação' };
          return (
            <div key={t} className="bg-white rounded-3xl border p-5 hover:shadow-md transition-all relative border-slate-200/60" style={{ borderLeft: `6px solid ${tc.text}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-sm" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                    {t}
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">Tier {t}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{tierCounts[t]} cliente{tierCounts[t] !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">{labels[t]}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Potencial Médio</p>
                  <p className="text-base font-black" style={{ color: tc.text }}>{fmt(tpot / (tierCounts[t] || 1))}</p>
                </div>
                <div className="h-6 w-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= (t === 'A' ? 3 : t === 'B' ? 2 : 1) ? 'bg-indigo-400' : 'bg-slate-200'}`} />)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Previsão Ponderada */}
        <Card title="Previsão de Receita Ponderada" subtitle="Baseado na probabilidade de cada estágio do funil">
          <div className="flex items-center justify-between mb-8 p-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 text-white">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Impacto Estimado</p>
              <p className="text-3xl font-black tabular-nums">{fmt(totalWeighted)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            {stagesData.map((s, idx) => {
              const maxVal = Math.max(...stagesData.map(st => st.value));
              const widthPerc = maxVal > 0 ? (s.value / maxVal) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>{s.label}</span>
                    <span className="text-slate-900 font-black">{fmt(s.value)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${widthPerc}%` }}
                      className="h-full rounded-full" 
                      style={{ background: s.text }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Prioridades Estratégicas */}
        <Card 
          title="Foco de Atuação" 
          subtitle="Ações imediatas para conversão"
          headerAction={<button onClick={() => setActiveTab('clients')} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">Ver Roadmap</button>}
        >
          <div className="space-y-4">
            {clients.filter(c => c.tier === 'A').slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm" style={{ background: TYPE_COLORS[c.type] }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{c.type} • {c.contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-700">{fmt(c.ticketMedio)}</p>
                  {c.gapVenda > 0 ? (
                    <p className="text-[10px] text-emerald-600 font-black uppercase">Gap: {fmt(c.gapVenda)}</p>
                  ) : (
                    <p className="text-[10px] text-slate-300 font-bold uppercase truncate">Sem Gap</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
            {clients.filter(c => c.tier === 'A').length === 0 && (
              <div className="py-12 text-center text-slate-300">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase">Nenhum cliente Tier A</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Taxa de Conversão</p>
          </div>
          <p className="text-3xl font-black text-slate-900">22.4%</p>
          <div className="mt-4 h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[22.4%] rounded-full shadow-lg shadow-emerald-100" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider italic">Geral da Carteira</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Ciclo Médio</p>
          </div>
          <p className="text-3xl font-black text-slate-900">18 <span className="text-sm text-slate-400 font-bold uppercase">dias</span></p>
          <div className="mt-4 flex gap-1">
             {[1,1,1,1,1,1,1,0,0,0].map((v, i) => <div key={i} className={`h-2 flex-1 rounded-full ${v ? 'bg-indigo-400' : 'bg-slate-100'}`} />)}
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider italic">Oportunidade p/ Fechamento</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Score Médio</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{avgScore.toFixed(0)}</p>
          <div className="mt-4 h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full shadow-lg shadow-amber-100" style={{ width: `${avgScore}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider italic">Qualificação da Carteira</p>
        </div>
      </div>
    </div>
  );
};
