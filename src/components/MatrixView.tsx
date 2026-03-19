import React from 'react';
import { motion } from 'motion/react';
import { Target, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { Client } from '../types';
import { fmt } from '../utils';
import { Card } from './ui/Card';

interface MatrixViewProps {
  clients: Client[];
}

export const MatrixView = ({ clients }: MatrixViewProps) => {
  const quadrants = [
    { title: '🥇 Estrelas (Tier A)', sub: 'Ticket Alto + Baixa Sensibilidade', filter: (c: Client) => c.tier === 'A' && c.sensibilidadePreco !== 'Alta', color: '#6366f1', icon: Target },
    { title: '📈 Potencial (Tier B)', sub: 'Gap Alto + Ticket Médio', filter: (c: Client) => c.tier === 'B' && c.gapVenda > 20000, color: '#10b981', icon: TrendingUp },
    { title: '⚠️ Risco (Indecisos)', sub: 'Alta Sensibilidade a Preço', filter: (c: Client) => c.sensibilidadePreco === 'Alta', color: '#f59e0b', icon: AlertTriangle },
    { title: '🔍 Descoberta (Novos)', sub: 'Aguardando Qualificação', filter: (c: Client) => c.pipelineStage <= 1, color: '#64748b', icon: Search },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quadrants.map((q, i) => {
        const qClients = clients.filter(q.filter);
        return (
          <Card key={i} title={q.title} subtitle={q.sub}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-lg" style={{ background: q.color }}>
                <q.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{qClients.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Clientes na Categoria</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Impacto Financeiro</p>
                <p className="text-lg font-black text-slate-700">{fmt(qClients.reduce((s, c) => s + (c.ticketMedio || 0), 0))}</p>
              </div>
            </div>
            <div className="space-y-3">
              {qClients.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                  <div className="truncate pr-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Última: {c.ultimaInteracao}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                       <p className="text-xs font-black text-slate-600 truncate">{fmt(c.ticketMedio)}</p>
                       <div className="flex items-center gap-1 justify-end">
                         <div className="w-1 h-1 rounded-full bg-slate-300" />
                         <p className="text-[9px] font-bold text-slate-400 uppercase">Tier {c.tier}</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              {qClients.length > 3 && (
                <p className="text-center text-[10px] text-slate-400 font-black uppercase py-2 tracking-widest">+ {qClients.length - 3} outros</p>
              )}
              {qClients.length === 0 && (
                 <div className="py-12 text-center text-slate-300">
                    <p className="text-xs font-bold uppercase">Lista Vazia</p>
                 </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
