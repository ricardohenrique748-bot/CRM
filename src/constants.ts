import { Users, Search, FileText, MessageCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Stage } from './types';

export const STAGES: Stage[] = [
  { label: 'Lead / Ativo', color: '#64748b', icon: Users, next: 'Qual potencial mapeado?' },
  { label: 'Oportunidade', color: '#6366f1', icon: Search, next: 'Tem dor identificada?' },
  { label: 'Proposta', color: '#0891b2', icon: FileText, next: 'Recebeu orçamento?' },
  { label: 'Negociação', color: '#f59e0b', icon: MessageCircle, next: 'Alinhando termos?' },
  { label: 'Fechamento', color: '#10b981', icon: CheckCircle2, next: 'Contrato assinado?' },
  { label: 'Expansão (Pós)', color: '#ec4899', icon: TrendingUp, next: 'Qual o novo Gap?' },
];

export const TIER_COLORS = {
  A: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  B: { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f' },
  C: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
};

export const TYPE_COLORS = {
  Frotista: '#6366f1',
  Indústria: '#0891b2',
  Agro: '#10b981',
  Revenda: '#f59e0b',
  'Autônomo': '#64748b',
};

export const STORAGE_KEY = 'crm_saved_credentials';
