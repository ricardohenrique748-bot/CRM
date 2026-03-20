import { STAGES } from './constants';
import { Tier } from './types';

export const fmt = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
};

export const calculateScore = (ticket: number, frequencia: number, stage: number) => {
  const stageWeights = [0.1, 0.3, 0.6, 0.8, 1.0, 0];
  const monthlyTotal = ticket * (frequencia || 1);
  const monthlyNorm = Math.min(monthlyTotal / 50000, 1);
  return Math.round((monthlyNorm * 0.7 + stageWeights[stage] * 0.3) * 100);
};

export const assignTierFromScore = (score: number): Tier => {
  if (score >= 90) return 'S';
  if (score >= 70) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
};

export const sendWhatsApp = (phone: string, text: string) => {
  const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
