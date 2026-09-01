import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  ComposedChart, 
  Area 
} from 'recharts';
import { Client, Expense } from '../types';
import { formatCurrency, getClientStatusForMonth } from '../utils/clientHelpers';

interface DashboardViewProps {
  clients: Client[];
  expenses: Expense[];
  currentYear: number;
  onYearChange: (year: number) => void;
  theme: 'light' | 'dark';
}

const MONTHS_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function DashboardView({
  clients,
  expenses,
  currentYear,
  onYearChange,
  theme,
}: DashboardViewProps) {
  const [chartType, setChartType] = useState<'bar' | 'composed' | 'line'>('composed');

  // Processamento dos Dados Mensais do Ano Selecionado
  const monthlyData = useMemo(() => {
    return MONTHS_NAMES.map((monthName, idx) => {
      const monthNumStr = String(idx + 1).padStart(2, '0');
      const yearMonth = `${currentYear}-${monthNumStr}`;

      // Receitas Previstas (Clientes ativos com contrato para este mês)
      const expectedRevenue = clients
        .filter(c => c.status === 'ativo' && getClientStatusForMonth(c, yearMonth, `${currentYear}-12-31`) !== 'sem_cobranca')
        .reduce((sum, c) => sum + c.value, 0);

      // Receitas Efetivamente Recebidas (Soma de todos os pagamentos registrados para este ano-mês)
      const receivedRevenue = clients.flatMap(c => c.paymentHistory)
        .filter(p => p.yearMonth === yearMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      // Despesas do Mês
      const monthExpensesList = expenses.filter(e => e.yearMonth === yearMonth);
      const totalExpenses = monthExpensesList.reduce((sum, e) => sum + e.value, 0);
      const rodrigoExpenses = monthExpensesList.filter(e => (e.payer || 'Rodrigo') === 'Rodrigo').reduce((sum, e) => sum + e.value, 0);
      const aryadnerExpenses = monthExpensesList.filter(e => e.payer === 'Aryadner').reduce((sum, e) => sum + e.value, 0);

      // Saldo Líquido Operacional (Abate somente despesas do Rodrigo)
      const netProfit = receivedRevenue - rodrigoExpenses;

      // Margem de Lucro %
      const profitMargin = receivedRevenue > 0 ? (netProfit / receivedRevenue) * 100 : 0;

      return {
        month: MONTHS_SHORT[idx],
        fullMonth: monthName,
        yearMonth,
        receitaPrevista: expectedRevenue,
        receitaRecebida: receivedRevenue,
        despesas: totalExpenses,
        despesasRodrigo: rodrigoExpenses,
        despesasAryadner: aryadnerExpenses,
        saldoLiquido: netProfit,
        profitMargin: Math.round(profitMargin * 10) / 10,
      };
    });
  }, [clients, expenses, currentYear]);

  // Métricas Consolidadas do Ano
  const yearlyMetrics = useMemo(() => {
    const totalExpected = monthlyData.reduce((acc, curr) => acc + curr.receitaPrevista, 0);
    const totalReceived = monthlyData.reduce((acc, curr) => acc + curr.receitaRecebida, 0);
    const totalExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesas, 0);
    const totalRodrigoExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesasRodrigo, 0);
    const totalAryadnerExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesasAryadner, 0);
    const netProfit = totalReceived - totalRodrigoExpenses;

    const avgMonthlyReceived = totalReceived / 12;
    const avgMonthlyExpenses = totalExpenses / 12;

    const globalMargin = totalReceived > 0 ? (netProfit / totalReceived) * 100 : 0;

    // Encontrar o mês de maior faturamento
    const bestMonth = [...monthlyData].sort((a, b) => b.receitaRecebida - a.receitaRecebida)[0];

    return {
      totalExpected,
      totalReceived,
      totalExpenses,
      totalRodrigoExpenses,
      totalAryadnerExpenses,
      netProfit,
      avgMonthlyReceived,
      avgMonthlyExpenses,
      globalMargin: Math.round(globalMargin * 10) / 10,
      bestMonth,
    };
  }, [monthlyData]);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      
      {/* Topo do Dashboard - Seletor de Ano e Título */}
      <div className="theme-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 border border-indigo-500/20 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight theme-title flex items-center gap-2">
              Evolução Financeira Mensal
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Dashboard Anual
              </span>
            </h2>
            <p className="text-xs theme-text-secondary">
              Acompanhe o comparativo entre receitas recebidas, despesas operacionais e saldo líquido
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ANO */}
        <div className="flex items-center gap-2 border p-1 rounded-xl self-start md:self-auto shadow-xs" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
          <button
            onClick={() => onYearChange(currentYear - 1)}
            className="p-1.5 px-2.5 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-lg theme-text-secondary hover:text-indigo-500 dark:hover:text-white active:scale-95 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Ano Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Ano Anterior</span>
          </button>

          <span className="font-black theme-text-primary text-sm px-3 select-none min-w-[60px] text-center">
            {currentYear}
          </span>

          <button
            onClick={() => onYearChange(currentYear + 1)}
            className="p-1.5 px-2.5 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-lg theme-text-secondary hover:text-indigo-500 dark:hover:text-white active:scale-95 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Próximo Ano"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMO ANUAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Recebido no Ano */}
        <div className="theme-card rounded-xl p-3.5 flex items-center gap-3 shadow-sm border" style={{ borderColor: 'var(--card-border)' }}>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Receitas no Ano</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block truncate">
              {formatCurrency(yearlyMetrics.totalReceived)}
            </span>
            <span className="text-[10px] theme-text-muted block mt-0.5">
              Média: {formatCurrency(yearlyMetrics.avgMonthlyReceived)}/mês
            </span>
          </div>
        </div>

        {/* Card 2: Total Despesas no Ano com Detalhamento */}
        <div className="theme-card rounded-xl p-3.5 flex items-center gap-3 shadow-sm border" style={{ borderColor: 'var(--card-border)' }}>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 rounded-lg shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Despesas no Ano</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-450 block truncate">
              {formatCurrency(yearlyMetrics.totalExpenses)}
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-sky-600 dark:text-sky-400 font-semibold" title="Despesas pagas por Rodrigo (abatem do saldo)">
                Rodrigo: {formatCurrency(yearlyMetrics.totalRodrigoExpenses)}
              </span>
              <span className="theme-text-muted">•</span>
              <span className="text-pink-600 dark:text-pink-400 font-semibold" title="Despesas pagas por Aryadner (não abatem do saldo)">
                Aryadner: {formatCurrency(yearlyMetrics.totalAryadnerExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Saldo Líquido Operacional */}
        <div className="theme-card rounded-xl p-3.5 flex items-center gap-3 shadow-sm border" style={{ borderColor: 'var(--card-border)' }}>
          <div className={`p-2.5 rounded-lg border shrink-0 ${
            yearlyMetrics.netProfit >= 0
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Saldo Líquido</span>
            <span className={`text-lg font-black block truncate ${
              yearlyMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500 dark:text-amber-450'
            }`}>
              {formatCurrency(yearlyMetrics.netProfit)}
            </span>
            <span className="text-[10px] theme-text-muted block mt-0.5">
              Receitas − Desp. Rodrigo
            </span>
          </div>
        </div>

        {/* Card 4: Margem de Lucro Geral */}
        <div className="theme-card rounded-xl p-3.5 flex items-center gap-3 shadow-sm border" style={{ borderColor: 'var(--card-border)' }}>
          <div className="p-2.5 bg-violet-500/10 text-violet-500 dark:text-violet-400 border border-violet-500/20 rounded-lg shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold theme-text-secondary block uppercase tracking-wider">Margem Média</span>
            <span className="text-lg font-black theme-title block">
              {yearlyMetrics.globalMargin.toFixed(1)}%
            </span>
            <span className="text-[10px] theme-text-muted block mt-0.5">
              Melhor Mês: {yearlyMetrics.bestMonth ? yearlyMetrics.bestMonth.fullMonth : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO DO GRÁFICO PRINCIPAL */}
      <div className="theme-card rounded-xl p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
        
        {/* Cabeçalho do Gráfico com Seletor de Estilo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-extrabold theme-title">Gráfico Comparativo Mensal ({currentYear})</h3>
          </div>

          <div className="flex items-center gap-1 border p-0.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
            <button
              onClick={() => setChartType('composed')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'composed' ? 'bg-indigo-500 text-white font-bold' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Combinado
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-indigo-500 text-white font-bold' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-indigo-500 text-white font-bold' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Linhas
            </button>
          </div>
        </div>

        {/* CONTAINER DO RECHARTS */}
        <div className="w-full h-[320px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontWeight: 600,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="receitaRecebida" name="Receitas Recebidas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saldoLiquido" name="Saldo Líquido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="receitaRecebida" name="Receitas Recebidas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="saldoLiquido" name="Saldo Líquido" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : (
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="receitaRecebida" name="Receitas Recebidas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="despesas" name="Despesas Operacionais" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="saldoLiquido" name="Saldo Líquido" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELA DETALHADA MÊS A MÊS */}
      <div className="theme-card rounded-xl p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-extrabold theme-title">Detalhamento Mensal de Fluxo de Caixa ({currentYear})</h3>
          </div>
          <span className="text-[10px] theme-text-secondary">
            12 meses do ano de referência
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b theme-text-secondary text-[10px] uppercase font-bold tracking-wider" style={{ borderColor: 'var(--card-border)' }}>
                <th className="py-2 px-3">Mês</th>
                <th className="py-2 px-3">Previsão Contratual</th>
                <th className="py-2 px-3">Receitas Recebidas</th>
                <th className="py-2 px-3">Despesas</th>
                <th className="py-2 px-3">Resultado Líquido</th>
                <th className="py-2 px-3 text-right">Margem %</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--card-border)' }}>
              {monthlyData.map((row) => (
                <tr key={row.yearMonth} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-2.5 px-3 font-extrabold theme-title flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    {row.fullMonth}
                  </td>
                  <td className="py-2.5 px-3 theme-text-secondary">
                    {formatCurrency(row.receitaPrevista)}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCurrency(row.receitaRecebida)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-rose-600 dark:text-rose-450">
                      {formatCurrency(row.despesas)}
                    </div>
                    {(row.despesasRodrigo > 0 || row.despesasAryadner > 0) && (
                      <div className="text-[9px] theme-text-secondary flex items-center gap-1.5 mt-0.5">
                        <span className="text-sky-600 dark:text-sky-400" title="Pago por Rodrigo (abate do saldo)">R: {formatCurrency(row.despesasRodrigo)}</span>
                        {row.despesasAryadner > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-pink-600 dark:text-pink-400" title="Pago por Aryadner (não abate do saldo)">A: {formatCurrency(row.despesasAryadner)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={`py-2.5 px-3 font-extrabold ${
                    row.saldoLiquido >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500 dark:text-amber-450'
                  }`}>
                    {formatCurrency(row.saldoLiquido)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                      row.profitMargin >= 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.profitMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-black text-xs theme-title" style={{ borderColor: 'var(--card-border)' }}>
                <td className="py-3 px-3 uppercase tracking-wider">Total Acumulado</td>
                <td className="py-3 px-3">{formatCurrency(yearlyMetrics.totalExpected)}</td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(yearlyMetrics.totalReceived)}</td>
                <td className="py-3 px-3 text-rose-600 dark:text-rose-450">{formatCurrency(yearlyMetrics.totalExpenses)}</td>
                <td className={`py-3 px-3 ${yearlyMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                  {formatCurrency(yearlyMetrics.netProfit)}
                </td>
                <td className="py-3 px-3 text-right">{yearlyMetrics.globalMargin.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
