import React from 'react';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Cloud, 
  Database,
  Plus,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AppTab } from '../types';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenNewClientModal: () => void;
  onOpenNewExpenseModal: () => void;
  onQuickSync: () => void;
  isSyncing?: boolean;
  clientsCount: number;
  expensesCount: number;
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab,
  onOpenNewClientModal,
  onOpenNewExpenseModal,
  onQuickSync,
  isSyncing = false,
  clientsCount,
  expensesCount,
}: MobileBottomNavProps) {
  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="Navegação móvel"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-purple-500/20 px-2 py-1 shadow-2xl safe-area-bottom"
    >
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        
        {/* Aba 1: Clientes */}
        <button
          type="button"
          id="mobile-nav-clients-btn"
          onClick={() => onSelectTab('clientes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[42px] cursor-pointer ${
            activeTab === 'clientes'
              ? 'text-purple-400 bg-purple-500/15 font-bold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-2 text-[8px] font-black px-1 rounded-full bg-purple-600 text-white leading-tight">
              {clientsCount}
            </span>
          </div>
          <span className="text-[9px] mt-0.5 font-medium tracking-tight">Clientes</span>
        </button>

        {/* Aba 2: Despesas */}
        <button
          type="button"
          id="mobile-nav-expenses-btn"
          onClick={() => onSelectTab('despesas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[42px] cursor-pointer ${
            activeTab === 'despesas'
              ? 'text-rose-400 bg-rose-500/15 font-bold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CreditCard className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-2 text-[8px] font-black px-1 rounded-full bg-rose-600 text-white leading-tight">
              {expensesCount}
            </span>
          </div>
          <span className="text-[9px] mt-0.5 font-medium tracking-tight">Despesas</span>
        </button>

        {/* Botão Central: Ação Rápida / Novo Registro */}
        <div className="relative -top-1.5 flex items-center justify-center">
          <button
            type="button"
            id="mobile-nav-add-btn"
            onClick={() => {
              if (activeTab === 'despesas') {
                onOpenNewExpenseModal();
              } else {
                onOpenNewClientModal();
              }
            }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/40 border-2 border-slate-900 dark:border-slate-950 active:scale-95 transition-transform cursor-pointer"
            title={activeTab === 'despesas' ? 'Adicionar Despesa' : 'Adicionar Cliente'}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Aba 3: Relatório Anual */}
        <button
          type="button"
          id="mobile-nav-dashboard-btn"
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[42px] cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-indigo-400 bg-indigo-500/15 font-bold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span className="text-[9px] mt-0.5 font-medium tracking-tight">Anual</span>
        </button>

        {/* Aba 4: Banco Cloud Firestore */}
        <button
          type="button"
          id="mobile-nav-sync-btn"
          onClick={() => onSelectTab('sync')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[42px] cursor-pointer ${
            activeTab === 'sync'
              ? 'text-orange-400 bg-orange-500/15 font-bold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Database className={`w-4.5 h-4.5 ${isSyncing ? 'animate-bounce text-orange-400' : ''}`} />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-[9px] mt-0.5 font-medium tracking-tight">Banco</span>
        </button>

      </div>
    </nav>
  );
}
