import React from 'react';
import { 
  Users, Target, Settings as SettingsIcon, Search, Bell, Menu, Plus, Zap, 
  MessageCircle, BarChart3, TrendingUp, Calendar, Trash2, Save, X, RotateCcw, 
  LayoutGrid, List, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/Card';
import { ClientModal } from './components/ClientModal';
import { NurtureView } from './components/NurtureView';
import { SettingsView } from './components/SettingsView';
import { INITIAL_CLIENTS } from './mockData';
import { STAGES } from './constants';
import { Client, ViewMode } from './types';
import { calculateScore, assignTierFromScore } from './utils';

const App = () => {
  const [clients, setClients] = React.useState<Client[]>(INITIAL_CLIENTS);
  const [activeTab, setActiveTab] = React.useState<ViewMode>('Pipeline');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const newClient: Client = {
      id: 'new',
      name: '',
      contato: '',
      whatsapp: '',
      email: '',
      type: 'Frotista',
      size: 'Pequeno',
      pipelineStage: 0,
      ticketMedio: 0,
      frequencia: 1,
      score: 0,
      tier: 'D',
      ultimaInteracao: 'Lead recém-cadastrado',
      nurtureActive: false,
      nurtureStep: 0,
      notas: ''
    };
    setSelectedClient(newClient);
    setIsModalOpen(true);
  };

  const saveClient = (updated: Client) => {
    if (updated.id === 'new') {
      const newId = (Math.max(...clients.map(c => Number(c.id))) + 1).toString();
      setClients([...clients, { ...updated, id: newId }]);
    } else {
      setClients(clients.map(c => c.id === updated.id ? updated : c));
    }
    setIsModalOpen(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    setIsModalOpen(false);
  };

  const stats = [
    { label: 'Forecast', val: 'R$ 480k', icon: Sparkles, color: 'indigo' },
    { label: 'Atalhos Ativos', val: '12', icon: Zap, color: 'amber' },
    { label: 'Conversão', val: '24%', icon: TrendingUp, color: 'emerald' },
    { label: 'Total Leads', val: clients.length, icon: Users, color: 'slate' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-24 bg-white border-r border-slate-100 z-50 flex flex-col items-center py-10 shadow-sm">
        <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center mb-12 shadow-xl shadow-slate-200">
          <Zap className="text-white w-6 h-6 fill-amber-400 stroke-amber-400" />
        </div>
        
        <div className="flex-1 space-y-4">
          {(['Pipeline', 'Nutrição', 'Configurações'] as ViewMode[]).map(tab => {
            const icons = { Pipeline: LayoutGrid, Nutrição: Zap, Configurações: SettingsIcon };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative ${activeTab === tab ? 'bg-indigo-50 text-indigo-600 shadow-md border border-indigo-100' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
              >
                <Icon className={`w-6 h-6 ${activeTab === tab ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                {activeTab === tab && <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full" />}
                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] italic">
                  {tab}
                </div>
              </button>
            );
          })}
        </div>

        <button className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all mb-4" onClick={handleAddNew}>
          <Plus className="w-6 h-6 stroke-[3px]" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="pl-24 pt-10 min-h-screen">
        {/* Header Bar */}
        <header className="px-12 mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-1 uppercase tracking-tighter italic">Rocket CRM <span className="text-indigo-600">v4</span></h1>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">{activeTab} · Gestão Comercial Estratégica</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                placeholder="Buscar Lead ou Empresa..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-100 rounded-[1.5rem] py-3 pl-12 pr-6 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none w-80 shadow-sm italic uppercase placeholder:text-slate-200"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm italic uppercase">
                RH
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-12">
          {activeTab === 'Pipeline' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map(s => (
                  <div key={s.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:border-indigo-100 transition-all">
                    <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 group-hover:scale-110 transition-all shadow-sm`}>
                      <s.icon className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{s.label}</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {STAGES.filter(s => s.label !== 'Faturado').map((stage, idx) => {
                  const stageClients = filteredClients.filter(c => c.pipelineStage === idx);
                  return (
                    <div key={stage.label} className="space-y-6 flex flex-col min-h-[600px]">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: stage.color }} />
                          <div>
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">{stage.label}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stageClients.length} Leads</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black italic text-slate-300 uppercase">Step {idx + 1}</span>
                      </div>

                      <div className="flex-1 bg-slate-50/50 border border-slate-100/50 rounded-[3rem] p-4 flex flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                          {stageClients.map(client => (
                            <Card 
                              key={client.id} 
                              client={client} 
                              onClick={() => handleEditClient(client)} 
                            />
                          ))}
                        </AnimatePresence>
                        
                        {stageClients.length === 0 && (
                          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center grayscale opacity-20 group hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={handleAddNew}>
                            <Plus className="w-10 h-10 text-indigo-300 mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase italic">Arrastar p/ cá ou Adicionar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Nutrição' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <NurtureView clients={clients} onEditClient={handleEditClient} />
            </div>
          )}

          {activeTab === 'Configurações' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SettingsView />
            </div>
          )}
        </div>
      </main>

      {/* Client Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && selectedClient && (
          <ClientModal 
            client={selectedClient} 
            onClose={() => setIsModalOpen(false)} 
            onSave={saveClient}
            onDelete={deleteClient}
          />
        )}
      </AnimatePresence>

      {/* Interaction Feedback Portal (Fake toast system) */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-3 z-[1000]">
        <div className="bg-slate-900 border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 cursor-pointer hover:scale-105 transition-all">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sistema Online</p>
            <p className="text-xs font-bold italic tracking-tight">Rocket CRM: Copilot IA pronto para sugerir leads.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
