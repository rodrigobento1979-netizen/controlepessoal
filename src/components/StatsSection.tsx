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
    <div id="stats-section-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 relative z-10">
      
      {/* Total Clientes e Emissão */}
      <div id="stat-card-clients" className="theme-card rounded-xl p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-md min-h-[85px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Total Clientes</span>
            <span className="text-xl font-extrabold theme-title leading-tight">{totalClientsCount}</span>
          </div>
        </div>
        <div className="mt-2 pt-1 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--card-border)' }}>
          <span className="theme-text-secondary flex items-center gap-1">
            <FileCheck2 className="w-3 h-3 text-indigo-400" /> Cobranças emitidas:
          </span>
          <span className="font-extrabold text-indigo-500 dark:text-indigo-300">
            {typeof issuedChargesCount === 'number' && typeof billableClientsCount === 'number'
              ? `${issuedChargesCount}/${billableClientsCount}`
              : 'Ativos'}
          </span>
        </div>
      </div>

      {/* Faturamento Previsto */}
      <div id="stat-card-expected" className="theme-card rounded-xl p-3.5 flex items-center gap-3 hover:scale-[1.005] transition-all duration-300 shadow-md">
        <div className="p-2.5 bg-violet-500/10 text-violet-500 dark:text-violet-300 border border-violet-500/20 rounded-lg shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Previsão Mensal</span>
          <span className="text-xl font-extrabold theme-title leading-tight truncate block">{formatCurrency(expectedRevenue)}</span>
          <span className="text-[10px] theme-text-muted block mt-0.5">Soma de contratos</span>
        </div>
      </div>

      {/* Faturamento Recebido */}
      <div id="stat-card-received" className="theme-card rounded-xl p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-md min-h-[85px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Até Agora</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight truncate block">{formatCurrency(receivedRevenue)}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between items-center text-[10px] theme-text-secondary mb-0.5">
            <span>Progressão</span>
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
      <div id="stat-card-pending" className="theme-card rounded-xl p-3.5 flex flex-col justify-between hover:scale-[1.005] transition-all duration-300 shadow-md min-h-[85px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Pendente</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 leading-tight truncate block">{formatCurrency(pendingRevenue)}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between items-center text-[10px] theme-text-secondary mb-0.5">
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
