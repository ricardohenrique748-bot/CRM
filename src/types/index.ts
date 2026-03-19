// src/types/index.ts

export type ClientType = 'Frotista' | 'Indústria' | 'Agro' | 'Revenda' | 'Autônomo';
export type ClientSize = 'Pequeno' | 'Médio' | 'Grande';
export type Complexity = 'Baixa' | 'Média' | 'Alta';
export type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Irregular';
export type Tier = 'A' | 'B' | 'C';
export type Tab = 'dashboard' | 'clients' | 'pipeline' | 'matrix' | 'nurture' | 'settings';

export interface Client {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  type: ClientType;
  size: ClientSize;
  ticketMedio: number;
  margem: number;
  complexidade: Complexity;
  frequencia: Frequency;
  mix: string;
  sensibilidadePreco: Complexity;
  dependenciaOp: Complexity;
  potencialTotal: number;
  gapVenda: number;
  crossSell: string;
  upsell: string;
  potencialMapeado: boolean;
  tier: Tier;
  score: number;
  ultimaInteracao: string;
  notas: string;
  riscoOp: Complexity;
  relacEstrategico: Complexity;
  nurtureStep: number;
  pipelineStage: number;
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
