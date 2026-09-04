import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Layers,
  CalendarDays,
  ArrowRightLeft,
  Filter
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
import { 
  formatCurrency, 
  formatDate, 
  getClientStatusForMonth, 
  getDueDateForMonth, 
  formatYearMonth,
  getRealCurrentYearMonth
} from '../utils/clientHelpers';

interface DashboardViewProps {
  clients: Client[];
  expenses: Expense[];
  currentYear: number;
  initialYearMonth?: string;
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

// Custom Tooltip para o Gráfico de Fluxo Diário
const CustomDailyTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (!data) return null;

  return (
    <div 
      className="p-3 rounded-xl border shadow-2xl text-xs space-y-2 min-w-[250px] max-w-xs backdrop-blur-md transition-all"
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderColor: 'var(--card-border, #e2e8f0)',
        color: 'var(--text-primary, #0f172a)'
      }}
    >
      <div className="border-b pb-1.5 flex items-center justify-between" style={{ borderColor: 'var(--card-border, #e2e8f0)' }}>
        <span className="font-extrabold text-xs">Dia {data.dateLabel}</span>
        <span className="text-[10px] opacity-75 font-mono">{data.dateStr}</span>
      </div>

      <div className="space-y-1">
        {data.previsaoRecebimento > 0 && (
          <div className="flex justify-between items-center text-amber-500 font-semibold text-[11px]">
            <span>Previsão (Contratos):</span>
            <span className="font-bold">{formatCurrency(data.previsaoRecebimento)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          <span>Recebimentos Pagos:</span>
          <span className="font-bold">+{formatCurrency(data.recebimentos)}</span>
        </div>

        <div className="flex justify-between items-center text-rose-500 font-semibold text-[11px]">
          <span>Despesas Pagas (Dia):</span>
          <span className="font-bold">-{formatCurrency(data.despesas)}</span>
        </div>

        {data.despesas > 0 && (
          <div className="pl-2 border-l border-slate-300 dark:border-slate-700 text-[10px] opacity-80 space-y-0.5">
            <div className="flex justify-between">
              <span>• Rodrigo (abate saldo):</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">-{formatCurrency(data.despesasRodrigo)}</span>
            </div>
            {data.despesasAryadner > 0 && (
              <div className="flex justify-between">
                <span>• Aryadner (só computar):</span>
                <span className="font-semibold text-pink-500">-{formatCurrency(data.despesasAryadner)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saldo Acumulado em destaque */}
      <div className="pt-2 border-t flex flex-col gap-0.5" style={{ borderColor: 'var(--card-border, #e2e8f0)' }}>
        <div className="flex justify-between items-center">
          <span className="font-black text-[11px]">Saldo Acumulado:</span>
          <span className={`font-black text-xs ${data.saldoAcumulado >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-rose-500'}`}>
            {formatCurrency(data.saldoAcumulado)}
          </span>
        </div>
        <p className="text-[9px] opacity-70 italic leading-tight">
          (Recebimentos - Despesas de Rodrigo acumulados até este dia)
        </p>
      </div>
    </div>
  );
};

export default function DashboardView({
  clients,
  expenses,
  currentYear,
  initialYearMonth,
  onYearChange,
  theme,
}: DashboardViewProps) {
  const currentRealYearMonth = getRealCurrentYearMonth();
  
  // Modo de visualização: 'monthly' (Fluxo por Data - padrão) ou 'yearly' (Anual 12 meses)
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  
  // Mês selecionado para o fluxo mensal por data
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialYearMonth || currentRealYearMonth
  );

  const [chartType, setChartType] = useState<'composed' | 'bar' | 'line'>('composed');

  // Parse do mês selecionado
  const [selYearStr, selMonthStr] = selectedMonth.split('-');
  const selYear = Number(selYearStr) || currentYear;
  const selMonthIndex = (Number(selMonthStr) || 1) - 1;

  // Navegação de mês
  const handlePrevMonth = () => {
    let y = selYear;
    let m = selMonthIndex - 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    const newMonthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
    if (y !== currentYear) onYearChange(y);
  };

  const handleNextMonth = () => {
    let y = selYear;
    let m = selMonthIndex + 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const newMonthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
    if (y !== currentYear) onYearChange(y);
  };

  const handleSetCurrentMonth = () => {
    setSelectedMonth(currentRealYearMonth);
    const realYear = Number(currentRealYearMonth.split('-')[0]);
    if (realYear !== currentYear) onYearChange(realYear);
  };

  // =========================================================================
  // 1. PROCESSAMENTO DE FLUXO DE CAIXA MENSAL POR DATA
  // =========================================================================
  const dailyFlowData = useMemo(() => {
    const year = selYear;
    const month = selMonthIndex;
    
    // Obter quantidade de dias do mês selecionado
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Estrutura diária
    interface DayBucket {
      dayNum: number;
      dateStr: string; // YYYY-MM-DD
      dateLabel: string; // DD/MM
      previsaoRecebimento: number; // Linha Laranja: Total de Previsão Contratual do Dia
      recebimentos: number;
      recebimentosPrevistos: number;
      despesas: number;
      despesasRodrigo: number;
      despesasAryadner: number;
      saldoDia: number;
      saldoAcumulado: number;
      detalhesPrevisao: { cliente: string; valor: number }[];
      detalhesRecebimentos: { cliente: string; valor: number; pago: boolean }[];
      detalhesDespesas: { descricao: string; valor: number; pagador: string }[];
    }

    const map = new Map<number, DayBucket>();

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPad = String(d).padStart(2, '0');
      const monthPad = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${monthPad}-${dayPad}`;
      const dateLabel = `${dayPad}/${monthPad}`;

      map.set(d, {
        dayNum: d,
        dateStr,
        dateLabel,
        previsaoRecebimento: 0,
        recebimentos: 0,
        recebimentosPrevistos: 0,
        despesas: 0,
        despesasRodrigo: 0,
        despesasAryadner: 0,
        saldoDia: 0,
        saldoAcumulado: 0,
        detalhesPrevisao: [],
        detalhesRecebimentos: [],
        detalhesDespesas: [],
      });
    }

    // 1. Processar Previsão Contratual por Dia de Vencimento (Linha Laranja)
    clients.forEach((client) => {
      const status = getClientStatusForMonth(client, selectedMonth, `${year}-12-31`);
      if (status !== 'sem_cobranca' && client.status === 'ativo') {
        const dueDay = client.dueDateDay > daysInMonth ? daysInMonth : client.dueDateDay;
        const bucket = map.get(dueDay);
        if (bucket) {
          bucket.previsaoRecebimento += client.value;
          bucket.detalhesPrevisao.push({
            cliente: client.name,
            valor: client.value,
          });
        }
      }
    });

    // 2. Processar Pagamentos Recebidos e Pagamentos Pendentes de Clientes no Mês
    clients.forEach((client) => {
      const payments = client.paymentHistory.filter((p) => p.yearMonth === selectedMonth);
      if (payments.length > 0) {
        payments.forEach((payment) => {
          // Obter dia do pagamento
          const payDateParts = payment.paymentDate.split('-');
          let payDay = parseInt(payDateParts[2], 10);
          if (isNaN(payDay) || payDay < 1 || payDay > daysInMonth) {
            payDay = client.dueDateDay > daysInMonth ? daysInMonth : client.dueDateDay;
          }

          const bucket = map.get(payDay);
          if (bucket) {
            bucket.recebimentos += payment.amount;
            bucket.detalhesRecebimentos.push({
              cliente: client.name,
              valor: payment.amount,
              pago: true,
            });
          }
        });
      } else {
        // Cliente ainda não pagou: adicionar como previsão pendente no dia de vencimento
        const status = getClientStatusForMonth(client, selectedMonth, `${year}-12-31`);
        if (status !== 'sem_cobranca' && client.status === 'ativo') {
          const dueDay = client.dueDateDay > daysInMonth ? daysInMonth : client.dueDateDay;
          const bucket = map.get(dueDay);
          if (bucket) {
            bucket.recebimentosPrevistos += client.value;
            bucket.detalhesRecebimentos.push({
              cliente: client.name,
              valor: client.value,
              pago: false,
            });
          }
        }
      }
    });

    // 3. Processar Despesas do Mês
    const monthExpenses = expenses.filter((e) => e.yearMonth === selectedMonth);
    monthExpenses.forEach((exp) => {
      let expDay = 1;
      if (exp.paymentDate) {
        const parts = exp.paymentDate.split('-');
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= daysInMonth) {
          expDay = parsed;
        }
      }
      const bucket = map.get(expDay);
      if (bucket) {
        bucket.despesas += exp.value;
        const payer = exp.payer || 'Rodrigo';
        if (payer === 'Rodrigo') {
          bucket.despesasRodrigo += exp.value;
        } else {
          bucket.despesasAryadner += exp.value;
        }
        bucket.detalhesDespesas.push({
          descricao: exp.description,
          valor: exp.value,
          pagador: payer,
        });
      }
    });

    // 4. Calcular Saldo do Dia e Saldo Acumulado
    let accumulated = 0;
    const resultList: DayBucket[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const bucket = map.get(d)!;
      // Saldo diário = Recebimentos confirmados - Despesas pagas por Rodrigo
      bucket.saldoDia = bucket.recebimentos - bucket.despesasRodrigo;
      accumulated += bucket.saldoDia;
      bucket.saldoAcumulado = accumulated;
      resultList.push(bucket);
    }

    return resultList;
  }, [clients, expenses, selectedMonth, selYear, selMonthIndex]);

  // Métricas do Mês Selecionado
  const monthMetrics = useMemo(() => {
    const totalPrevisao = dailyFlowData.reduce((acc, d) => acc + d.previsaoRecebimento, 0);
    const totalReceived = dailyFlowData.reduce((acc, d) => acc + d.recebimentos, 0);
    const totalPending = dailyFlowData.reduce((acc, d) => acc + d.recebimentosPrevistos, 0);
    const totalExpected = totalPrevisao > 0 ? totalPrevisao : (totalReceived + totalPending);
    const totalExpenses = dailyFlowData.reduce((acc, d) => acc + d.despesas, 0);
    const totalRodrigoExpenses = dailyFlowData.reduce((acc, d) => acc + d.despesasRodrigo, 0);
    const totalAryadnerExpenses = dailyFlowData.reduce((acc, d) => acc + d.despesasAryadner, 0);
    const netProfit = totalReceived - totalRodrigoExpenses;
    const finalBalance = dailyFlowData.length > 0 ? dailyFlowData[dailyFlowData.length - 1].saldoAcumulado : 0;
    const margin = totalReceived > 0 ? (netProfit / totalReceived) * 100 : 0;

    // Dias com movimentação (para tabela filtrada)
    const daysWithMovement = dailyFlowData.filter(
      (d) => d.previsaoRecebimento > 0 || d.recebimentos > 0 || d.despesas > 0 || d.recebimentosPrevistos > 0
    );

    return {
      totalPrevisao,
      totalReceived,
      totalPending,
      totalExpected,
      totalExpenses,
      totalRodrigoExpenses,
      totalAryadnerExpenses,
      netProfit,
      finalBalance,
      margin: Math.round(margin * 10) / 10,
      daysWithMovement,
    };
  }, [dailyFlowData]);

  // =========================================================================
  // 2. PROCESSAMENTO DE DADOS ANUAIS (12 MESES CONSOLIDADOS)
  // =========================================================================
  const monthlyData = useMemo(() => {
    return MONTHS_NAMES.map((monthName, idx) => {
      const monthNumStr = String(idx + 1).padStart(2, '0');
      const yearMonth = `${currentYear}-${monthNumStr}`;

      const expectedRevenue = clients
        .filter(c => c.status === 'ativo' && getClientStatusForMonth(c, yearMonth, `${currentYear}-12-31`) !== 'sem_cobranca')
        .reduce((sum, c) => sum + c.value, 0);

      const receivedRevenue = clients.flatMap(c => c.paymentHistory)
        .filter(p => p.yearMonth === yearMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExpensesList = expenses.filter(e => e.yearMonth === yearMonth);
      const totalExpenses = monthExpensesList.reduce((sum, e) => sum + e.value, 0);
      const rodrigoExpenses = monthExpensesList.filter(e => (e.payer || 'Rodrigo') === 'Rodrigo').reduce((sum, e) => sum + e.value, 0);
      const aryadnerExpenses = monthExpensesList.filter(e => e.payer === 'Aryadner').reduce((sum, e) => sum + e.value, 0);

      const netProfit = receivedRevenue - rodrigoExpenses;
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

  const yearlyMetrics = useMemo(() => {
    const totalExpected = monthlyData.reduce((acc, curr) => acc + curr.receitaPrevista, 0);
    const totalReceived = monthlyData.reduce((acc, curr) => acc + curr.receitaRecebida, 0);
    const totalExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesas, 0);
    const totalRodrigoExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesasRodrigo, 0);
    const totalAryadnerExpenses = monthlyData.reduce((acc, curr) => acc + curr.despesasAryadner, 0);
    const netProfit = totalReceived - totalRodrigoExpenses;
    const globalMargin = totalReceived > 0 ? (netProfit / totalReceived) * 100 : 0;

    return {
      totalExpected,
      totalReceived,
      totalExpenses,
      totalRodrigoExpenses,
      totalAryadnerExpenses,
      netProfit,
      globalMargin: Math.round(globalMargin * 10) / 10,
    };
  }, [monthlyData]);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      
      {/* CABEÇALHO DO DASHBOARD COM COMUTAÇÃO MENSAL / ANUAL */}
      <div className="theme-card rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm border" style={{ borderColor: 'var(--card-border)' }}>
        
        {/* Título e Descrição */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 border border-indigo-500/20 rounded-xl shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold tracking-tight theme-title">
                {viewMode === 'monthly' ? 'Fluxo de Caixa Mensal por Data' : 'Evolução Financeira Anual'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                {viewMode === 'monthly' ? formatYearMonth(selectedMonth) : `Ano ${currentYear}`}
              </span>
            </div>
            <p className="text-xs theme-text-secondary mt-0.5">
              {viewMode === 'monthly' 
                ? 'Acompanhamento diário: previsão contratual (linha laranja), recebimentos confirmados e saídas'
                : 'Comparativo consolidado dos 12 meses do ano entre previsão, recebimentos, despesas e margens'}
            </p>
          </div>
        </div>

        {/* COMUTADOR DE MODO E SELETOR DE PERÍODO */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Botões de Alternância: Mês (Fluxo por Data) vs Ano */}
          <div className="flex p-0.5 rounded-xl border" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
            <button
              id="view-mode-monthly-btn"
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'monthly'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Mensal (por Data)</span>
            </button>

            <button
              id="view-mode-yearly-btn"
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'yearly'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visão Anual</span>
            </button>
          </div>

          {/* Navegação de Mês ou Ano dependendo do modo */}
          {viewMode === 'monthly' ? (
            <div className="flex items-center gap-1 border p-1 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
              <button
                type="button"
                id="dash-prev-month-btn"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-400/10 theme-text-secondary hover:text-indigo-400 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black theme-title px-2 min-w-[95px] text-center select-none">
                {MONTHS_SHORT[selMonthIndex]} / {selYear}
              </span>

              <button
                type="button"
                id="dash-next-month-btn"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-400/10 theme-text-secondary hover:text-indigo-400 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Botão Atalho para Mês Atual */}
              {selectedMonth !== currentRealYearMonth && (
                <button
                  type="button"
                  id="dash-current-month-btn"
                  onClick={handleSetCurrentMonth}
                  className="px-2 py-1 ml-1 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/25 transition-all cursor-pointer"
                  title="Ir para o mês atual"
                >
                  Mês Atual
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 border p-1 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
              <button
                type="button"
                id="dash-prev-year-btn"
                onClick={() => onYearChange(currentYear - 1)}
                className="p-1 rounded-lg hover:bg-slate-400/10 theme-text-secondary hover:text-indigo-400 transition-colors cursor-pointer"
                title="Ano Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black theme-title px-2 min-w-[50px] text-center select-none">
                {currentYear}
              </span>

              <button
                type="button"
                id="dash-next-year-btn"
                onClick={() => onYearChange(currentYear + 1)}
                className="p-1 rounded-lg hover:bg-slate-400/10 theme-text-secondary hover:text-indigo-400 transition-colors cursor-pointer"
                title="Próximo Ano"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* CARDS DE RESUMO (Adaptam ao modo Mensal ou Anual) */}
      {viewMode === 'monthly' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Previsão Total vs Recebidos */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">Previsão Contratual</span>
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-orange-500 dark:text-orange-400">
                {formatCurrency(monthMetrics.totalExpected)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                Linha Laranja no gráfico
              </span>
            </div>
          </div>

          {/* Card 2: Recebidos no Mês */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Recebidos no Mês</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-emerald-600 dark:text-emerald-400">
                {formatCurrency(monthMetrics.totalReceived)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                {monthMetrics.totalPending > 0 ? `+ ${formatCurrency(monthMetrics.totalPending)} pendente` : '100% recebido'}
              </span>
            </div>
          </div>

          {/* Card 3: Despesas Pagas no Mês */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Despesas do Mês</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-rose-600 dark:text-rose-450">
                {formatCurrency(monthMetrics.totalExpenses)}
              </span>
              <div className="flex items-center gap-1.5 text-[9px] theme-text-secondary mt-0.5 font-medium">
                <span className="text-sky-600 dark:text-sky-400" title="Abate do saldo">R: {formatCurrency(monthMetrics.totalRodrigoExpenses)}</span>
                {monthMetrics.totalAryadnerExpenses > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-pink-600 dark:text-pink-400" title="Pago por Aryadner">A: {formatCurrency(monthMetrics.totalAryadnerExpenses)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Saldo Líquido do Mês */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Resultado Líquido</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-base sm:text-lg font-black block ${monthMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                {formatCurrency(monthMetrics.netProfit)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                Margem: {monthMetrics.margin}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Previsão Total no Ano */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">Previsão Anual</span>
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-orange-500 dark:text-orange-400">
                {formatCurrency(yearlyMetrics.totalExpected)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                12 meses contratados
              </span>
            </div>
          </div>

          {/* Card 2: Total Recebido no Ano */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Recebido ({currentYear})</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-emerald-600 dark:text-emerald-400">
                {formatCurrency(yearlyMetrics.totalReceived)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                Efetivamente pago
              </span>
            </div>
          </div>

          {/* Card 3: Total Despesas no Ano */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Despesas ({currentYear})</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-lg font-black theme-title block text-rose-600 dark:text-rose-450">
                {formatCurrency(yearlyMetrics.totalExpenses)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                Rodrigo: {formatCurrency(yearlyMetrics.totalRodrigoExpenses)}
              </span>
            </div>
          </div>

          {/* Card 4: Lucro Líquido no Ano */}
          <div className="theme-card rounded-xl p-3.5 border shadow-xs flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Lucro Líquido Acumulado</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-base sm:text-lg font-black block ${yearlyMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                {formatCurrency(yearlyMetrics.netProfit)}
              </span>
              <span className="text-[10px] theme-text-secondary font-medium">
                Margem: {yearlyMetrics.globalMargin}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DO GRÁFICO */}
      <div className="theme-card rounded-xl p-3.5 sm:p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
        
        {/* Controles do Gráfico */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <h3 className="text-xs font-extrabold theme-title flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {viewMode === 'monthly' 
                ? `Fluxo de Caixa Diário — Previsão vs Recebimentos (${formatYearMonth(selectedMonth)})`
                : `Comparativo Mensal de Receitas vs Despesas (${currentYear})`}
            </h3>
            <p className="text-[10px] theme-text-secondary mt-0.5">
              {viewMode === 'monthly'
                ? 'Eixo horizontal com os dias do mês: Linha Laranja (Previsão Contratual), Barras Verdes (Recebimentos Pagos) e Vermelhas (Despesas)'
                : 'Visão histórica dos 12 meses: Linha Laranja (Previsão), Barras Verdes (Recebimentos) e Linha Azul (Resultado Líquido)'}
            </p>
          </div>

          {/* Seletor de Tipo de Gráfico */}
          <div className="flex items-center gap-1 border p-0.5 rounded-lg self-start sm:self-auto" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
            <button
              type="button"
              onClick={() => setChartType('composed')}
              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                chartType === 'composed' ? 'bg-indigo-500 text-white' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Misto
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                chartType === 'bar' ? 'bg-indigo-500 text-white' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Barras
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                chartType === 'line' ? 'bg-indigo-500 text-white' : 'theme-text-secondary hover:text-indigo-400'
              }`}
            >
              Linhas
            </button>
          </div>
        </div>

        {/* CONTAINER DO RECHARTS */}
        <div className="w-full h-[320px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'monthly' ? (
              // GRÁFICO DO MODO MENSAL (POR DATA)
              chartType === 'bar' ? (
                <BarChart data={dailyFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                  <XAxis dataKey="dayNum" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} tickFormatter={(val) => `${val}`} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="previsaoRecebimento" name="Previsão de Recebimento" fill="#f97316" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="recebimentos" name="Recebimentos Pagos" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas Pagas" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saldoAcumulado" name="Saldo Acumulado (Rodrigo)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={dailyFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                  <XAxis dataKey="dayNum" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="previsaoRecebimento" name="Previsão de Recebimento" stroke="#f97316" strokeWidth={3} dot={{ r: 3.5, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="recebimentos" name="Recebimentos Pagos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="despesas" name="Despesas Pagas" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado (Rodrigo)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <ComposedChart data={dailyFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={theme === 'dark' ? 0.1 : 0.2} />
                  <XAxis dataKey="dayNum" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} tickFormatter={(val) => `${val}`} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickFormatter={(val) => `R${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="recebimentos" name="Recebimentos Pagos" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                  <Bar dataKey="despesas" name="Despesas Pagas" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={12} />
                  <Line type="monotone" dataKey="previsaoRecebimento" name="Previsão de Recebimento" stroke="#f97316" strokeWidth={2.8} dot={{ r: 3.5, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado (Rodrigo)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 2 }} />
                </ComposedChart>
              )
            ) : (
              // GRÁFICO DO MODO ANUAL (12 MESES)
              chartType === 'bar' ? (
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
                  <Bar dataKey="receitaPrevista" name="Previsão de Recebimento" fill="#f97316" radius={[4, 4, 0, 0]} />
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
                  <Line type="monotone" dataKey="receitaPrevista" name="Previsão de Recebimento" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
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
                  <Line type="monotone" dataKey="receitaPrevista" name="Previsão de Recebimento" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="saldoLiquido" name="Saldo Líquido" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              )
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELA DETALHADA: DIÁRIA (MODO MENSAL) OU MÊS A MÊS (MODO ANUAL) */}
      <div className="theme-card rounded-xl p-3.5 sm:p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-extrabold theme-title">
              {viewMode === 'monthly'
                ? `Movimentações Diárias — ${formatYearMonth(selectedMonth)}`
                : `Detalhamento Mensal de Fluxo de Caixa (${currentYear})`}
            </h3>
          </div>
          <span className="text-[10px] theme-text-secondary">
            {viewMode === 'monthly' ? `${dailyFlowData.length} dias do mês` : '12 meses do ano'}
          </span>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'monthly' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b theme-text-secondary text-[10px] uppercase font-bold tracking-wider" style={{ borderColor: 'var(--card-border)' }}>
                  <th className="py-2 px-2.5">Data</th>
                  <th className="py-2 px-2.5 text-orange-500">Previsão Contratual</th>
                  <th className="py-2 px-2.5 text-emerald-500">Recebimentos Efetivados</th>
                  <th className="py-2 px-2.5 text-rose-500">Despesas Pagas</th>
                  <th className="py-2 px-2.5">Saldo do Dia</th>
                  <th className="py-2 px-2.5 text-right">Saldo Acumulado (Rodrigo)</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium" style={{ borderColor: 'var(--card-border)' }}>
                {monthMetrics.daysWithMovement.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs theme-text-secondary italic">
                      Nenhuma movimentação ou previsão registrada para este mês.
                    </td>
                  </tr>
                ) : (
                  monthMetrics.daysWithMovement.map((row) => (
                    <tr key={row.dayNum} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-2.5 px-2.5 font-extrabold theme-title flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Dia {String(row.dayNum).padStart(2, '0')} ({row.dateLabel})
                      </td>

                      {/* Previsão de Recebimento do Dia (Linha Laranja) */}
                      <td className="py-2.5 px-2.5">
                        {row.previsaoRecebimento > 0 ? (
                          <div>
                            <span className="text-orange-500 dark:text-orange-400 font-extrabold">
                              {formatCurrency(row.previsaoRecebimento)}
                            </span>
                            <div className="text-[9px] theme-text-secondary truncate max-w-[170px]" title={row.detalhesPrevisao.map(d => `${d.cliente}: ${formatCurrency(d.valor)}`).join('\n')}>
                              {row.detalhesPrevisao.map(d => d.cliente).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Recebimentos Pagos */}
                      <td className="py-2.5 px-2.5">
                        {row.recebimentos > 0 ? (
                          <div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatCurrency(row.recebimentos)}
                            </span>
                            <div className="text-[9px] theme-text-secondary truncate max-w-[170px]">
                              {row.detalhesRecebimentos.filter(d => d.pago).map(d => d.cliente).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Despesas */}
                      <td className="py-2.5 px-2.5">
                        {row.despesas > 0 ? (
                          <div>
                            <span className="text-rose-600 dark:text-rose-450 font-bold">
                              {formatCurrency(row.despesas)}
                            </span>
                            <div className="text-[9px] theme-text-secondary truncate max-w-[170px]">
                              {row.detalhesDespesas.map(d => `${d.descricao} (${d.pagador[0]})`).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Saldo do Dia */}
                      <td className={`py-2.5 px-2.5 font-bold ${
                        row.saldoDia > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.saldoDia < 0 ? 'text-rose-500' : 'theme-text-secondary'
                      }`}>
                        {row.saldoDia !== 0 ? formatCurrency(row.saldoDia) : 'R$ 0,00'}
                      </td>

                      {/* Saldo Acumulado */}
                      <td className={`py-2.5 px-2.5 text-right font-black ${
                        row.saldoAcumulado >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'
                      }`}>
                        {formatCurrency(row.saldoAcumulado)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-black text-xs theme-title" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="py-3 px-2.5 uppercase tracking-wider">Total do Mês</td>
                  <td className="py-3 px-2.5 text-orange-500 dark:text-orange-400">{formatCurrency(monthMetrics.totalExpected)}</td>
                  <td className="py-3 px-2.5 text-emerald-600 dark:text-emerald-400">{formatCurrency(monthMetrics.totalReceived)}</td>
                  <td className="py-3 px-2.5 text-rose-600 dark:text-rose-450">{formatCurrency(monthMetrics.totalExpenses)}</td>
                  <td className={`py-3 px-2.5 ${monthMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                    {formatCurrency(monthMetrics.netProfit)}
                  </td>
                  <td className={`py-3 px-2.5 text-right ${monthMetrics.finalBalance >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                    {formatCurrency(monthMetrics.finalBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b theme-text-secondary text-[10px] uppercase font-bold tracking-wider" style={{ borderColor: 'var(--card-border)' }}>
                  <th className="py-2 px-3">Mês</th>
                  <th className="py-2 px-3 text-orange-500">Previsão Contratual</th>
                  <th className="py-2 px-3 text-emerald-500">Receitas Recebidas</th>
                  <th className="py-2 px-3 text-rose-500">Despesas</th>
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
                    <td className="py-2.5 px-3 text-orange-500 dark:text-orange-400 font-bold">
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
                  <td className="py-3 px-3 text-orange-500 dark:text-orange-400">{formatCurrency(yearlyMetrics.totalExpected)}</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(yearlyMetrics.totalReceived)}</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-450">{formatCurrency(yearlyMetrics.totalExpenses)}</td>
                  <td className={`py-3 px-3 ${yearlyMetrics.netProfit >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500'}`}>
                    {formatCurrency(yearlyMetrics.netProfit)}
                  </td>
                  <td className="py-3 px-3 text-right">{yearlyMetrics.globalMargin.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
