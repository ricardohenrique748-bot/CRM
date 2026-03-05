/**
 * CRM Builder - Sistema de Gestão de Clientes
 */
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  LayoutDashboard, Users, TrendingUp, Target, BarChart3, Settings,
  Plus, X, Eye, EyeOff, LogIn, LogOut, FileText, Mail, Lock,
  ChevronDown, Search, AlertTriangle, CheckCircle2, Edit2,
  DollarSign, ShoppingCart, Zap, ArrowUpRight, Save, Trash2,
  GitMerge, Calendar, Filter, RefreshCw, MessageSquare, Clock, Award, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── TYPES ──────────────────────────────────────────────────────────────────
type ClientType = 'Frotista' | 'Indústria' | 'Agro' | 'Revenda' | 'Autônomo';
type ClientSize = 'Pequeno' | 'Médio' | 'Grande';
type Complexity = 'Baixa' | 'Média' | 'Alta';
type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Irregular';
type Tier = 'A' | 'B' | 'C';
type Tab = 'dashboard' | 'clients' | 'pipeline' | 'matrix' | 'nurture';

interface Client {
  id: number;
  // Perfil
  name: string; contact: string; phone: string; email: string;
  type: ClientType; size: ClientSize;
  ticketMedio: number; margem: number; complexidade: Complexity;
  // Comportamento
  frequencia: Frequency; mix: string;
  sensibilidadePreco: Complexity; dependenciaOp: Complexity;
  // Potencial
  potencialTotal: number; gapVenda: number;
  crossSell: string; upsell: string;
  potencialMapeado: boolean;
  // Meta
  tier: Tier; score: number; ultimaInteracao: string; notas: string;
  // Matriz de Prioridade (Pesos)
  riscoOp: Complexity;
  relacEstrategico: Complexity;
  // Nutrição
  nurtureStep: number; // 0 a 4
  // Processo de Vendas
  pipelineStage: number; // 0 a 5
}

interface User { email: string; name: string; role: string; }

// ─── AUTH DATA ─────────────────────────────────────────────────────────────
const USERS = [
  { email: 'admin@empresa.com', password: 'password', name: 'Administrador', role: 'Admin' },
  { email: 'ricardo.luz@eunaman.com.br', password: '15975321', name: 'Ricardo Luz', role: 'Gestor' },
  { email: 'lucas.contadini@eunaman.com.br', password: '123456', name: 'Lucas Contadini', role: 'Gestor' },
];
const STORAGE_KEY = 'crm_saved_credentials';

