import { LucideIcon } from 'lucide-react';

export type ClientType = 'Frotista' | 'Indústria' | 'Agro' | 'Revenda' | 'Autônomo';
export type ClientSize = 'Pequeno' | 'Médio' | 'Grande';
export type Complexity = 'Baixa' | 'Média' | 'Alta';
export type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Irregular';
export type Tier = 'A' | 'B' | 'C';
export type Tab = 'dashboard' | 'clients' | 'pipeline' | 'matrix' | 'nurture' | 'settings';

export interface Client {
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

export interface User { email: string; name: string; role: string; }

export interface BlingConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  connected: boolean;
  redirectUri: string;
}

export interface Stage {
  label: string;
  color: string;
  icon: LucideIcon;
  next: string;
}
