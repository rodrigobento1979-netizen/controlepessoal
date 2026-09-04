import React from 'react';
import { 
  Check, 
  Undo2, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CheckSquare, 
  Square, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { Client, ClientPaymentStatus } from '../types';

interface ClientCardProps {
  client: Client;
  selectedYearMonth: string;
  todayStr: string;
  onSelectDetail: (client: Client) => void;
  onOpenPayment: (client: Client) => void;
  onUndoPayment: (clientId: string, yearMonth: string) => void;
  onToggleIssued?: (clientId: string, yearMonth: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string, clientName: string) => void;
  getClientStatusForMonth: (client: Client, yearMonth: string, todayStr: string) => ClientPaymentStatus;
  isBillingIssuedForMonth?: (client: Client, yearMonth: string) => boolean;
  getDueDateForMonth: (day: number, yearMonth: string) => string;
  formatCurrency: (val: number) => string;
  formatDate: (val: string | null) => string;
  formatYearMonth: (val: string) => string;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  selectedYearMonth,
  todayStr,
  onSelectDetail,
  onOpenPayment,
  onUndoPayment,
  onToggleIssued,
  onEditClient,
  onDeleteClient,
  getClientStatusForMonth,
  isBillingIssuedForMonth,
  getDueDateForMonth,
  formatCurrency,
  formatDate,
}) => {
  const currentStatus = getClientStatusForMonth(client, selectedYearMonth, todayStr);
  const customMonthPayment = client.paymentHistory.find(p => p.yearMonth === selectedYearMonth);
  const isIssued = isBillingIssuedForMonth ? isBillingIssuedForMonth(client, selectedYearMonth) : false;
  
  const calculatedDueStr = getDueDateForMonth(client.dueDateDay, selectedYearMonth);
  const formattedRealDueDate = formatDate(calculatedDueStr);

  return (
    <>
      {/* CARD ULTRA-COMPACTO PARA MODO MOBILE (Telas < lg) */}
      <div 
        id={`mobile-client-card-${client.id}`}
        onClick={() => onSelectDetail(client)}
        className={`lg:hidden theme-card rounded-xl p-2.5 sm:p-3 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-2 shadow-xs border ${
          client.status === 'inativo' ? 'opacity-40' : ''
        } ${
          currentStatus === 'pago' 
            ? 'border-l-4 border-l-emerald-500' 
            : currentStatus === 'atrasado' 
              ? 'border-l-4 border-l-rose-500' 
              : currentStatus === 'pendente'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-slate-400'
        }`}
      >
        {/* Lado Esquerdo: Identificação Mínima do Cliente */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="font-extrabold text-xs sm:text-sm theme-title truncate">
              {client.name}
            </h4>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 tracking-wider ${
              client.contractType === 'recorrente' 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            }`}>
              {client.contractType === 'recorrente' ? 'RECORRENTE' : 'MENSAL'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] theme-text-secondary">
            <span>Venc: <strong className="theme-text-primary font-semibold">Dia {String(client.dueDateDay).padStart(2, '0')}</strong></span>
            <span className="theme-text-muted">•</span>
            <span>{formattedRealDueDate}</span>
          </div>
        </div>

        {/* Lado Direito: Check Cobrança + Valor + Status + Ação Rápida */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Botão de Cobrança Emitida no Mobile */}
          {currentStatus !== 'sem_cobranca' && onToggleIssued && (
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              <button
                type="button"
                id={`mobile-issued-btn-${client.id}`}
                onClick={() => onToggleIssued(client.id, selectedYearMonth)}
                className={`p-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1 active:scale-90 cursor-pointer ${
                  isIssued
                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    : 'text-slate-400 border-slate-300/60 dark:border-white/10 hover:border-indigo-400'
                }`}
                title={isIssued ? "Cobrança emitida (toque para desmarcar)" : "Toque para marcar cobrança como emitida"}
              >
                {isIssued ? (
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            </div>
          )}

          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black theme-title block leading-tight whitespace-nowrap">
              {formatCurrency(client.value)}
            </span>
            {currentStatus === 'pago' ? (
              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-extrabold text-emerald-500 whitespace-nowrap">
                <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> Pago
              </span>
            ) : currentStatus === 'atrasado' ? (
              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-extrabold text-rose-500 whitespace-nowrap">
                <AlertCircle className="w-2.5 h-2.5 shrink-0" /> Atrasado
              </span>
            ) : currentStatus === 'pendente' ? (
              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-extrabold text-amber-500 whitespace-nowrap">
                <Clock className="w-2.5 h-2.5 shrink-0" /> Pendente
              </span>
            ) : (
              <span className="text-[8.5px] text-slate-400 whitespace-nowrap">Sem fat.</span>
            )}
          </div>

          {/* Botão de Ação / Toque */}
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {currentStatus === 'pago' ? (
              <button
                type="button"
                onClick={() => onSelectDetail(client)}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:scale-95 cursor-pointer"
                title="Ver detalhes completos"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : currentStatus === 'sem_cobranca' ? (
              <button
                type="button"
                onClick={() => onSelectDetail(client)}
                className="p-1.5 rounded-lg theme-btn-secondary text-slate-400 cursor-pointer"
                title="Ver detalhes"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenPayment(client)}
                className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Dar baixa rápida"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Baixa</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* CARD EXPANDIDO / COMPLETO PARA DESKTOP (Telas lg+) */}
      <div 
        id={`client-row-${client.id}`}
        className={`hidden lg:flex theme-card rounded-xl p-3.5 transition-all duration-300 hover:scale-[1.002] flex-col lg:flex-row lg:items-center justify-between gap-3 ${
          client.status === 'inativo' ? 'opacity-40' : ''
        } ${
          currentStatus === 'pago' 
            ? 'border-l-4 border-l-emerald-500/80' 
            : currentStatus === 'atrasado' 
              ? 'border-l-4 border-l-rose-500/80' 
              : currentStatus === 'pendente' 
                ? 'border-l-4 border-l-amber-500/80' 
                : 'border-l-4 border-l-slate-400'
        }`}
      >
        
        {/* Dados Básicos Cliente */}
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 
              className="font-extrabold text-sm theme-title truncate cursor-pointer hover:text-indigo-400 transition-colors" 
              title="Clique para ver detalhes do cliente"
              onClick={() => onSelectDetail(client)}
            >
              {client.name}
            </h4>
            
            {/* Tipo de Contrato Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
              client.contractType === 'recorrente' 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            }`}>
              {client.contractType === 'recorrente' ? 'RECORRENTE' : 'MENSAL'}
            </span>

            {/* Inativo badge */}
            {client.status === 'inativo' && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold theme-btn-secondary">
                Inativo
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] theme-text-secondary">
            <span>Vencimento: <strong className="theme-text-primary font-bold">Dia {String(client.dueDateDay).padStart(2, '0')}</strong> ({formattedRealDueDate})</span>
            <span className="inline-block h-1 w-1 rounded-full bg-slate-400/20 hidden md:block"></span>
            <span>Último pagamento: <strong className="theme-text-primary font-semibold">{formatDate(client.lastPaymentDate)}</strong></span>
          </div>

          {/* Observações / Notas */}
          {client.notes && (
            <div 
              className="mt-1 theme-text-secondary text-[11px] rounded-lg p-2 border flex items-start gap-1.5 max-w-xl transition-all duration-300"
              style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}
            >
              <FileText className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
              <p className="italic leading-normal truncate-2-lines">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Informações Financeiras & Valor */}
        <div 
          className="flex flex-col sm:flex-row lg:items-center gap-3 sm:gap-4 lg:ml-3 border-t lg:border-t-0 pt-2 lg:pt-0 shrink-0 select-none transition-colors duration-300"
          style={{ borderColor: 'var(--card-border)' }}
        >
          
          {/* Cobrança Emitida Checkbox (Desktop) */}
          {currentStatus !== 'sem_cobranca' && onToggleIssued && (
            <button
              type="button"
              id={`issued-btn-${client.id}`}
              onClick={() => onToggleIssued(client.id, selectedYearMonth)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isIssued
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                  : 'theme-btn-secondary text-slate-400 hover:text-indigo-400'
              }`}
              title={isIssued ? "Cobrança marcada como emitida (clique para desmarcar)" : "Clique para marcar cobrança como emitida"}
            >
              {isIssued ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{isIssued ? 'Emitida' : 'Emitir'}</span>
            </button>
          )}

          {/* Valor cobrado */}
          <div className="min-w-[95px]">
            <span className="text-[9px] font-bold theme-text-secondary uppercase tracking-wider block">Valor Mensal</span>
            <span className="text-base font-black theme-title">{formatCurrency(client.value)}</span>
          </div>

          {/* status específico do mês selecionado */}
          <div className="min-w-[115px]">
            <span className="text-[9px] font-bold theme-text-secondary uppercase tracking-wider block mb-1">Status Pagamento</span>
            
            {currentStatus === 'pago' ? (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 w-max whitespace-nowrap">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Pago
                </span>
                {customMonthPayment && (
                  <span className="text-[9px] theme-text-secondary mt-0.5 font-medium whitespace-nowrap">
                    {formatDate(customMonthPayment.paymentDate)}
                    {customMonthPayment.amount !== client.value && ` (${formatCurrency(customMonthPayment.amount)})`}
                  </span>
                )}
              </div>
            ) : currentStatus === 'atrasado' ? (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-rose-600 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 w-max whitespace-nowrap">
                  <AlertCircle className="w-2.5 h-2.5" /> Atrasado
                </span>
                <span className="text-[9px] text-rose-600 dark:text-rose-450 font-semibold mt-0.5 whitespace-nowrap">
                  Venceu: {formattedRealDueDate}
                </span>
              </div>
            ) : currentStatus === 'pendente' ? (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-amber-600 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 w-max whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5" /> Pendente
                </span>
                <span className="text-[9px] theme-text-secondary mt-0.5 font-medium whitespace-nowrap">
                  Vence: {formattedRealDueDate}
                </span>
              </div>
            ) : currentStatus === 'sem_cobranca' ? (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-slate-400 bg-slate-500/10 border border-slate-500/15 w-max whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5 text-slate-400" /> Sem faturamento
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold theme-text-secondary bg-slate-500/10 border border-slate-400/20 w-max whitespace-nowrap">
                Sem cobrança
              </span>
            )}
          </div>

          {/* Botões de Ações Financeiras */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            {currentStatus === 'pago' ? (
              <button
                id={`undo-pay-btn-${client.id}`}
                onClick={() => onUndoPayment(client.id, selectedYearMonth)}
                className="px-3 py-2 theme-btn-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:border-indigo-400"
                title="Reverter confirmação de recebimento"
              >
                <Undo2 className="w-3.5 h-3.5" /> Estornar
              </button>
            ) : currentStatus === 'sem_cobranca' ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic select-none py-2 px-1">
                Contrato futuro
              </span>
            ) : (
              <button
                id={`pay-btn-${client.id}`}
                onClick={() => onOpenPayment(client)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Registrar recebimento"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Dar Baixa
              </button>
            )}

            {/* Ações de Edição e Exclusão */}
            <div 
              className="flex items-center gap-1 ml-1 border-l pl-2 transition-colors duration-300"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <button
                id={`edit-client-btn-${client.id}`}
                onClick={() => onEditClient(client)}
                className="p-1.5 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-lg theme-text-secondary hover:text-indigo-500 dark:hover:text-white transition-colors cursor-pointer"
                title="Editar contrato de cliente"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                id={`delete-client-btn-${client.id}`}
                onClick={() => onDeleteClient(client.id, client.name)}
                className="p-1.5 hover:bg-rose-500/10 rounded-lg theme-text-secondary hover:text-rose-500 transition-colors cursor-pointer"
                title="Excluir do sistema"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