const STAGES = [
  { label: 'Lead / Ativo', color: '#64748b', icon: Users, next: 'Qual potencial mapeado?' },
  { label: 'Oportunidade', color: '#6366f1', icon: Search, next: 'Tem dor identificada?' },
  { label: 'Proposta', color: '#0891b2', icon: FileText, next: 'Recebeu orçamento?' },
  { label: 'Negociação', color: '#f59e0b', icon: MessageCircle, next: 'Alinhando termos?' },
  { label: 'Fechamento', color: '#10b981', icon: CheckCircle2, next: 'Contrato assinado?' },
  { label: 'Expansão (Pós)', color: '#ec4899', icon: TrendingUp, next: 'Qual o novo Gap?' },
];

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const INITIAL_CLIENTS: Client[] = [
  {
    id: 1, name: 'Transportadora Silva', contact: 'João Silva',
    phone: '(11) 99999-0001', email: 'joao@transportesilva.com.br',
    type: 'Frotista', size: 'Grande', ticketMedio: 120000, margem: 28, complexidade: 'Alta',
    frequencia: 'Mensal', mix: 'Pneus, Lubrificantes, Filtros',
    sensibilidadePreco: 'Média', dependenciaOp: 'Alta',
    potencialTotal: 200000, gapVenda: 80000,
    crossSell: 'Serviços de Recape, Gestão de Frota', upsell: 'Plano Premium Manutenção',
    potencialMapeado: true, tier: 'A', score: 95, ultimaInteracao: '2026-03-01',
    notas: 'Contrato anual em negociação. Cliente estratégico.',
    riscoOp: 'Alta', relacEstrategico: 'Alta', nurtureStep: 2, pipelineStage: 3,
  },
  {
    id: 2, name: 'Agro Cerrado Ltda', contact: 'Maria Santos',
    phone: '(64) 98888-0002', email: 'maria@agrocerrado.com.br',
    type: 'Agro', size: 'Médio', ticketMedio: 45000, margem: 32, complexidade: 'Média',
    frequencia: 'Trimestral', mix: 'Defensivos, Sementes',
    sensibilidadePreco: 'Alta', dependenciaOp: 'Média',
    potencialTotal: 90000, gapVenda: 45000,
    crossSell: 'Fertilizantes, Fungicidas', upsell: 'Pacote Safra Completo',
    potencialMapeado: true, tier: 'B', score: 65, ultimaInteracao: '2026-02-15',
    notas: 'Sazonalidade alta. Pico em out/nov.',
    riscoOp: 'Média', relacEstrategico: 'Média', nurtureStep: 0, pipelineStage: 1,
  },
  {
    id: 3, name: 'Metalúrgica Pinheiro', contact: 'Carlos Pinheiro',
    phone: '(11) 97777-0003', email: 'carlos@metalpinheiro.com.br',
    type: 'Indústria', size: 'Médio', ticketMedio: 28000, margem: 22, complexidade: 'Alta',
    frequencia: 'Mensal', mix: 'Aço, Inox',
    sensibilidadePreco: 'Baixa', dependenciaOp: 'Alta',
    potencialTotal: 0, gapVenda: 0,
    crossSell: '', upsell: '',
    potencialMapeado: false, tier: 'B', score: 45, ultimaInteracao: '2026-01-10',
    notas: 'Potencial não mapeado. Requere visita técnica.',
    riscoOp: 'Alta', relacEstrategico: 'Média', nurtureStep: 0, pipelineStage: 0,
  },
  {
    id: 4, name: 'Auto Peças Cardoso', contact: 'Ana Cardoso',
    phone: '(21) 96666-0004', email: 'ana@pecascardoso.com.br',
    type: 'Revenda', size: 'Pequeno', ticketMedio: 8000, margem: 18, complexidade: 'Baixa',
    frequencia: 'Semanal', mix: 'Filtros, Velas, Amortecedores',
    sensibilidadePreco: 'Alta', dependenciaOp: 'Baixa',
    potencialTotal: 0, gapVenda: 0,
    crossSell: '', upsell: '',
    potencialMapeado: false, tier: 'C', score: 15, ultimaInteracao: '2025-12-20',
    notas: '',
    riscoOp: 'Baixa', relacEstrategico: 'Baixa', nurtureStep: 0, pipelineStage: 0,
  },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  A: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  B: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  C: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

const TYPE_COLORS: Record<ClientType, string> = {
  Frotista: '#6366f1', Indústria: '#0891b2', Agro: '#16a34a', Revenda: '#d97706', Autônomo: '#7c3aed',
};

const emptyClient = (): Omit<Client, 'id'> => ({
  name: '', contact: '', phone: '', email: '',
  type: 'Frotista', size: 'Médio', ticketMedio: 0, margem: 0, complexidade: 'Média',
  frequencia: 'Mensal', mix: '',
  sensibilidadePreco: 'Média', dependenciaOp: 'Média',
  potencialTotal: 0, gapVenda: 0, crossSell: '', upsell: '',
  potencialMapeado: false, tier: 'C', score: 0, ultimaInteracao: new Date().toISOString().split('T')[0], notas: '',
  riscoOp: 'Baixa', relacEstrategico: 'Baixa', nurtureStep: 0, pipelineStage: 0,
});

const sendWhatsApp = (phone: string, text: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const calculateScore = (c: Partial<Client>) => {
  let score = 0;
  // Ticket (Peso 3)
  if ((c.potencialTotal || 0) > 100000) score += 30;
  else if ((c.potencialTotal || 0) > 50000) score += 15;
  // Margem (Peso 2)
  if ((c.margem || 0) > 30) score += 20;
  else if ((c.margem || 0) > 20) score += 10;
  // Risco (Peso 2.5)
  if (c.riscoOp === 'Alta') score += 25;
  else if (c.riscoOp === 'Média') score += 12;
  // Estratégia (Peso 2.5)
  if (c.relacEstrategico === 'Alta') score += 25;
  else if (c.relacEstrategico === 'Média') score += 12;
  return score;
};

const assignTierFromScore = (score: number): Tier => {
  if (score >= 75) return 'A';
  if (score >= 45) return 'B';
  return 'C';
};

// ─── NURTURE STRATEGY ────────────────────────────────────────────────────────
const NURTURE_STRATEGY: Record<ClientType, { pain: string; hook: string; value: string }> = {
  Frotista: {
    pain: 'Alto Custo por KM',
    hook: 'Redução de custos operacionais',
    value: 'Relatório de economia por tipo de terreno e carga.'
  },
  Indústria: {
    pain: 'Parada de Linha Inesperada',
    hook: 'Previsibilidade operacional',
    value: 'Checklist de manutenção preditiva para motores industriais.'
  },
  Agro: {
    pain: 'Quebra de Máquina na Safra',
    hook: 'Disponibilidade e produtividade',
    value: 'Planejamento de estoque preventivo pré-colheita.'
  },
  Revenda: {
    pain: 'Baixo Giro de Estoque',
    hook: 'Momento ideal de recapagem',
    value: 'Tabela de indicação técnica para aumento de vida útil da carcaça.'
  },
  Autônomo: {
    pain: 'Falta de Fluxo de Caixa',
    hook: 'Troca inteligente e economia',
    value: 'Simulador de economia: Novo vs Recapado.'
  },
};

const NURTURE_STEPS = [
  { id: 0, label: 'Conteúdo', icon: FileText, desc: 'Educação sobre a dor' },
  { id: 1, label: 'Insight', icon: BarChart3, desc: 'Provocação baseada em dados' },
  { id: 2, label: 'CTA Leve', icon: Target, desc: 'Oferta de diagnóstico/ajuda' },
  { id: 3, label: 'Proposta', icon: DollarSign, desc: 'Solução comercial estruturada' },
  { id: 4, label: 'Follow-up', icon: RefreshCw, desc: 'Manutenção do contato humano' },
];

const SEGMENT_CONTENT: Record<ClientType, string[]> = {
  Frotista: [
    '“Quando o pneu começa a te dar prejuízo sem você perceber”',
    'Gráfico de Custo Acumulado: Oculto vs Visível',
    'Diagnóstico gratuito de carcaças na frota',
    'Contrato de Fornecimento / Recapagem Programada',
    'Ligação estratégica para ajuste de cronograma'
  ],
  Agro: [
    '“O custo da máquina parada no meio da colheita”',
    'Métrica de Disponibilidade vs Janela de Safra',
    'Mapeamento preventivo de ativos pré-safra',
    'Pacote Safra Completo (Insumos + Logística)',
    'Visita técnica na fazenda para check-up'
  ],
  Indústria: [
    '“Previsibilidade Operacional: O lucro mora na constância”',
    'Simulação de custo de parada de motor inesperada',
    'Auditoria de eficiência energética e atrito',
    'Plano de Manutenção Preditiva (Contrato Mensal)',
    'Apresentação de ROI do último trimestre'
  ],
  Revenda: [
    '“Giro de Estoque: O estoque parado é dinheiro evaporando”',
    'Análise de Mix ideal para o perfil da região',
    'Workshop técnico para time de vendas da revenda',
    'Programa de Parceria de Recapagem Programada',
    'Revisão de metas e incentivos trimestrais'
  ],
  Autônomo: [
    '“Troca Inteligente: Como o autônomo sobrevive ao diesel alto”',
    'Simulador: Pneu Novo vs Recapado (Kms extra)',
    'Cálculo de economia rápida na primeira recapagem',
    'Venda casada ou desconto em lote pequeno',
    'Check-in via WhatsApp sobre performance'
  ]
};

// ─── LOGIN PAGE ─────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState('');

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      try {
        const { email: e, password: p } = JSON.parse(s);
        setEmail(e); setPassword(p); setRemember(true);
        const u = USERS.find(u => u.email === e);
        if (u) setWelcome(`Bem-vindo de volta, ${u.name.split(' ')[0]}!`);
      } catch { /* empty */ }
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
      else localStorage.removeItem(STORAGE_KEY);
      onLogin(user);
    } else setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#0f172a 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 22 }} className="w-full max-w-sm mx-4">
        <div style={{ background: 'rgba(20,40,100,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,130,255,0.2)', borderRadius: 20, padding: '40px 36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.45)' }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#4a6cf7,#3b5ce4)', boxShadow: '0 8px 24px rgba(74,108,247,0.4)' }}>
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">CRM Builder</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(160,180,255,0.7)' }}>Gestão de Clientes e Vendas</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: 'rgba(200,215,255,0.8)' }}><Mail className="w-3.5 h-3.5" />E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.92)', color: '#1e2a4a', border: '1.5px solid rgba(99,130,255,0.2)' }} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: 'rgba(200,215,255,0.8)' }}><Lock className="w-3.5 h-3.5" />Senha</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.92)', color: '#1e2a4a', border: '1.5px solid rgba(99,130,255,0.2)' }} />
                <button type="button" onClick={() => setShow(!show)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{error}</motion.p>}</AnimatePresence>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setRemember(!remember)}
                className="relative w-9 h-5 rounded-full flex-shrink-0"
                style={{ background: remember ? '#4a6cf7' : 'rgba(255,255,255,0.1)', border: remember ? 'none' : '1.5px solid rgba(255,255,255,0.2)' }}>
                <motion.div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md" animate={{ x: remember ? 16 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
              <div>
                <p className="text-xs font-semibold text-white/80">Lembrar de mim</p>
                <p className="text-[10px] text-white/40">Salva credenciais neste dispositivo</p>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: loading ? 'rgba(74,108,247,0.5)' : 'linear-gradient(135deg,#4a6cf7,#3a55e0)', boxShadow: loading ? 'none' : '0 6px 20px rgba(74,108,247,0.4)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />Entrando...</> : <><LogIn className="w-4 h-4" />Entrar no Sistema</>}
            </motion.button>
          </form>
          {welcome
            ? <div className="flex items-center gap-2 justify-center mt-5 px-3 py-2 rounded-xl" style={{ background: 'rgba(74,108,247,0.12)', border: '1px solid rgba(74,108,247,0.2)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs text-indigo-200">{welcome}</p>
            </div>
            : <p className="text-center text-[10px] mt-5 text-white/30">Sistema CRM Builder • Acesso restrito</p>}
        </div>
      </motion.div>
    </div>
  );
};

// ─── CLIENT MODAL ───────────────────────────────────────────────────────────
const ClientModal = ({ client, onSave, onClose }: { client: Partial<Client> | null; onSave: (c: Client) => void; onClose: () => void }) => {
  const isNew = !client?.id;
  const [form, setForm] = useState<Omit<Client, 'id'>>(client ? { ...emptyClient(), ...client } : emptyClient());

  const set = (k: keyof typeof form, v: unknown) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      next.potencialMapeado = next.potencialTotal > 0;
      next.gapVenda = Math.max(0, next.potencialTotal - next.ticketMedio);
      return next;
    });
  };

  const S = (label: string, field: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} value={String(form[field] ?? '')} onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all bg-white" />
    </div>
  );

  const Sel = (label: string, field: keyof typeof form, options: string[]) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <select value={String(form[field])} onChange={e => set(field, e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-all">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div>
            <h2 className="font-bold text-white">{isNew ? 'Novo Cliente' : 'Editar Cliente'}</h2>
            <p className="text-xs text-indigo-200 mt-0.5">Preencha perfil, comportamento e potencial</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Perfil */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-indigo-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">Perfil</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full">OBRIGATÓRIO</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {S('Nome da Empresa', 'name', 'text', 'Razão social...')}
              {S('Contato Principal', 'contact', 'text', 'Nome do responsável...')}
              {S('Telefone', 'phone', 'text', '(00) 00000-0000')}
              {S('E-mail', 'email', 'email', 'email@empresa.com')}
              {Sel('Tipo', 'type', ['Frotista', 'Indústria', 'Agro', 'Revenda', 'Autônomo'])}
              {Sel('Porte', 'size', ['Pequeno', 'Médio', 'Grande'])}
              {S('Ticket Médio Mensal (R$)', 'ticketMedio', 'number', '0')}
              {S('Margem Média (%)', 'margem', 'number', '0')}
              {Sel('Complexidade de Venda', 'complexidade', ['Baixa', 'Média', 'Alta'])}
              {Sel('Risco Operacional', 'riscoOp', ['Baixa', 'Média', 'Alta'])}
              {Sel('Relac. Estratégico', 'relacEstrategico', ['Baixa', 'Média', 'Alta'])}
              {Sel('Tier Sugerido', 'tier', ['A', 'B', 'C'])}
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Comportamento */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center"><RefreshCw className="w-3.5 h-3.5 text-amber-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">Comportamento</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Sel('Frequência de Compra', 'frequencia', ['Semanal', 'Mensal', 'Trimestral', 'Irregular'])}
              {Sel('Sensibilidade a Preço', 'sensibilidadePreco', ['Baixa', 'Média', 'Alta'])}
              {Sel('Dependência Operacional', 'dependenciaOp', ['Baixa', 'Média', 'Alta'])}
              {S('Mix de Produtos/Serviços', 'mix', 'text', 'Ex: Pneus, Filtros, Óleo...')}
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Potencial */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center"><Target className="w-3.5 h-3.5 text-emerald-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">Potencial</h3>
            </div>
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700"><strong>Regra de ouro:</strong> Quem não tem potencial mapeado vira cliente <strong>"morto-vivo"</strong> no CRM.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {S('Potencial Total de Carteira (R$)', 'potencialTotal', 'number', '0')}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gap de Venda (calculado)</label>
                <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-bold text-emerald-700">{fmt(form.gapVenda)}</div>
              </div>
              {S('Cross-sell Possível', 'crossSell', 'text', 'Ex: Serviços de Recape...')}
              {S('Upsell Possível', 'upsell', 'text', 'Ex: Plano Premium...')}
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Processo de Vendas */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center"><GitMerge className="w-3.5 h-3.5 text-indigo-600" /></div>
              <h3 className="text-sm font-bold text-slate-800">Processo de Vendas</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estágio Atual</label>
              <select value={form.pipelineStage} onChange={e => set('pipelineStage', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 bg-white transition-all">
                {STAGES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Notas */}
          <section>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Notas e Observações</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Informações adicionais sobre o cliente..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 resize-none bg-white transition-all" />
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={() => {
            const newScore = calculateScore(form);
            const newTier = assignTierFromScore(newScore);
            onSave({ ...form, id: client?.id ?? Date.now(), score: newScore, tier: newTier } as Client);
          }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all">
            <Save className="w-4 h-4" />{isNew ? 'Criar Cliente' : 'Salvar Alterações'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [viewingTrack, setViewingTrack] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null | false>(false);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<Tier | 'Todos'>('Todos');
  const [filterType, setFilterType] = useState<ClientType | 'Todos'>('Todos');

  useEffect(() => {
    fetchClients();
  }, []);

  if (!authUser) return <LoginPage onLogin={setAuthUser} />;

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
    } else if (data) {
      // Map database snake_case to frontend camelCase
      const mappedClients: Client[] = data.map(c => ({
        id: c.id,
        name: c.name, contact: c.contact, phone: c.phone, email: c.email,
        type: c.type, size: c.size,
        ticketMedio: Number(c.ticket_medio), margem: Number(c.margem), complexidade: c.complexidade,
        frequencia: c.frequencia, mix: c.mix,
        sensibilidadePreco: c.sensibilidade_preco, dependenciaOp: c.dependencia_op,
        potencialTotal: Number(c.potencial_total), gapVenda: Number(c.gap_venda),
        crossSell: c.cross_sell, upsell: c.upsell,
        potencialMapeado: c.potencial_mapeado,
        tier: c.tier, score: Number(c.score), ultimaInteracao: c.ultima_interacao, notas: c.notas,
        riscoOp: c.risco_op, relacEstrategico: c.relac_estrategico,
        nurtureStep: c.nurture_step, pipelineStage: c.pipeline_stage
      }));
      setClients(mappedClients);
    }
  };

  const handleSave = async (c: Client) => {
    // Map frontend camelCase back to database snake_case
    const dbClient = {
      name: c.name, contact: c.contact, phone: c.phone, email: c.email,
      type: c.type, size: c.size,
      ticket_medio: c.ticketMedio, margem: c.margem, complexidade: c.complexidade,
      frequencia: c.frequencia, mix: c.mix,
      sensibilidade_preco: c.sensibilidadePreco, dependencia_op: c.dependenciaOp,
      potencial_total: c.potencialTotal, gap_venda: c.gapVenda,
      cross_sell: c.crossSell, upsell: c.upsell,
      potencial_mapeado: c.potencialMapeado,
      tier: c.tier, score: c.score, ultima_interacao: c.ultimaInteracao, notas: c.notas,
      risco_op: c.riscoOp, relac_estrategico: c.relacEstrategico,
      nurture_step: c.nurtureStep, pipeline_stage: c.pipelineStage
    };

    if (clients.find(x => x.id === c.id)) {
      const { error } = await supabase
        .from('clients')
        .update(dbClient)
        .eq('id', c.id);
      if (error) console.error('Error updating client:', error);
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([dbClient]);
      if (error) console.error('Error inserting client:', error);
    }

    fetchClients();
    setEditingClient(false);
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    const matchTier = filterTier === 'Todos' || c.tier === filterTier;
    const matchType = filterType === 'Todos' || c.type === filterType;
    return matchSearch && matchTier && matchType;
  });

  const mortoVivos = clients.filter(c => !c.potencialMapeado);
  const totalPotencial = clients.reduce((s, c) => s + c.potencialTotal, 0);
  const totalGap = clients.reduce((s, c) => s + c.gapVenda, 0);
  const totalTicket = clients.reduce((s, c) => s + c.ticketMedio, 0);
  const tierCounts = { A: clients.filter(c => c.tier === 'A').length, B: clients.filter(c => c.tier === 'B').length, C: clients.filter(c => c.tier === 'C').length };

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      {mortoVivos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">⚠️ {mortoVivos.length} cliente{mortoVivos.length > 1 ? 's' : ''} "morto-vivo" no CRM</p>
            <p className="text-xs text-amber-600 mt-0.5">Clientes sem potencial mapeado: {mortoVivos.map(c => c.name).join(', ')}</p>
          </div>
          <button onClick={() => { setActiveTab('clients'); setFilterTier('Todos'); }} className="text-xs font-bold text-amber-700 px-3 py-1.5 bg-amber-100 rounded-lg hover:bg-amber-200 transition-all">
            Ver clientes →
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Ativos', value: clients.length.toString(), icon: Users, color: '#6366f1', sub: `${mortoVivos.length} sem potencial` },
          { label: 'Ticket Total/Mês', value: fmt(totalTicket), icon: DollarSign, color: '#10b981', sub: 'Carteira atual' },
          { label: 'Potencial Total', value: fmt(totalPotencial), icon: Target, color: '#3b82f6', sub: 'Carteira mapeada' },
          { label: 'Gap de Vendas', value: fmt(totalGap), icon: TrendingUp, color: '#f59e0b', sub: 'A capturar' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: s.color }}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
            <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tier Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(['A', 'B', 'C'] as Tier[]).map(t => {
          const tc = TIER_COLORS[t];
          const tclients = clients.filter(c => c.tier === t);
          const tpot = tclients.reduce((s, c) => s + c.potencialTotal, 0);
          const labels = { A: 'Key Accounts — Alta prioridade', B: 'Crescimento — Mid Touch', C: 'Volume — Low Touch / Automação' };
          return (
            <div key={t} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-all" style={{ borderColor: tc.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                    {t}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Tier {t}</p>
                    <p className="text-[10px] text-slate-400">{tierCounts[t]} cliente{tierCounts[t] !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 mb-2">{labels[t]}</p>
              <p className="text-sm font-bold" style={{ color: tc.text }}>Potencial: {fmt(tpot)}</p>
            </div>
          );
        })}
      </div>

      {/* Clients snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Clientes Prioritários</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tier A em foco</p>
          </div>
          <button onClick={() => setActiveTab('clients')} className="text-xs font-bold text-indigo-600 hover:underline">Ver todos →</button>
        </div>
        <div className="divide-y divide-slate-50">
          {clients.filter(c => c.tier === 'A').slice(0, 5).map(c => (
            <div key={c.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: TYPE_COLORS[c.type] }}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-400">{c.type} • {c.contact}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{fmt(c.ticketMedio)}<span className="text-xs font-normal text-slate-400">/mês</span></p>
                {c.gapVenda > 0 && <p className="text-xs text-emerald-600 font-semibold">Gap: {fmt(c.gapVenda)}</p>}
              </div>
              {!c.potencialMapeado && <span className="text-[9px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">MORTO-VIVO</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CLIENTS ───────────────────────────────────────────────────────────────
  const renderClients = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, contato ou tipo..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm bg-white text-slate-800 outline-none focus:border-indigo-400 transition-all" />
        </div>
        <select value={filterTier} onChange={e => setFilterTier(e.target.value as any)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:border-indigo-400">
          <option>Todos</option><option>A</option><option>B</option><option>C</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:border-indigo-400">
          <option>Todos</option><option>Frotista</option><option>Indústria</option><option>Agro</option><option>Revenda</option><option>Autônomo</option>
        </select>
        <button onClick={() => setEditingClient({})}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all">
          <Plus className="w-4 h-4" />Novo Cliente
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const tc = TIER_COLORS[c.tier];
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: TYPE_COLORS[c.type] }}>
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{c.name}</h3>
                      <p className="text-xs text-slate-400">{c.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!c.potencialMapeado && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">MORTO-VIVO</span>
                    )}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      Tier {c.tier}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white" style={{ background: TYPE_COLORS[c.type] }}>{c.type}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{c.size}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{c.frequencia}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Ticket/Mês</p>
                    <p className="text-sm font-bold text-slate-800">{fmt(c.ticketMedio)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border" style={{ background: c.potencialMapeado ? '#f0fdf4' : '#fffbeb', borderColor: c.potencialMapeado ? '#bbf7d0' : '#fde68a' }}>
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
                    <div key={x.label} className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[9px] font-bold uppercase text-slate-400">{x.label}</p>
                      <p className="text-xs font-bold text-slate-700">{x.value}</p>
                    </div>
                  ))}
                </div>

                {(c.crossSell || c.upsell) && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 mb-3">
                    {c.crossSell && <p className="text-[10px] text-indigo-700"><span className="font-bold">Cross: </span>{c.crossSell}</p>}
                    {c.upsell && <p className="text-[10px] text-indigo-700 mt-0.5"><span className="font-bold">Upsell: </span>{c.upsell}</p>}
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 flex gap-2">
                <button onClick={() => setEditingClient(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />Editar
                </button>
                <button onClick={() => setClients(prev => prev.filter(x => x.id !== c.id))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo cliente</p>
          </div>
        )}
      </div>
    </div>
  );



  const renderPipeline = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Processo Comercial CRM</h3>
          <p className="text-xs text-slate-500">Acompanhamento visual e estratégico das fases de venda</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Foco: Avanço de Fase</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[500px]">
        {STAGES.map((stage, i) => {
          const stageClients = clients.filter(c => c.pipelineStage === i);
          const stageValue = stageClients.reduce((s, c) => s + c.ticketMedio, 0);

          return (
            <div key={stage.label} className="bg-white/50 rounded-2xl border border-slate-200/60 flex flex-col group hover:bg-white transition-all">
              <div className="p-4 border-b border-slate-100" style={{ background: stage.color + '08' }}>
                <div className="flex items-center gap-2 mb-2">
                  <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                  <p className="text-xs font-bold text-slate-800 truncate">{stage.label}</p>
                </div>
                <div className="flex justify-between items-baseline">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{stageClients.length} Clientes</p>
                  <p className="text-[10px] font-bold" style={{ color: stage.color }}>{fmt(stageValue)}</p>
                </div>
              </div>

              <div className="p-2 space-y-2 flex-1">
                {stageClients.map(c => (
                  <motion.div key={c.id} layoutId={String(c.id)} onClick={() => setEditingClient(c)}
                    className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group/card relative">
                    <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{c.name}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${c.tier === 'A' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>Tier {c.tier}</span>
                      <p className="text-[10px] font-bold text-slate-400">{fmt(c.ticketMedio)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 mt-auto border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Gatilho de Avanço:</p>
                <p className="text-[10px] font-bold text-slate-600 leading-tight">{stage.next}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── RETURN ────────────────────────────────────────────────────────────────
  // ── MATRIX ────────────────────────────────────────────────────────────────
  const renderMatrix = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/60 p-8 text-slate-800">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">Matriz de Prioridade — Onde você entra</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              O objetivo desta matriz é posicionar você, Gestor, nas negociações certas.
              Ao focar no Tier A, você mantém o controle sobre 80% do dinheiro com apenas 20% do esforço operacional.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Seu Foco</p>
              <p className="text-lg font-bold text-indigo-600">Tier A</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Time/Auto</p>
              <p className="text-lg font-bold text-emerald-600">Tier C</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TIER A */}
          <div className="flex flex-col h-full rounded-3xl border-2 border-indigo-500 bg-indigo-50/20 overflow-hidden">
            <div className="p-5 bg-indigo-600 text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-lg">20% da Carteira</span>
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Tier A</h3>
              <p className="text-sm text-indigo-100 opacity-90 mt-1">Alta Prioridade - "Big Money"</p>
            </div>
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="p-4 bg-white/60 rounded-2xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Atuação Recomendada</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">VOCÊ VENDE</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pl-2">
                <li>• Relacionamento direto do Gestor</li>
                <li>• Reuniões quinzenais</li>
                <li>• Foco total em Expansão</li>
              </ul>
            </div>
            <div className="px-6 pb-6 mt-auto">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Clientes Sugeridos</p>
              <div className="flex flex-wrap gap-2">
                {clients.filter(c => c.score >= 80).length > 0 ? (
                  clients.filter(c => c.score >= 80).map(c => (
                    <span key={c.id} className="px-2 py-1 bg-white border border-indigo-100 rounded-md text-[10px] font-bold text-indigo-600">{c.name}</span>
                  ))
                ) : <span className="text-[10px] italic text-slate-400">Nenhum cliente com score alto ainda.</span>}
              </div>
            </div>
          </div>

          {/* TIER B */}
          <div className="flex flex-col h-full rounded-3xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 bg-slate-800 text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded-lg">30% da Carteira</span>
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Tier B</h3>
              <p className="text-sm text-slate-300 mt-1">Crescimento - Mid Touch</p>
            </div>
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Atuação Recomendada</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">TIME + GESTOR (Chave)</p>
                </div>
              </div>
              <ul className="text-xs text-slate-500 space-y-2 pl-2">
                <li>• Vendedor lidera a conta</li>
                <li>• Gestor entra no fechamento</li>
                <li>• Monitoramento mensal de KPI</li>
              </ul>
            </div>
            <div className="px-6 pb-6 mt-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Clientes em Potencial</p>
              <div className="flex flex-wrap gap-2">
                {clients.filter(c => c.score >= 50 && c.score < 80).map(c => (
                  <span key={c.id} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600">{c.name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* TIER C */}
          <div className="flex flex-col h-full rounded-3xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">50% da Carteira</span>
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Tier C</h3>
              <p className="text-sm text-slate-500 mt-1">Volume - Automação</p>
            </div>
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Atuação Recomendada</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">TIME + AUTOMAÇÃO</p>
                </div>
              </div>
              <ul className="text-xs text-slate-500 space-y-2 pl-2">
                <li>• CRM e trilhas automáticas</li>
                <li>• Atendimento sob demanda</li>
                <li>• Baixo custo operacional</li>
              </ul>
            </div>
            <div className="px-6 pb-6 mt-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Base de Volume</p>
              <div className="flex flex-wrap gap-2">
                {clients.filter(c => c.score < 50).map(c => (
                  <span key={c.id} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-400">{c.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Critérios da Matriz" subtitle="Como o Score é calculado">
          <div className="space-y-4">
            {[
              { label: 'Ticket Potencial', weight: 'ALTO (30%)', color: 'indigo' },
              { label: 'Margem', weight: 'MÉDIA/ALTA (20%)', color: 'emerald' },
              { label: 'Risco Operacional', weight: 'ALTO (25%)', color: 'amber' },
              { label: 'Relacionamento Estratégico', weight: 'ALTO (25%)', color: 'rose' },
            ].map(x => (
              <div key={x.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">{x.label}</span>
                <span className="text-xs font-bold text-indigo-600">{x.weight}</span>
              </div>
            ))}
            <p className="text-[10px] text-slate-400 italic mt-2">O Score final determina o Tier sugerido automaticamente pelo sistema.</p>
          </div>
        </Card>
        <Card title="Impacto Financeiro" subtitle="Seu foco onde gera mais dinheiro">
          <div className="h-48 flex items-end gap-3 px-4">
            <div className="flex-1 bg-indigo-500 rounded-lg h-[90%] relative group">
              <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-indigo-600">80% Receita</div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white font-bold">TIER A</div>
            </div>
            <div className="flex-1 bg-slate-400 rounded-lg h-[40%] relative">
              <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-slate-500">15% Receita</div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white font-bold">TIER B</div>
            </div>
            <div className="flex-1 bg-slate-200 rounded-lg h-[15%] relative">
              <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-slate-400">5% Receita</div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-600 font-bold">TIER C</div>
            </div>
          </div>
          <p className="text-xs text-center text-slate-500 mt-8 leading-relaxed">
            <strong>Pare de queimar tempo:</strong> Clientes Tier A são 20% da sua base mas respondem pela maior parte do seu lucro futuro.
          </p>
        </Card>
      </div>
    </div>
  );

  // ── NURTURE ────────────────────────────────────────────────────────────────
  const renderNurture = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-6 h-6" /> Trilhas de Nutrição Ativas
          </h2>
          <p className="text-emerald-100 max-w-2xl text-sm leading-relaxed">
            Não é sobre o que você vende, é sobre a <strong>Jornada de Valor</strong>.
            Acompanhe cada etapa da trilha estratégica por segmento.
          </p>
        </div>
        <TrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.filter(c => c.tier !== 'C').map((c, i) => {
          const content = SEGMENT_CONTENT[c.type];
          const strategy = NURTURE_STRATEGY[c.type];
          const diasSemContato = Math.floor((new Date().getTime() - new Date(c.ultimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
          const currentHook = content[c.nurtureStep];
          const waMessage = `Olá ${c.contact.split(' ')[0]}, vi que você está ${c.type === 'Agro' ? 'preparando a safra' : 'com alto movimento'} e preparei um material sobre ${strategy.hook}:\n\n*${currentHook}*`;

          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs" style={{ background: TYPE_COLORS[c.type] }}>
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm truncate max-w-[140px]">{c.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{c.type} • TIER {c.tier}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-bold ${diasSemContato > 15 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {diasSemContato}D SEM CONTATO
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                    <span>Progresso da Trilha</span>
                    <span className="text-emerald-600">{Math.round((c.nurtureStep + 1) / 5 * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.nurtureStep + 1) / 5 * 100}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                      {React.createElement(NURTURE_STEPS[c.nurtureStep].icon, { className: "w-3 h-3 text-emerald-600" })}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Etapa Atual: <span className="text-slate-700">{NURTURE_STEPS[c.nurtureStep].label}</span></p>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-snug">{currentHook}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => sendWhatsApp(c.phone, waMessage)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all shadow-sm">
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => setViewingTrack(c as Client)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all group"
                >
                  Gerenciar Trilha <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Card title="Pilares da Nutrição Inteligente" subtitle="Por que funciona">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { t: 'Não é Produto', d: 'Fale de redução de custos, não de pneu novo.', i: TrendingUp, c: 'bg-indigo-50 text-indigo-600' },
            { t: 'Timing Certo', d: 'Agro compra antes da safra. Frotista compra todo mês.', i: Clock, c: 'bg-emerald-50 text-emerald-600' },
            { t: 'Autoridade', d: 'Quem resolve problemas vira parceiro, não fornecedor.', i: Award, c: 'bg-amber-50 text-amber-600' },
            { t: 'Escala', d: 'Use o time para o Tier B e você foca no A.', i: Users, c: 'bg-rose-50 text-rose-600' },
          ].map(x => (
            <div key={x.t} className="p-4 rounded-2xl bg-white border border-slate-100">
              <div className={`w-8 h-8 rounded-lg ${x.c} flex items-center justify-center mb-3`}><x.i className="w-4 h-4" /></div>
              <p className="text-xs font-bold text-slate-800 mb-1">{x.t}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{x.d}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );


  const NAV = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'matrix' as Tab, label: 'Matriz Prioridade', icon: Target },
    { id: 'nurture' as Tab, label: 'Nutrição Inteligente', icon: Zap },
    { id: 'clients' as Tab, label: 'Clientes', icon: Users },
    { id: 'pipeline' as Tab, label: 'CRM', icon: GitMerge },
  ];

  const TAB_TITLES = {
    dashboard: 'Visão Geral',
    matrix: 'Matriz de Prioridade',
    nurture: 'Nutrição Inteligente',
    clients: 'Gestão de Clientes',
    pipeline: 'Processo CRM'
  };

  const TAB_SUBS = {
    dashboard: 'KPIs e alertas da sua carteira',
    matrix: 'Onde VOCÊ entra para fechar grandes contas',
    nurture: 'Ganchos de valor baseados nas dores do cliente',
    clients: 'Segmentação: Perfil · Comportamento · Potencial',
    pipeline: 'Acompanhamento do processo comercial'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col z-50 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">CRM</p>
              <p className="text-[10px] text-slate-400">Sales Machine</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {authUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{authUser.name}</p>
              <p className="text-[10px] text-indigo-500">{authUser.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <item.icon className="w-4 h-4" />{item.label}
              {item.id === 'clients' && mortoVivos.length > 0 && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-white">{mortoVivos.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Nurture Alert in Sidebar */}
        <div className="px-5 mb-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Nutrição Ativa</span>
            </div>
            <p className="text-[10px] text-emerald-600 leading-tight">Você tem {clients.filter(c => c.tier === 'A').length} clientes Tier A precisando de conteúdo.</p>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100">
          <button onClick={() => setAuthUser(null)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
            <LogOut className="w-3.5 h-3.5" />Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-60 p-6 min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{TAB_TITLES[activeTab]}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{TAB_SUBS[activeTab]}</p>
          </div>

        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'matrix' && renderMatrix()}
            {activeTab === 'nurture' && renderNurture()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'pipeline' && renderPipeline()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {editingClient !== false && (
          <ClientModal client={editingClient} onSave={handleSave} onClose={() => setEditingClient(false)} />
        )}
        {viewingTrack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">{viewingTrack.name[0]}</div>
                  <div>
                    <h3 className="font-bold">{viewingTrack.name}</h3>
                    <p className="text-[10px] font-bold uppercase opacity-80">Jornada de Nutrição: {viewingTrack.type}</p>
                  </div>
                </div>
                <button onClick={() => setViewingTrack(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-100" />
                  <div className="space-y-6 relative">
                    {NURTURE_STEPS.map(step => {
                      const isActive = viewingTrack.nurtureStep === step.id;
                      const isPast = viewingTrack.nurtureStep > step.id;
                      const content = SEGMENT_CONTENT[viewingTrack.type][step.id];

                      return (
                        <div key={step.id} className="flex gap-5 group">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${isActive ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : isPast ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                          </div>
                          <div className={`flex-1 ${isActive ? '' : 'opacity-60'}`}>
                            <p className={`text-[10px] font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</p>
                            <p className="text-sm font-bold text-slate-800 mb-1">{step.desc}</p>
                            <div className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                              <p className="text-xs text-slate-600 italic">“{content}”</p>
                              {isActive && step.id === 1 && viewingTrack.type === 'Frotista' && (
                                <div className="mt-4 pt-4 border-t border-emerald-200/50">
                                  <p className="text-[10px] font-bold text-emerald-600 mb-2 uppercase">Insight: Custo Acumulado</p>
                                  <div className="h-20 flex items-end gap-1 px-2">
                                    {[30, 45, 40, 65, 80, 100].map((h, i) => (
                                      <div key={i} className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ height: `${h}%` }} />
                                    ))}
                                  </div>
                                  <p className="text-[9px] text-rose-600 font-bold mt-2 text-center">PONTO DE PREJUÍZO: +18.5% CUSTO/KM</p>
                                </div>
                              )}
                            </div>
                            {isActive && (
                              <button
                                onClick={() => {
                                  const next = viewingTrack.nurtureStep + 1;
                                  if (next < 5) {
                                    const updated = { ...viewingTrack, nurtureStep: next, ultimaInteracao: new Date().toISOString().split('T')[0] };
                                    handleSave(updated as Client);
                                    setViewingTrack(updated as Client);
                                  }
                                }}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition-all"
                              >
                                Avançar para {NURTURE_STEPS[Math.min(step.id + 1, 4)].label} <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const content = SEGMENT_CONTENT[viewingTrack.type];
                    const strategy = NURTURE_STRATEGY[viewingTrack.type];
                    const waMessage = `Olá ${viewingTrack.contact.split(' ')[0]}, vi que você está ${viewingTrack.type === 'Agro' ? 'preparando a safra' : 'com alto movimento'} e preparei um material sobre ${strategy.hook}:\n\n*${content[viewingTrack.nurtureStep]}*`;
                    sendWhatsApp(viewingTrack.phone, waMessage);
                  }}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
                </button>
                <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                  <Mail className="w-3.5 h-3.5" /> Enviar E-mail
                </button>
                <button onClick={() => setViewingTrack(null)} className="py-3 px-6 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Fechar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


