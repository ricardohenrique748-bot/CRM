import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowUpRight, MessageCircle, MoreHorizontal } from 'lucide-react';
import { TIER_COLORS, TYPE_COLORS, STAGES } from '../constants';
import { Client } from '../types';
import { fmt, sendWhatsApp } from '../utils';

interface ListViewProps {
  clients: Client[];
  onEditClient: (c: Client) => void;
}

export const ListView = ({ clients, onEditClient }: ListViewProps) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.contato.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesTier = filterTier === 'all' || c.tier === filterTier;
    return matchesSearch && matchesType && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* List filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou contato..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 md:w-40 bg-white border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 transition-all cursor-pointer appearance-none"
          >
            <option value="all">TODOS SEGMENTOS</option>
            {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>

          <select 
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="flex-1 md:w-32 bg-white border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 transition-all cursor-pointer appearance-none"
          >
            <option value="all">TODOS TIERS</option>
            <option value="A">TIER A</option>
            <option value="B">TIER B</option>
            <option value="C">TIER C</option>
          </select>

          <button className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-600 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table-like list */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Lead</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estágio</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Potencial (Mês)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações Quick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filtered.map((client) => (
                  <motion.tr 
                    key={client.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onEditClient(client)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center relative shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-indigo-600 font-black text-xs">{client.name.substring(0, 2).toUpperCase()}</span>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white`} style={{ backgroundColor: TIER_COLORS[client.tier].text }} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight mb-0.5">{client.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">{client.contato}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[client.type] }}>{client.type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-tight">
                          <span>{STAGES[client.pipelineStage].label}</span>
                          <span>{((client.pipelineStage / (STAGES.length - 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                              width: `${(client.pipelineStage / (STAGES.length - 1)) * 100}%`,
                              backgroundColor: STAGES[client.pipelineStage].color
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{fmt(client.ticketMedio)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Tier {client.tier} · Score {client.score}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); sendWhatsApp(client.whatsapp, `Olá ${client.contato}, como estão as coisas na ${client.name}?`); }}
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
