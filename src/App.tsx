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
  GitMerge, Calendar, Filter, RefreshCw, MessageSquare, Clock, Award, MessageCircle,
  Link, Download, ExternalLink, KeyRound, CheckCheck, Info, XCircle, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── TYPES ──────────────────────────────────────────────────────────────────
type ClientType = 'Frotista' | 'Indústria' | 'Agro' | 'Revenda' | 'Autônomo';
type ClientSize = 'Pequeno' | 'Médio' | 'Grande';
type Complexity = 'Baixa' | 'Média' | 'Alta';
type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Irregular';
type Tier = 'A' | 'B' | 'C';
type Tab = 'dashboard' | 'clients' | 'pipeline' | 'matrix' | 'nurture' | 'settings';

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
  // Novos Campos
  cnpj: string;
  lastPurchaseDate: string;
  blingId: string;
}

interface User { email: string; name: string; role: string; }

interface BlingConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  connected: boolean;
  redirectUri: string; // URL exata cadastrada no Bling
}

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
    cnpj: '', lastPurchaseDate: '', blingId: '',
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
    cnpj: '', lastPurchaseDate: '', blingId: '',
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
    cnpj: '', lastPurchaseDate: '', blingId: '',
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
    cnpj: '', lastPurchaseDate: '', blingId: '',
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
  riscoOp: 'Baixa',
  relacEstrategico: 'Baixa',
  nurtureStep: 0,
  pipelineStage: 0,
  cnpj: '',
  lastPurchaseDate: '',
  blingId: '',
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
const LoginPage = ({ onLogin }: { onLogin: (u: User) => void; key?: string }) => {
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
              {S('CNPJ', 'cnpj', 'text', '00.000.000/0000-00')}
              {S('Última Compra', 'lastPurchaseDate', 'date', '')}
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
  const [authUser, setAuthUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { email, password } = JSON.parse(saved);
        return USERS.find(u => u.email === email && u.password === password) || null;
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão:', e);
    }
    return null;
  });
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
        nurtureStep: c.nurture_step, pipelineStage: c.pipeline_stage,
        cnpj: c.cnpj || '',
        lastPurchaseDate: c.last_purchase_date || '',
        blingId: String(c.bling_id || '')
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
      nurture_step: c.nurtureStep, pipeline_stage: c.pipelineStage,
      cnpj: c.cnpj, last_purchase_date: c.lastPurchaseDate || null,
      bling_id: c.blingId ? Number(c.blingId) : null
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


  const totalPotencial = clients.reduce((s, c) => s + c.potencialTotal, 0);
  const totalGap = clients.reduce((s, c) => s + c.gapVenda, 0);
  const totalTicket = clients.reduce((s, c) => s + c.ticketMedio, 0);
  const tierCounts = { A: clients.filter(c => c.tier === 'A').length, B: clients.filter(c => c.tier === 'B').length, C: clients.filter(c => c.tier === 'C').length };

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Ativos', value: clients.length.toString(), icon: Users, color: '#6366f1', sub: 'Carteira total' },
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
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">{c.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">ID: {c.id}</span>
                        {c.cnpj && <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap leading-none border-l pl-2 border-slate-200">CNPJ: {c.cnpj}</span>}
                      </div>
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
                <button onClick={async () => {
                  const { error } = await supabase.from('clients').delete().eq('id', c.id);
                  if (error) { console.error('Erro ao excluir cliente:', error); return; }
                  setClients(prev => prev.filter(x => x.id !== c.id));
                }}
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



  const renderPipeline = () => {
    return (
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
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                    {fmt(stageValue)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{stageClients.length} cliente{stageClients.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {stageClients.map(c => (
                    <div key={c.id}
                      onClick={() => setEditingClient(c)}
                      className="p-2.5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0" style={{ background: TYPE_COLORS[c.type] }}>
                          {c.name[0]}
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{c.name}</p>
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-700">{fmt(c.ticketMedio)}<span className="text-slate-400 font-normal">/mês</span></p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: TIER_COLORS[c.tier].bg, color: TIER_COLORS[c.tier].text }}>Tier {c.tier}</span>
                    </div>
                  ))}
                  {stageClients.length === 0 && (
                    <p className="text-[10px] text-slate-300 text-center pt-4 italic">Sem clientes</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMatrix = () => {
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


  // ── BLING CONFIG ────────────────────────────────────────────────────────────
  const BLING_STORAGE_KEY = 'crm_bling_config';
  const DEFAULT_REDIRECT_URI = window.location.origin + '/';
  const [blingConfig, setBlingConfig] = useState<BlingConfig>(() => {
    try {
      const saved = localStorage.getItem(BLING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // garante que redirectUri existe mesmo em configs antigas
        return { 
          redirectUri: DEFAULT_REDIRECT_URI, 
          ...parsed,
          // Pre-preenche se o usuário acabou de fornecer aqui
          clientId: parsed.clientId || '1c4535a5c37bf5f271c3c29f4c836b0c8f817daf',
          clientSecret: parsed.clientSecret || '2fa22fd40737a11a9c25309a5d07ddd8e0390793cc848c02be040f7bd8e8'
        };
      }
      return { 
        clientId: '1c4535a5c37bf5f271c3c29f4c836b0c8f817daf', 
        clientSecret: '2fa22fd40737a11a9c25309a5d07ddd8e0390793cc848c02be040f7bd8e8', 
        accessToken: '', 
        refreshToken: '', 
        connected: false, 
        redirectUri: DEFAULT_REDIRECT_URI 
      }; 
    } catch { 
      return { 
        clientId: '1c4535a5c37bf5f271c3c29f4c836b0c8f817daf', 
        clientSecret: '2fa22fd40737a11a9c25309a5d07ddd8e0390793cc848c02be040f7bd8e8', 
        accessToken: '', 
        refreshToken: '', 
        connected: false, 
        redirectUri: DEFAULT_REDIRECT_URI 
      }; 
    }
  });
  const [blingCopied, setBlingCopied] = useState(false);
  const [blingImportStatus, setBlingImportStatus] = useState<'idle' | 'loading' | 'preview' | 'importing' | 'success' | 'error'>('idle');
  const [blingImportError, setBlingImportError] = useState('');
  const [blingPreviewClients, setBlingPreviewClients] = useState<Partial<Client>[]>([]);
  const [blingImportCount, setBlingImportCount] = useState(0);
  const [blingPage, setBlingPage] = useState(1);

  const saveBlingConfig = (cfg: BlingConfig) => {
    localStorage.setItem(BLING_STORAGE_KEY, JSON.stringify(cfg));
    setBlingConfig(cfg);
  };

  // Inicia o fluxo OAuth2 do Bling
  const blingAuthorize = () => {
    if (!blingConfig.clientId) { alert('Informe o Client ID primeiro.'); return; }
    if (!blingConfig.redirectUri) { alert('Informe a URL de redirecionamento primeiro.'); return; }
    // Salva as credenciais antes de redirecionar para garantir que estejam disponíveis ao retornar
    saveBlingConfig(blingConfig);
    const redirectUri = encodeURIComponent(blingConfig.redirectUri);
    // NOTA: O Bling NÃO usa parâmetro scope na URL — os escopos são definidos
    // no cadastro do aplicativo em: Bling → Central de Extensões → Área do Integrador → editar app → Lista de escopos
    const url = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${blingConfig.clientId}&redirect_uri=${redirectUri}&state=crm_bling`;
    window.location.href = url;
  };

  // Troca o authorization code pelo access token via proxy serverless (evita CORS)
  const blingExchangeCode = async (code: string) => {
    setBlingImportStatus('loading');
    setBlingImportError('');
    try {
      let cfg = blingConfig;
      try {
        const saved = localStorage.getItem(BLING_STORAGE_KEY);
        if (saved) cfg = { ...cfg, ...JSON.parse(saved) };
      } catch { /* usa blingConfig */ }
      
      if (!cfg.clientId || !cfg.clientSecret) {
        throw new Error('Client ID ou Client Secret não encontrados para a troca do token.');
      }

      // Usamos a rota /api/proxy-bling que criamos para contornar o CORS
      const res = await fetch('/api/proxy-bling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          grantType: 'authorization_code',
          clientId: cfg.clientId,
          clientSecret: cfg.clientSecret,
          code, 
          redirectUri: cfg.redirectUri || DEFAULT_REDIRECT_URI 
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errTxt = errJson.error_description || errJson.error || await res.text().catch(() => res.status.toString());
        throw new Error(`Erro na API (${res.status}): ${errTxt}`);
      }

      const data = await res.json();
      const newCfg = { ...cfg, accessToken: data.access_token, refreshToken: data.refresh_token, connected: true };
      saveBlingConfig(newCfg);
      setBlingImportStatus('success'); 
      
      const url = new URL(window.location.href);
      url.searchParams.delete('code'); url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    } catch (e: any) { 
      console.error('Bling Exchange Error:', e);
      setBlingImportError(e.message); 
      setBlingImportStatus('error');
    }
  };

  // Renova o access token usando o refresh token
  const blingRefreshToken = async (): Promise<string | null> => {
    if (!blingConfig.refreshToken) {
      setBlingImportError('Sessão expirada. Clique em "Conectar ao Bling" para autenticar novamente.');
      saveBlingConfig({ ...blingConfig, connected: false, accessToken: '', refreshToken: '' });
      return null;
    }
    try {
      const res = await fetch('/api/proxy-bling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          grantType: 'refresh_token',
          clientId: blingConfig.clientId,
          clientSecret: blingConfig.clientSecret,
          refreshToken: blingConfig.refreshToken
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // O refresh token também pode ter expirado; força nova autenticação
        const errMsg = data?.error_description || data?.message || data?.error || `Status ${res.status}`;
        saveBlingConfig({ ...blingConfig, connected: false, accessToken: '', refreshToken: '' });
        throw new Error(`Refresh token inválido ou expirado: ${errMsg}. Reconecte ao Bling.`);
      }
      const newCfg = { ...blingConfig, accessToken: data.access_token, refreshToken: data.refresh_token, connected: true };
      saveBlingConfig(newCfg);
      return data.access_token;
    } catch (e: any) {
      console.error('Erro ao renovar token Bling:', e);
      setBlingImportError(e.message);
      return null;
    }
  };

  // Função auxiliar para buscar resumo de vendas (ticket médio e última compra)
  const fetchBlingSalesSummary = async (months = 24): Promise<Map<string, { total: number; count: number; lastDate: string }>> => {
    const salesMap = new Map<string, { total: number; count: number; lastDate: string }>();
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - months);
    const dateStr = dateLimit.toISOString().split('T')[0];

    let token = blingConfig.accessToken;
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore && page <= 10) { // Aumentado para 10 páginas (1000 pedidos)
        const doFetch = async (tkn: string) => fetch('/api/proxy-bling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proxyUrl: `https://www.bling.com.br/Api/v3/pedidos/vendas?pagina=${page}&limite=100&dataInicial=${dateStr}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tkn}`, 'Accept': 'application/json' }
          })
        });

        let res = await doFetch(token);
        if (res.status === 401 || res.status === 403) {
          const refreshed = await blingRefreshToken();
          if (!refreshed) break;
          token = refreshed;
          res = await doFetch(token);
        }

        if (!res.ok) break;
        const json = await res.json();
        const sales = json.data || [];
        if (sales.length === 0) { hasMore = false; break; }

        for (const s of sales) {
          const clientId = String(s.contato?.id || '');
          if (!clientId) continue;
          const val = Number(s.total || 0);
          const date = s.data || '';
          
          const current = salesMap.get(clientId) || { total: 0, count: 0, lastDate: '' };
          current.total += val;
          current.count += 1;
          if (!current.lastDate || date > current.lastDate) current.lastDate = date;
          salesMap.set(clientId, current);
        }
        page++;
      }
    } catch (e) {
      console.warn('Erro ao buscar vendas do Bling:', e);
    }
    return salesMap;
  };

  // Busca clientes/contatos do Bling e converte para o formato do CRM
  const blingFetchContacts = async (page = 1, salesMap?: Map<string, any>): Promise<Partial<Client>[]> => {
    let token = blingConfig.accessToken;
    const doFetch = async (tkn: string) => fetch('/api/proxy-bling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proxyUrl: `https://www.bling.com.br/Api/v3/contatos?pagina=${page}&limite=100`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tkn}`, 'Accept': 'application/json' }
      })
    });
    let res = await doFetch(token);
    // 401 = token expirado, 403 = token expirado ou scope insuficiente → tenta refresh
    if (res.status === 401 || res.status === 403) {
      const refreshed = await blingRefreshToken();
      if (!refreshed) {
        // A mensagem já foi setada pelo blingImportError, apenas re-lança
        throw new Error(blingImportError || 'Token expirado. Reconecte ao Bling.');
      }
      token = refreshed;
      res = await doFetch(token);
    }
    if (!res.ok) {
      // Lê o JSON de erro do Bling para mostrar a mensagem real
      let errDetail = `Status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.fields?.length) {
          errDetail = errJson.error.fields.map((f: any) => f.msg).join(', ');
        } else {
          errDetail = errJson?.error?.message || errJson?.message || errJson?.error_description || errDetail;
        }
      } catch { /* ignora */ }
      throw new Error(`Bling: ${errDetail}`);
    }
    const json = await res.json();
    const contatos = json.data || [];

    return contatos.map((c: any): Partial<Client> => {
      const blingId = String(c.id || '');
      const sales = salesMap?.get(blingId) || { total: 0, count: 0, lastDate: '' };
      
      const totalPeriodo = sales.total;
      const ticketMedio = Math.round(totalPeriodo / 12); // Mantemos média mensal estimada em 12 meses
      
      // Inteligência de mapeamento sofisticada
      let type: ClientType = 'Frotista';
      if (c.tipo === 'F') type = 'Autônomo';
      else if (totalPeriodo > 150000) type = 'Indústria';
      else if (c.situacao === 'A' && totalPeriodo > 50000 && c.tipo === 'J') type = 'Frotista';
      else if (c.contatosFechamento?.length > 0) type = 'Revenda'; 

      let size: 'Pequeno' | 'Médio' | 'Grande' = 'Médio';
      if (totalPeriodo > 300000) size = 'Grande';
      else if (totalPeriodo < 40000) size = 'Pequeno';

      const potencialTotal = Math.max(totalPeriodo * 1.4, ticketMedio * 18); // Estima potencial 40% acima do atual ou 18 meses de ticket
      const gapVenda = Math.max(0, potencialTotal - totalPeriodo);

      // Extração robusta de CNPJ/CPF (pode estar no numeroDocumento, codigo ou embutido no nome)
      let doc = String(c.numeroDocumento || '').replace(/\D/g, '');
      if (!doc || doc.length < 11) {
        // Tenta extrair do nome se o nome começar com uma sequência longa de dígitos
        const match = (c.nome || '').match(/^(\d{11,14})/);
        if (match) doc = match[1];
      }
      
      // Se ainda não tem, tenta o campo codigo (alguns sistemas salvam o CNPJ no código)
      if ((!doc || doc.length < 11) && c.codigo && c.codigo.length >= 11) {
        doc = String(c.codigo).replace(/\D/g, '');
      }

      // Limpeza de telefone
      const clearPhone = (p: string) => p ? p.replace(/[^0-9]/g, '') : '';
      let phone = clearPhone(c.celular) || clearPhone(c.telefone) || clearPhone(c.fone) || '';
      if (phone.length >= 10) {
        // Formata minimamente se tiver sucesso
        phone = phone.length === 11 
          ? `(${phone.substring(0,2)}) ${phone.substring(2,7)}-${phone.substring(7)}`
          : `(${phone.substring(0,2)}) ${phone.substring(2,6)}-${phone.substring(6)}`;
      }

      // Heurística de Mix baseada no perfil
      const mixByPage: Record<ClientType, string> = {
        'Frotista': 'Pneus de Carga, Recapagem e Gestão de KM',
        'Indústria': 'Pneus Fora de Estrada e Serviços Industriais',
        'Agro': 'Pneus Agrícolas e Manutenção de Campo',
        'Revenda': 'Atacado de Carcaças e Pneus Novos',
        'Autônomo': 'Pneus de Passeio/Carga e Serviços Rápidos'
      };

      // Heurística de frequência
      let frequencia: Client['frequencia'] = 'Mensal';
      if (sales.count > 12) frequencia = 'Semanal';
      else if (sales.count < 4 && sales.count > 0) frequencia = 'Trimestral';
      else if (sales.count === 0) frequencia = 'Irregular';

      return {
        name: c.nome || c.razaoSocial || '',
        contact: c.fantasia || c.nome || '',
        phone: phone,
        email: c.email || '',
        type,
        size,
        ticketMedio,
        margem: type === 'Indústria' ? 28 : (type === 'Revenda' ? 15 : 22), 
        complexidade: size === 'Grande' ? 'Alta' : 'Média',
        frequencia,
        mix: mixByPage[type] || 'Pneus e Serviços',
        sensibilidadePreco: size === 'Grande' ? 'Baixa' : 'Média',
        dependenciaOp: size === 'Grande' ? 'Alta' : 'Média',
        potencialTotal,
        gapVenda,
        crossSell: type === 'Frotista' ? 'Sistema de Monitoramento e Recap' : 'Contrato de Manutenção',
        upsell: size === 'Grande' ? 'Gestão de Frotas Premium' : 'Upgrade de Categoria de Pneu',
        potencialMapeado: totalAnual > 0,
        tier: 'C', // Será recalculado no confirm
        score: 0,
        ultimaInteracao: new Date().toISOString().split('T')[0],
        notas: `Importado do Bling. Histórico 12m: ${sales.count} pedidos, total faturado ${fmt(totalAnual)}.`,
        riscoOp: 'Baixa',
        relacEstrategico: totalAnual > 100000 ? 'Alta' : (totalAnual > 30000 ? 'Média' : 'Baixa'),
        nurtureStep: 0,
        pipelineStage: 0,
        cnpj: c.numeroDocumento || c.codigo || '',
        lastPurchaseDate: sales.lastDate,
        blingId
      };
    });
  };

  // Preview de importação
  const blingStartImport = async () => {
    setBlingImportStatus('loading');
    setBlingImportError('');
    try {
      const salesMap = await fetchBlingSalesSummary(12);
      const first = await blingFetchContacts(1, salesMap);
      setBlingPreviewClients(first);
      setBlingImportStatus('preview');
      setBlingPage(1);
    } catch (e: any) {
      setBlingImportError(e.message);
      setBlingImportStatus('error');
    }
  };

  // Confirma e salva no banco
  const blingConfirmImport = async () => {
    setBlingImportStatus('importing');
    let count = 0;
    try {
      // Buscar IDs já existentes para evitar duplicados
      const { data: existingIds } = await supabase.from('clients').select('bling_id');
      // Armazena como string para comparar corretamente com blingId (que também é string)
      const existingBlingIds = new Set<string>(existingIds?.map(i => String(i.bling_id)).filter(id => id && id !== 'null') || []);

      const salesMap = await fetchBlingSalesSummary(12);
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const batch = await blingFetchContacts(page, salesMap);
        if (batch.length === 0) { hasMore = false; break; }
        for (const raw of batch) {
          const c = raw as Client;
          
          // Pular se já estiver no banco
          if (c.blingId && existingBlingIds.has(String(c.blingId))) {
            continue;
          }

          const newScore = calculateScore(c);
          const newTier = assignTierFromScore(newScore);
          const full: Omit<Client, 'id'> = {
            ...emptyClient(), ...c, score: newScore, tier: newTier,
          };
          const dbClient = {
            name: full.name, contact: full.contact, phone: full.phone, email: full.email,
            type: full.type, size: full.size,
            ticket_medio: full.ticketMedio, margem: full.margem, complexidade: full.complexidade,
            frequencia: full.frequencia, mix: full.mix,
            sensibilidade_preco: full.sensibilidadePreco, dependencia_op: full.dependenciaOp,
            potencial_total: full.potencialTotal, gap_venda: full.gapVenda,
            cross_sell: full.crossSell, upsell: full.upsell,
            potencial_mapeado: full.potencialMapeado,
            tier: full.tier, score: full.score, ultima_interacao: full.ultimaInteracao, notas: full.notas,
            risco_op: full.riscoOp, relac_estrategico: full.relacEstrategico,
            nurture_step: full.nurtureStep, pipeline_stage: full.pipelineStage,
            cnpj: full.cnpj,
            last_purchase_date: full.lastPurchaseDate || null,
            bling_id: full.blingId ? Number(full.blingId) : null
          };
          await supabase.from('clients').insert([dbClient]);
          count++;
          
          // Adicionar ao Set local para evitar duplicados no mesmo lote
          if (dbClient.bling_id) existingBlingIds.add(String(dbClient.bling_id));
        }
        page++;
        if (batch.length < 100) hasMore = false;
      }
      setBlingImportCount(count);
      setBlingImportStatus('success');
      fetchClients();
    } catch (e: any) {
      setBlingImportError(e.message);
      setBlingImportStatus('error');
    }
  };

  // Verifica se há um code OAuth2 na URL ao carregar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state === 'crm_bling') {
      setActiveTab('settings');
      blingExchangeCode(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── RENDER SETTINGS ─────────────────────────────────────────────────────────
  const renderSettings = () => (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Configurações do Sistema</h2>
            <p className="text-xs text-slate-400">Integrações e preferências do CRM</p>
          </div>
        </div>

        {/* Bling Section */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                B
              </div>
              <div>
                <p className="font-bold text-white text-sm">Integração Bling ERP</p>
                <p className="text-[10px] text-slate-300">API v3 • OAuth 2.0 • Importação de Contatos</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
              blingConfig.connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-600/50 text-slate-300 border border-slate-500/30'
            }`}>
              {blingConfig.connected ? <><CheckCheck className="w-3.5 h-3.5" />Conectado</> : <><XCircle className="w-3.5 h-3.5" />Não conectado</>}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Instruções */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-bold">Como configurar a integração:</p>
                <ol className="list-decimal pl-4 space-y-1 text-blue-600">
                  <li>Acesse seu <strong>Bling</strong> → <strong>Preferências</strong> → <strong>Central de Extensões</strong> → <strong>Área do Integrador</strong></li>
                  <li>Crie ou edite seu aplicativo</li>
                  <li>No campo <strong>"Link de redirecionamento"</strong> cole a URL exibida abaixo</li>
                  <li className="text-rose-700 font-semibold">⚠️ Em <strong>"Lista de escopos"</strong> habilite: <strong>Contatos → Informações básicas → Visualizar</strong> (sem isso gera o erro <code>insufficient_scope</code>)</li>
                  <li>Copie o <strong>Client ID</strong> e <strong>Client Secret</strong>, cole nos campos abaixo e clique em <strong>Conectar ao Bling</strong></li>
                </ol>
              </div>
            </div>

            {/* Redirect URI — MAIS IMPORTANTE */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                URL de Redirecionamento — Cadastre EXATAMENTE esta URL no Bling
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={blingConfig.redirectUri}
                  onChange={e => setBlingConfig(p => ({ ...p, redirectUri: e.target.value }))}
                  className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-50 font-mono transition-all"
                />
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(blingConfig.redirectUri);
                    setBlingCopied(true);
                    setTimeout(() => setBlingCopied(false), 2000);
                  }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    blingCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {blingCopied ? <><CheckCheck className="w-3.5 h-3.5" />Copiado!</> : <><Copy className="w-3.5 h-3.5" />Copiar</>}
                </motion.button>
              </div>
              <div className="text-[10px] text-amber-700 mt-2 space-y-1">
                <p>⚠️ <strong>Atenção:</strong> Se você está usando o <u>localhost</u>, a URL deve ser <code>http://localhost:5173/</code>.</p>
                <p>⚠️ Se você publicou no <u>Vercel</u>, você deve atualizar a URL no portal do Bling para o link da Vercel.</p>
                <p>Qualquer diferença (como falta da barra <code>/</code> no final) causará o erro <strong>redirect_uri_mismatch</strong>.</p>
              </div>
            </div>

            {/* Credenciais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5" />Client ID
                </label>
                <input
                  type="text"
                  value={blingConfig.clientId}
                  onChange={e => setBlingConfig(p => ({ ...p, clientId: e.target.value }))}
                  placeholder="Cole seu Client ID aqui..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all bg-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                  <Lock className="w-3.5 h-3.5" />Client Secret
                </label>
                <input
                  type="password"
                  value={blingConfig.clientSecret}
                  onChange={e => setBlingConfig(p => ({ ...p, clientSecret: e.target.value }))}
                  placeholder="Cole seu Client Secret aqui..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all bg-white"
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={() => saveBlingConfig(blingConfig)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />Salvar Credenciais
              </motion.button>
              <motion.button
                onClick={blingAuthorize}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />Conectar ao Bling (OAuth)
              </motion.button>
              {blingConfig.connected && (
                <motion.button
                  onClick={() => saveBlingConfig({ ...blingConfig, accessToken: '', refreshToken: '', connected: false })}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-all"
                >
                  <XCircle className="w-4 h-4" />Desconectar
                </motion.button>
              )}
            </div>

            {/* Seção de Importação */}
            {blingConfig.connected && (
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600" />Importar Clientes do Bling
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Busca todos os contatos pessoa jurídica cadastrados no Bling e importa para o CRM.</p>
                  </div>
                  {blingImportStatus === 'idle' || blingImportStatus === 'error' ? (
                    <motion.button
                      onClick={blingStartImport}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />Iniciar Importação
                    </motion.button>
                  ) : blingImportStatus === 'success' ? (
                    <motion.button
                      onClick={() => setBlingImportStatus('idle')}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />Importar Novamente
                    </motion.button>
                  ) : null}
                </div>

                {/* Status de importação */}
                <AnimatePresence mode="wait">
                  {blingImportStatus === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <motion.div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
                      <p className="text-sm font-semibold text-indigo-700">Buscando contatos no Bling...</p>
                    </motion.div>
                  )}

                  {blingImportStatus === 'importing' && (
                    <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <motion.div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-600 rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
                      <p className="text-sm font-semibold text-amber-700">Importando clientes para o CRM... Aguarde.</p>
                    </motion.div>
                  )}

                  {blingImportStatus === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Importação concluída com sucesso!</p>
                        <p className="text-xs text-emerald-600">{blingImportCount} cliente(s) importado(s) do Bling para o CRM.</p>
                      </div>
                    </motion.div>
                  )}

                  {blingImportStatus === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-rose-800">Erro na importação</p>
                        <p className="text-xs text-rose-600">{blingImportError}</p>
                      </div>
                    </motion.div>
                  )}

                  {blingImportStatus === 'preview' && blingPreviewClients.length > 0 && (
                    <motion.div key="preview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="text-sm font-bold text-amber-800">Prévia da importação</p>
                            <p className="text-xs text-amber-700">{blingPreviewClients.length} contato(s) encontrado(s) na 1ª página. Confirme para importar todos.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setBlingImportStatus('idle')}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
                          <motion.button onClick={blingConfirmImport}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" />Confirmar Importação
                          </motion.button>
                        </div>
                      </div>

                      {/* Tabela preview */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visualização dos primeiros {Math.min(10, blingPreviewClients.length)} registros</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {blingPreviewClients.slice(0, 10).map((c, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-all">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                {(c.name || '?')[0]?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{c.name || '—'}</p>
                                <p className="text-xs text-slate-400 truncate">{c.email || c.phone || 'Sem contato'}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">Tier C</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {blingImportStatus === 'preview' && blingPreviewClients.length === 0 && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <Users className="w-5 h-5 text-slate-400" />
                      <p className="text-sm text-slate-600">Nenhum contato pessoa jurídica encontrado no Bling.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outras configurações futuras */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Link className="w-4 h-4 text-slate-400" />Outras Integrações
        </h3>
        <div className="flex flex-wrap gap-3">
          {['WhatsApp Business API', 'Google Sheets', 'RD Station', 'HubSpot'].map(name => (
            <div key={name} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />{name} <span className="text-slate-300">• Em breve</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const NAV = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'matrix' as Tab, label: 'Análise de Funil', icon: BarChart3 },
    { id: 'nurture' as Tab, label: 'Nutrição Inteligente', icon: Zap },
    { id: 'clients' as Tab, label: 'Clientes', icon: Users },
    { id: 'pipeline' as Tab, label: 'Canal de Vendas', icon: GitMerge },
    { id: 'settings' as Tab, label: 'Configurações', icon: Settings },
  ];

  const TAB_TITLES: Record<Tab, string> = {
    dashboard: 'Visão Geral',
    matrix: 'Métricas de Pipeline',
    nurture: 'Nutrição Inteligente',
    clients: 'Gestão de Clientes',
    pipeline: 'Funil de Vendas',
    settings: 'Configurações'
  };

  const TAB_SUBS: Record<Tab, string> = {
    dashboard: 'Monitoramento de performance em tempo real',
    matrix: 'Saúde, conversões e previsibilidade do seu funil',
    nurture: 'Estratégias de conteúdo para aquecimento de leads',
    clients: 'Segmentação: Perfil · Comportamento · Potencial',
    pipeline: 'Acompanhamento do processo comercial',
    settings: 'Integrações e gestão do sistema de vendas'
  };

  return (
    <AnimatePresence mode="wait">
      {!authUser ? (
        <LoginPage onLogin={setAuthUser} key="login" />
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 text-slate-900">
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
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

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
              <button onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setAuthUser(null);
              }}
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
                {activeTab === 'settings' && renderSettings()}
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
      )}
    </AnimatePresence>
  );
}

