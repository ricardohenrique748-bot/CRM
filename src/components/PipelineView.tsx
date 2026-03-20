import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STAGES, TIER_COLORS, TYPE_COLORS } from '../constants';
import { Client } from '../types';
import { fmt } from '../utils';

interface PipelineViewProps {
  clients: Client[];
  onEditClient: (c: Client) => void;
}

export const PipelineView = ({ clients, onEditClient }: PipelineViewProps) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-250px)] px-2">
      {STAGES.map((stage, idx) => {
        const stageClients = clients.filter(c => c.pipelineStage === idx);
        const stageTotal = stageClients.reduce((acc, c) => acc + (c.ticketMedio || 0), 0);
        
        return (
          <div key={stage.label} className="flex-shrink-0 w-80 flex flex-col">
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: stage.color }}>
                  <stage.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">{stage.label}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stageClients.length} Leads</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 leading-none">{fmt(stageTotal)}</p>
                <div className="w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.min(100, (stageTotal / 50000) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-[2rem] p-3 flex-1 border border-slate-100/50 space-y-3">
              <AnimatePresence>
                {stageClients.map(client => (
                  <motion.div
                    key={client.id}
                    layoutId={client.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => onEditClient(client)}
                    className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${TYPE_COLORS[client.type]}15`, color: TYPE_COLORS[client.type] }}>
                        {client.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: TIER_COLORS[client.tier].bg, color: TIER_COLORS[client.tier].text, border: `1px solid ${TIER_COLORS[client.tier].border}` }}>
                          Tier {client.tier}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{client.name}</h4>
                    <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1 mb-3">
                      {fmt(client.ticketMedio)}
                      <span className="text-slate-300 font-normal">/ mês</span>
                    </p>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {client.ultimaInteracao}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {stageClients.length === 0 && (
                <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Solte leads aqui para mover</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
