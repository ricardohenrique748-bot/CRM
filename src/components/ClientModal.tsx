import React from 'react';
import { X, Save, Trash2, MessageCircle, TrendingUp, Target, User, Phone, MapPin, Hash, DollarSign, Calendar, Info } from 'lucide-react';
import { STAGES, TYPE_COLORS, TIER_COLORS, NURTURE_STEPS } from '../constants';
import { Client, ClientType, Tier } from '../types';
import { fmt, calculateScore, assignTierFromScore } from '../utils';

interface ClientModalProps {
  client: Client;
  onClose: () => void;
  onSave: (c: Client) => void;
  onDelete?: (id: string) => void;
}

export const ClientModal = ({ client, onClose, onSave, onDelete }: ClientModalProps) => {
  const [edited, setEdited] = React.useState<Client>({ ...client });

  const handleChange = (field: keyof Client, value: any) => {
    const newClient = { ...edited, [field]: value };
    if (field === 'ticketMedio' || field === 'pipelineStage' || field === 'frequencia') {
      const score = calculateScore(newClient.ticketMedio, newClient.pipelineStage, newClient.frequencia);
      newClient.score = score;
      newClient.tier = assignTierFromScore(score);
    }
    setEdited(newClient);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-200/50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-center relative bg-gradient-to-r from-slate-50 to-white">
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: STAGES[edited.pipelineStage].color }} />
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-indigo-100 shadow-xl group transition-all">
              <span className="text-2xl font-black text-indigo-600 group-hover:scale-110 transition-transform tracking-tighter">
                {edited.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{edited.name || 'Novo Lead'}</h2>
                <div className="flex gap-1.5 ml-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: TIER_COLORS[edited.tier].bg, color: TIER_COLORS[edited.tier].text, border: `1px solid ${TIER_COLORS[edited.tier].border}` }}>
                    TIER {edited.tier}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${TYPE_COLORS[edited.type]}15`, color: TYPE_COLORS[edited.type] }}>
                    {edited.type}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-400 flex items-center gap-2 italic">
                <Phone className="w-3 h-3" /> {edited.whatsapp} · {edited.contato}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-[1.5rem] transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Col: Info */}
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Informações Básicas</h3>
                </div>
                <div className="space-y-6">
                  <div className="group relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">Nome da Empresa</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm uppercase"
                        value={edited.name} 
                        onChange={e => handleChange('name', e.target.value)} 
                        placeholder="EX: TRANSPORTS LTDA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">Pessoa de Contato</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm uppercase"
                          value={edited.contato} 
                          onChange={e => handleChange('contato', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="group relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">WhatsApp / Fone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm uppercase"
                          value={edited.whatsapp} 
                          onChange={e => handleChange('whatsapp', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">E-mail Corporativo</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm lowercase"
                        value={edited.email} 
                        onChange={e => handleChange('email', e.target.value)} 
                        placeholder="EX: contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">Segmento</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm uppercase appearance-none"
                        value={edited.type}
                        onChange={e => handleChange('type', e.target.value)}
                      >
                        {['Frotista', 'Indústria', 'Agro', 'Revenda', 'Autônomo'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5 block ml-1 italic group-focus-within:text-indigo-600 transition-colors">Porte</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none italic text-sm uppercase appearance-none"
                        value={edited.size}
                        onChange={e => handleChange('size', e.target.value)}
                      >
                        {['Pequeno', 'Médio', 'Grande'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Estágio Comercial</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s, idx) => (
                    <button
                      key={s.label}
                      onClick={() => handleChange('pipelineStage', idx)}
                      className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-sm ${edited.pipelineStage === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                    >
                      <s.icon className={`w-3 h-3 ${edited.pipelineStage === idx ? 'text-white' : 'text-slate-300'}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Col: Health & Nurture */}
            <div className="space-y-10">
              <section className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-indigo-600" />
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic text-sm">Saúde do Negócio</h3>
                </div>
                
                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase italic">Ticket Médio (Potencial)</label>
                        <span className="text-sm font-black text-indigo-600 italic tracking-tighter">{fmt(edited.ticketMedio)}</span>
                      </div>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-within:text-indigo-400 transition-colors" />
                        <input 
                          type="number" 
                          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 placeholder:text-slate-200 outline-none shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 italic"
                          value={edited.ticketMedio} 
                          onChange={e => handleChange('ticketMedio', Number(e.target.value))} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase italic">Frequência (Mensal)</label>
                        <span className="text-sm font-black text-slate-900 italic tracking-tighter">{edited.frequencia}x</span>
                      </div>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-within:text-indigo-400 transition-colors" />
                        <input 
                          type="number" 
                          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-slate-800 placeholder:text-slate-200 outline-none shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 italic"
                          value={edited.frequencia} 
                          onChange={e => handleChange('frequencia', Number(e.target.value))} 
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-1 leading-relaxed opacity-60">
                    *Estes valores ponderados pelo estágio impactam diretamente o Score e definem o Tier do Lead.
                  </p>

                  <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Score</p>
                      <p className={`text-3xl font-black italic tracking-tighter ${edited.score > 70 ? 'text-emerald-500' : edited.score > 40 ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {edited.score}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Tier</p>
                      <span 
                        className="px-3 py-1 rounded-xl text-[10px] font-black italic border shadow-sm"
                        style={{ 
                          backgroundColor: TIER_COLORS[edited.tier].bg, 
                          borderColor: TIER_COLORS[edited.tier].border, 
                          color: TIER_COLORS[edited.tier].text 
                        }}
                      >
                        {edited.tier}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Interação</p>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic opacity-60 leading-none">{edited.ultimaInteracao}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-16 h-16 text-indigo-600" />
                </div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest italic text-sm">Automação de Nutrição</h3>
                  </div>
                  <button 
                    onClick={() => handleChange('nurtureActive', !edited.nurtureActive)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-sm ${edited.nurtureActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md ${edited.nurtureActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {edited.nurtureActive && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex gap-1.5 items-center">
                      {NURTURE_STEPS.map((step, idx) => (
                        <div key={idx} className="flex-1 group relative">
                          <button
                            onClick={() => handleChange('nurtureStep', idx)}
                            className={`w-full h-2.5 rounded-full transition-all shadow-sm ${idx <= edited.nurtureStep ? 'bg-indigo-600' : 'bg-slate-200'} ${idx === edited.nurtureStep ? 'ring-4 ring-indigo-500/20 scale-110' : 'hover:bg-indigo-300'}`}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 uppercase italic">
                            {step.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex items-start gap-4 shadow-sm group hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                        {React.createElement(NURTURE_STEPS[edited.nurtureStep].icon, { className: 'w-5 h-5' })}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-0.5 italic tracking-widest">Próximo Conteúdo</p>
                        <p className="text-xs font-bold text-indigo-900 italic leading-relaxed">{NURTURE_STEPS[edited.nurtureStep].desc}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!edited.nurtureActive && (
                  <p className="text-sm font-bold text-slate-400 italic text-center p-4">Ative o fluxo de nutrição para este lead para gerar autoridade automaticamente via WhatsApp.</p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Notas & Observações</h3>
                </div>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none italic text-sm min-h-[120px]"
                  value={edited.notas}
                  onChange={e => handleChange('notas', e.target.value)}
                  placeholder="DIGITE AQUI OBSERVAÇÕES IMPORTANTES SOBRE O POSICIONAMENTO E NECESSIDADES DO LEAD..."
                />
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex justify-between items-center gap-6 overflow-hidden">
          {client.id !== 'new' && onDelete && (
            <button 
              onClick={() => onDelete(client.id)}
              className="flex items-center gap-3 px-8 py-4 text-rose-600 font-bold hover:bg-rose-50 rounded-[1.5rem] transition-all group border border-transparent hover:border-rose-100 shadow-sm hover:shadow-md"
            >
              <Trash2 className="w-5 h-5 group-hover:shake" />
              <span className="text-sm tracking-tight uppercase font-black italic">Excluir Registro</span>
            </button>
          )}
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={onClose}
              className="px-10 py-5 text-slate-500 font-black text-sm uppercase italic tracking-tighter hover:bg-slate-100 rounded-[2rem] transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onSave(edited)}
              className="flex items-center gap-4 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-base shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all group uppercase tracking-tight italic"
            >
              <Save className="w-5 h-5 text-indigo-100 group-hover:rotate-12 transition-transform" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
