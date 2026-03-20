import { Users, Search, FileText, MessageCircle, CheckCircle2, TrendingUp, BarChart3, Target, DollarSign, RefreshCw } from 'lucide-react';
import { Stage, ClientType } from './types';

export const STAGES: Stage[] = [
  { label: 'Lead / Ativo', color: '#64748b', icon: Users, next: 'Qual potencial mapeado?' },
  { label: 'Oportunidade', color: '#6366f1', icon: Search, next: 'Tem dor identificada?' },
  { label: 'Proposta', color: '#0891b2', icon: FileText, next: 'Recebeu orçamento?' },
  { label: 'Negociação', color: '#f59e0b', icon: MessageCircle, next: 'Alinhando termos?' },
  { label: 'Fechamento', color: '#10b981', icon: CheckCircle2, next: 'Contrato assinado?' },
  { label: 'Expansão (Pós)', color: '#ec4899', icon: TrendingUp, next: 'Qual o novo Gap?' },
];

export const TIER_COLORS = {
  S: { bg: '#fff7ed', border: '#ffedd5', text: '#9a3412' },
  A: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  B: { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f' },
  C: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
  D: { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
};

export const TYPE_COLORS: Record<ClientType, string> = {
  Frotista: '#6366f1',
  Indústria: '#0891b2',
  Agro: '#10b981',
  Revenda: '#f59e0b',
  'Autônomo': '#64748b',
};

export const STORAGE_KEY = 'crm_saved_credentials';

export const USERS = [
  { email: 'admin@empresa.com', password: 'password', name: 'Administrador', role: 'Admin' },
  { email: 'ricardo.luz@eunaman.com.br', password: '15975321', name: 'Ricardo Luz', role: 'Gestor' },
  { email: 'lucas.contadini@eunaman.com.br', password: '123456', name: 'Lucas Contadini', role: 'Gestor' },
];

export const NURTURE_STEPS = [
  { id: 0, label: 'Conteúdo', icon: FileText, desc: 'Educação sobre a dor' },
  { id: 1, label: 'Insight', icon: BarChart3, desc: 'Provocação baseada em dados' },
  { id: 2, label: 'CTA Leve', icon: Target, desc: 'Oferta de diagnóstico/ajuda' },
  { id: 3, label: 'Proposta', icon: DollarSign, desc: 'Solução comercial estruturada' },
  { id: 4, label: 'Follow-up', icon: RefreshCw, desc: 'Manutenção do contato humano' },
];

export const SEGMENT_CONTENT: Record<ClientType, string[]> = {
  Frotista: [
    '“Quando o pneu começa a te dar prejuízo sem você perceber”',
    'Gráfico de Custo Acumulado: Oculto vs Visível',
    'Diagnóstico gratuito de carcaças na frota',
    'Proposta de recapagem com garantia prolongada',
    'Follow-up: "Como foi sua viagem com os novos recapados?"'
  ],
  Indústria: [
    '“O custo da paragem inesperada é 10x maior que a manutenção”',
    'Plano de Estoque Gerido por Nós',
    'Demonstração de óleo de alta performance',
    'Contrato de fornecimento anual com desconto progressivo',
    'Visita técnica de verificação semestral'
  ],
  Agro: [
    '“Produtividade não espera: A importância das peças genuínas”',
    'Cronograma de manutenção pré-safra personalizado',
    'Kit de emergência para trabalho em campo',
    'Condições especiais de pagamento pós-colheita',
    'Check-up pós-safra para conservação de maquinário'
  ],
  Revenda: [
    '“Como girar seu estoque de pneus 30% mais rápido”',
    'Material de PDV gratuito para nossos lubrificantes',
    'Acesso ao portal B2B com estoque em tempo real',
    'Campanha de sell-out com prêmios para vendedores',
    'Treinamento de produto para equipe de balcão'
  ],
  'Autônomo': [
    '“Faça seu pneu render mais: Guia prático de calibragem”',
    'Simulador de Economia: Novo vs Recapado',
    'Cupom de desconto para a primeira troca do mês',
    'Indicação de parceiros para alinhamento e balanceamento',
    'Lembrete SMS: "Hora de verificar seus pneus para sua segurança"'
  ]
};
