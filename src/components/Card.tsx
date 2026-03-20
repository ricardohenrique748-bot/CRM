import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Zap } from 'lucide-react';
import { Client } from '../types';
import { TYPE_COLORS, TIER_COLORS } from '../constants';
import { fmt, sendWhatsApp } from '../utils';

interface CardProps {
  client: Client;
  onClick: () => void;
}

export const Card = ({ client, onClick }: CardProps) => {
  const tierStyle = TIER_COLORS[client.tier];

  return (
    <motion.div 
      layoutId={client.id}
      onClick={onClick}
      className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:border-indigo-100 group transition-all relative overflow-hidden active:scale-95"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: TYPE_COLORS[client.type] }} />
           <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest leading-none">{client.type}</p>
        </div>
        <div 
          className="px-2 py-0.5 rounded-md text-[9px] font-black italic border"
          style={{ 
            backgroundColor: tierStyle.bg, 
            borderColor: tierStyle.border, 
            color: tierStyle.text 
          }}
        >
          TIER {client.tier}
        </div>
      </div>
      
      <h4 className="font-black text-slate-900 uppercase italic tracking-tighter mb-1 truncate">{client.name}</h4>
      <div className="flex items-center gap-2 mb-4 opacity-60">
        <MessageCircle className="w-3 h-3 text-slate-400" />
        <p className="text-[10px] font-black text-slate-400 italic uppercase truncate capitalize">{client.contato.split(' ')[0]}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
         <div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">Forecast</p>
           <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{fmt(client.ticketMedio)}</p>
         </div>

         <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter italic">Score</p>
                <p className="text-sm font-black text-indigo-600 uppercase italic leading-none">{client.score}</p>
             </div>
             <button 
               onClick={(e) => { e.stopPropagation(); sendWhatsApp(client.whatsapp, `Olá ${client.contato}, seguem os detalhes do seu pedido...`); }}
               className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
             >
                <Zap className="w-5 h-5 fill-current" />
             </button>
         </div>
      </div>
    </motion.div>
  );
};
