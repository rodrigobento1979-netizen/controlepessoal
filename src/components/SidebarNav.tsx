import React from 'react';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Cloud, 
  UserPlus, 
  Plus, 
  Settings, 
  FileJson, 
  ShieldCheck,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { AppTab } from '../types';

interface SidebarNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenNewClientModal: () => void;
  onOpenNewExpenseModal: () => void;
  onOpenSettingsModal: () => void;
  clientsCount: number;
  expensesCount: number;
}

export default function SidebarNav({
  activeTab,
  onSelectTab,
  onOpenNewClientModal,
  onOpenNewExpenseModal,
  onOpenSettingsModal,
  clientsCount,
  expensesCount,
}: SidebarNavProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
      
      {/* Título de Seção "AÇÕES PRINCIPAIS & AUDITORIA" igual à imagem */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider font-mono">
          Ações Principais & Gestão
        </span>
        <span className="text-[10px] theme-text-secondary font-semibold">
          Menu Rápido
        </span>
      </div>

      {/* Grid / Lista de Botões de Navegação Estilizados */}
      <div className="flex flex-col gap-2">
        
        {/* 1. Clientes & Mensalidades */}
        <button
          type="button"
          id="nav-tab-clients-btn"
          onClick={() => onSelectTab('clientes')}
          className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
            activeTab === 'clientes'
              ? 'bg-purple-500/15 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
              : 'theme-card hover:border-purple-500/30 hover:bg-purple-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'clientes'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-300 group-hover:bg-purple-500/20'
            }`}>
              <Users className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold theme-title group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  Clientes & Cobranças
                </h4>
              </div>
              <p className="text-[10px] theme-text-secondary">
                Mensalidades & Baixas
              </p>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-colors ${
            activeTab === 'clientes'
              ? 'bg-purple-200 dark:bg-purple-300 text-black border-purple-400 shadow-xs'
              : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20'
          }`}>
            {clientsCount} ativos
          </span>
        </button>

        {/* 2. Despesas & Saídas */}
        <button
          type="button"
          id="nav-tab-expenses-btn"
          onClick={() => onSelectTab('despesas')}
          className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
            activeTab === 'despesas'
              ? 'bg-rose-500/15 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
              : 'theme-card hover:border-rose-500/30 hover:bg-rose-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'despesas'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 group-hover:bg-rose-500/20'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold theme-title group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                  Despesas & Saídas
                </h4>
              </div>
              <p className="text-[10px] theme-text-secondary">
                Rodrigo & Aryadner
              </p>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-colors ${
            activeTab === 'despesas'
              ? 'bg-rose-200 dark:bg-rose-300 text-black border-rose-400 shadow-xs'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20'
          }`}>
            {expensesCount} itens
          </span>
        </button>

        {/* 3. Dashboard Financeiro */}
        <button
          type="button"
          id="nav-tab-dashboard-btn"
          onClick={() => onSelectTab('dashboard')}
          className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
            activeTab === 'dashboard'
              ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
              : 'theme-card hover:border-indigo-500/30 hover:bg-indigo-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-500/20'
            }`}>
              <BarChart3 className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold theme-title group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  Dashboard Anual
                </h4>
              </div>
              <p className="text-[10px] theme-text-secondary">
                DRE & Margem Lucro
              </p>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-indigo-200 dark:bg-indigo-300 text-black border-indigo-400 shadow-xs'
              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
          }`}>
            2026
          </span>
        </button>

        {/* 4. Sincronização Nuvem / Vercel */}
        <button
          type="button"
          id="nav-tab-sync-btn"
          onClick={() => onSelectTab('sync')}
          className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
            activeTab === 'sync'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
              : 'theme-card hover:border-emerald-500/30 hover:bg-emerald-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'sync'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 group-hover:bg-emerald-500/20'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold theme-title group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Sincronização Vercel
                </h4>
              </div>
              <p className="text-[10px] theme-text-secondary">
                Nuvem & Backup Local
              </p>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-1 transition-colors ${
            activeTab === 'sync'
              ? 'bg-emerald-200 dark:bg-emerald-300 text-black border-emerald-400 shadow-xs'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'sync' ? 'bg-black' : 'bg-emerald-500 animate-pulse'}`}></span>
            Vercel
          </span>
        </button>

      </div>

      {/* Ações Rápidas de Cadastro */}
      <div className="pt-2 border-t theme-card-border flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1 font-mono">
          Cadastros Rápidos
        </span>

        <button
          type="button"
          id="quick-add-client-sidebar-btn"
          onClick={onOpenNewClientModal}
          className="w-full text-left px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>

        <button
          type="button"
          id="quick-add-expense-sidebar-btn"
          onClick={onOpenNewExpenseModal}
          className="w-full text-left px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 theme-text-primary font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-rose-500" />
          <span>Lançar Nova Despesa</span>
        </button>

        <button
          type="button"
          id="quick-settings-sidebar-btn"
          onClick={onOpenSettingsModal}
          className="w-full text-left px-3 py-2 rounded-xl border theme-card-border hover:bg-slate-100 dark:hover:bg-white/5 theme-text-secondary hover:theme-text-primary text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer mt-1"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configurações & Banco</span>
        </button>
      </div>

    </aside>
  );
}
