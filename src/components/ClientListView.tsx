import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Client, Tier } from '../types';
import { TIER_COLORS, TYPE_COLORS } from '../constants';
import { fmt } from '../utils';

interface ClientListViewProps {
  clients: Client[];
  onEdit: (client: Partial<Client>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const ClientListView = ({ clients, onEdit, onDelete, onAdd }: ClientListViewProps) => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<Tier | 'Todos'>('Todos');
  const [filterType, setFilterType] = useState<string>('Todos');

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contato.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'Todos' || c.tier === filterTier;
    const matchesType = filterType === 'Todos' || c.type === filterType;
    return matchesSearch && matchesTier && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por nome, contato ou tipo..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm bg-white text-slate-800 outline-none focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
        <select 
          value={filterTier} 
          onChange={e => setFilterTier(e.target.value as any)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
        >
          <option value="Todos">Todos Tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
        >
          <option value="Todos">Todos Tipos</option>
          <option value="Frotista">Frotista</option>
          <option value="Indústria">Indústria</option>
          <option value="Agro">Agro</option>
          <option value="Revenda">Revenda</option>
          <option value="Autônomo">Autônomo</option>
        </select>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />Novo Cliente
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const tc = TIER_COLORS[c.tier];
          return (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group shadow-sm"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" style={{ background: TYPE_COLORS[c.type as keyof typeof TYPE_COLORS] || '#64748b' }}>
                      {c.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{c.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{c.contato}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!c.potencialMapeado && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">MORTO-VIVO</span>
                    )}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      Tier {c.tier}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white shadow-sm" style={{ background: TYPE_COLORS[c.type as keyof typeof TYPE_COLORS] || '#64748b' }}>{c.type}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{c.size}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{c.frequencia}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Ticket/Mês</p>
                    <p className="text-sm font-bold text-slate-800">{fmt(c.ticketMedio)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-sm" style={{ background: c.potencialMapeado ? '#f0fdf4' : '#fffbeb', borderColor: c.potencialMapeado ? '#bbf7d0' : '#fde68a' }}>
                    <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: c.potencialMapeado ? '#16a34a' : '#d97706' }}>
                      {c.potencialMapeado ? 'Gap de Venda' : 'Potencial'}
                    </p>
                    <p className="text-sm font-bold" style={{ color: c.potencialMapeado ? '#16a34a' : '#d97706' }}>
                      {c.potencialMapeado ? fmt(c.gapVenda) : 'Não mapeado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  {[
                    { label: 'Margem', value: `${c.margem}%` },
                    { label: 'Preço', value: c.sensibilidadePreco },
                    { label: 'Depend.', value: c.dependenciaOp },
                  ].map(x => (
                    <div key={x.label} className="p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-bold uppercase text-slate-400">{x.label}</p>
                      <p className="text-xs font-bold text-slate-700">{x.value}</p>
                    </div>
                  ))}
                </div>

                {(c.crossSell || c.upsell) && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 mb-3 shadow-sm">
                    {c.crossSell && <p className="text-[10px] text-indigo-700"><span className="font-bold uppercase tracking-tighter">Cross: </span>{c.crossSell}</p>}
                    {c.upsell && <p className="text-[10px] text-indigo-700 mt-0.5"><span className="font-bold uppercase tracking-tighter">Upsell: </span>{c.upsell}</p>}
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />Editar
                </button>
                <button 
                  onClick={() => onDelete(c.id!)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 text-center py-24 text-slate-400 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-500">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo cliente para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
