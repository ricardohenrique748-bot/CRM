import { LucideIcon } from 'lucide-react';

export type ClientType = 'Frotista' | 'Indústria' | 'Agro' | 'Revenda' | 'Autônomo';
export type ClientSize = 'Pequeno' | 'Médio' | 'Grande';
export type Complexity = 'Baixa' | 'Média' | 'Alta';
export type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Irregular';
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';
export type ViewMode = 'Pipeline' | 'Nutrição' | 'Configurações';
export type Tab = 'dashboard' | 'clients' | 'pipeline' | 'matrix' | 'nurture' | 'settings';

export interface Client {
  id: string;
  name: string;
  contato: string;
  whatsapp: string;
  email: string;
  type: ClientType;
  size: ClientSize;
  ticketMedio: number;
  frequencia: number;
  pipelineStage: number;
  score: number;
  tier: Tier;
  ultimaInteracao: string;
  nurtureActive: boolean;
  nurtureStep: number;
  notas: string;
}

export interface User {
  email: string;
  name: string;
  role: string;
}

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
