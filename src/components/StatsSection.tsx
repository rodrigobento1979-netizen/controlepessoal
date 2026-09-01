import { Users, DollarSign, CheckCircle2, AlertCircle, FileCheck2 } from 'lucide-react';
import { formatCurrency } from '../utils/clientHelpers';

interface StatsSectionProps {
  totalClientsCount: number;
  expectedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  paidPercentage: number;
  issuedChargesCount?: number;
  billableClientsCount?: number;
}

export default function StatsSection({
  totalClientsCount,
  expectedRevenue,
  receivedRevenue,
  pendingRevenue,
  paidPercentage,
  issuedChargesCount,
  billableClientsCount,
}: StatsSectionProps) {
  return (
    <div id="stats-section-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2.5 sm:mb-4 relative z-10">
      
      {/* Total Clientes e Emissão */}
      <div id="stat-card-clients" className="theme-card rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20 rounded-lg shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold theme-text-secondary block uppercase tracking-wider truncate">Clientes</span>
            <span className="text-base sm:text-xl font-extrabold theme-title leading-tight">{totalClientsCount}</span>
          </div>
        </div>
        <div className="mt-1.5 pt-1 border-t flex items-center justify-between text-[9px] sm:text-[10px]" style={{ borderColor: 'var(--card-border)' }}>
          <span className="theme-text-secondary flex items-center gap-1 truncate">
            <FileCheck2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 shrink-0" /> Emitidas:
          </span>
          <span className="font-extrabold text-indigo-500 dark:text-indigo-300 shrink-0">
            {typeof issuedChargesCount === 'number' && typeof billableClientsCount === 'number'
              ? `${issuedChargesCount}/${billableClientsCount}`
              : 'Ativos'}
          </span>
        </div>
      </div>

      {/* Faturamento Previsto */}
      <div id="stat-card-expected" className="theme-card rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-violet-500/10 text-violet-500 dark:text-violet-300 border border-violet-500/20 rounded-lg shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold theme-text-secondary block uppercase tracking-wider truncate">Previsão</span>
            <span className="text-base sm:text-xl font-extrabold theme-title leading-tight truncate block">{formatCurrency(expectedRevenue)}</span>
          </div>
        </div>
        <div className="mt-1.5 pt-1 border-t flex items-center justify-between text-[9px] sm:text-[10px]" style={{ borderColor: 'var(--card-border)' }}>
          <span className="theme-text-muted truncate">Contratos ativos</span>
          <span className="font-bold theme-text-secondary text-[9px]">100%</span>
        </div>
      </div>

      {/* Faturamento Recebido */}
      <div id="stat-card-received" className="theme-card rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold theme-text-secondary block uppercase tracking-wider truncate">Recebido</span>
            <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight truncate block">{formatCurrency(receivedRevenue)}</span>
          </div>
        </div>
        <div className="mt-1.5">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] theme-text-secondary mb-0.5">
            <span>Progresso</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{paidPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-emerald-500 dark:bg-emerald-400 h-1 rounded-full transition-all duration-500" 
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Faturamento Pendente */}
      <div id="stat-card-pending" className="theme-card rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold theme-text-secondary block uppercase tracking-wider truncate">Pendente</span>
            <span className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 leading-tight truncate block">{formatCurrency(pendingRevenue)}</span>
          </div>
        </div>
        <div className="mt-1.5">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] theme-text-secondary mb-0.5">
            <span>Aguardando</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{(100 - paidPercentage).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-amber-500 dark:bg-amber-450 h-1 rounded-full transition-all duration-500" 
              style={{ width: `${100 - paidPercentage}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
