import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { Client } from '../types';
import { STAGES } from '../constants';
import { fmt, calculateScore, assignTierFromScore } from '../utils';
import { Card } from './ui/Card';

interface PipelineViewProps {
  clients: Client[];
}

export const PipelineView = ({ clients }: PipelineViewProps) => {
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
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${avgScore > 70 ? 'bg-emerald-500' : avgScore > 41 ? 'bg-indigo-500' : 'bg-rose-500'}`} 
              style={{ width: `${avgScore}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10 text-center md:text-left">
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
                        className="h-full" 
                        style={{ background: s.text }}
                      />
                      <div className="absolute inset-0 flex items-center pl-6">
                        <p className="text-xs font-black text-white mix-blend-difference uppercase">{fmt(s.value)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 pl-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impacto Esperado</p>
                    <p className="text-sm font-black text-slate-700">{fmt(s.weighted)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
