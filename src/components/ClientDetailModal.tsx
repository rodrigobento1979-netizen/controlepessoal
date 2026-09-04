import React from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  CheckSquare, 
  Square, 
  Edit2, 
  Trash2, 
  Undo2, 
  Check,
  Building2,
  Tag,
  History,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { Client } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatYearMonth, 
  getClientStatusForMonth, 
  getDueDateForMonth, 
  isBillingIssuedForMonth 
} from '../utils/clientHelpers';

interface ClientDetailModalProps {
  isOpen: boolean;
  client: Client | null;
  selectedYearMonth: string;
  todayStr: string;
  onClose: () => void;
  onOpenPaymentModal: (client: Client) => void;
  onUndoPayment: (clientId: string, yearMonth: string) => void;
  onToggleBillingIssued: (clientId: string, yearMonth: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string, clientName: string) => void;
}

export default function ClientDetailModal({
  isOpen,
  client,
  selectedYearMonth,
  todayStr,
  onClose,
  onOpenPaymentModal,
  onUndoPayment,
  onToggleBillingIssued,
  onEditClient,
  onDeleteClient,
}: ClientDetailModalProps) {
  if (!isOpen || !client) return null;

  const currentStatus = getClientStatusForMonth(client, selectedYearMonth, todayStr);
  const customMonthPayment = client.paymentHistory?.find(p => p.yearMonth === selectedYearMonth);
  const isIssued = isBillingIssuedForMonth(client, selectedYearMonth);
  const calculatedDueStr = getDueDateForMonth(client.dueDateDay, selectedYearMonth);
  const formattedRealDueDate = formatDate(calculatedDueStr);

  return (
    <div 
      id="client-detail-modal-backdrop" 
      className="fixed inset-0 theme-modal-backdrop backdrop-blur-md flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 transition-all animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="client-detail-modal-card" 
        className="theme-modal rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastar no mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Cabeçalho do Modal */}
        <div className="px-5 sm:px-6 py-4 theme-modal-header flex justify-between items-start border-b shrink-0">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                client.contractType === 'recorrente'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}>
                {client.contractType === 'recorrente' ? 'RECORRENTE' : 'MENSAL'}
              </span>

              {client.status === 'inativo' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/25">
                  Inativo
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black theme-title leading-tight break-words">
              {client.name}
            </h3>
            <p className="text-xs theme-text-secondary mt-0.5">
              Referência: <strong className="theme-text-primary font-bold">{formatYearMonth(selectedYearMonth)}</strong>
            </p>
          </div>

          <button 
            type="button"
            id="close-client-detail-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-slate-500/10 theme-text-secondary hover:theme-title rounded-xl transition-colors cursor-pointer shrink-0"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Informações Detalhadas */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Card Principal de Status e Valor */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs"
            style={{ 
              backgroundColor: currentStatus === 'pago' 
                ? 'rgba(16, 185, 129, 0.08)' 
                : currentStatus === 'atrasado' 
                  ? 'rgba(244, 63, 94, 0.08)' 
                  : 'var(--baixa-bg)', 
              borderColor: currentStatus === 'pago' 
                ? 'rgba(16, 185, 129, 0.3)' 
                : currentStatus === 'atrasado' 
                  ? 'rgba(244, 63, 94, 0.3)' 
                  : 'var(--baixa-border)' 
            }}
          >
            <div>
              <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block">
                Valor do Contrato
              </span>
              <span className="text-xl sm:text-2xl font-black theme-title block mt-0.5">
                {formatCurrency(client.value)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block mb-1">
                Status no Mês
              </span>
              {currentStatus === 'pago' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-600 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Pago
                </span>
              ) : currentStatus === 'atrasado' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-rose-600 dark:text-rose-300 bg-rose-500/20 border border-rose-500/30">
                  <AlertCircle className="w-4 h-4" /> Atrasado
                </span>
              ) : currentStatus === 'pendente' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-amber-600 dark:text-amber-300 bg-amber-500/20 border border-amber-500/30">
                  <Clock className="w-4 h-4" /> Pendente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-500/20 border border-slate-500/30">
                  Sem faturamento
                </span>
              )}
            </div>
          </div>

          {/* Grade de Detalhes Operacionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Vencimento no Mês */}
            <div className="p-3.5 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block">
                  Vencimento
                </span>
                <p className="font-extrabold theme-title text-sm mt-0.5">
                  Dia {String(client.dueDateDay).padStart(2, '0')}
                </p>
                <p className="text-[11px] theme-text-secondary">
                  Data: <strong className="theme-text-primary">{formattedRealDueDate}</strong>
                </p>
              </div>
            </div>

            {/* Status da Cobrança */}
            <div className="p-3.5 rounded-xl border flex items-start justify-between gap-2" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block">
                    Cobrança Emitida
                  </span>
                  <p className="font-extrabold theme-title text-sm mt-0.5">
                    {isIssued ? 'Sim (Emitida)' : 'Não Emitida'}
                  </p>
                </div>
              </div>

              {currentStatus !== 'sem_cobranca' && (
                <button
                  type="button"
                  id="toggle-issued-modal-btn"
                  onClick={() => onToggleBillingIssued(client.id, selectedYearMonth)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0 ${
                    isIssued
                      ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Alternar status de emissão da fatura"
                >
                  {isIssued ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Último Pagamento */}
            <div className="p-3.5 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block">
                  Último Pagamento
                </span>
                <p className="font-bold theme-title text-sm mt-0.5">
                  {formatDate(client.lastPaymentDate)}
                </p>
                {customMonthPayment && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Pago neste mês: {formatDate(customMonthPayment.paymentDate)} ({formatCurrency(customMonthPayment.amount)})
                  </p>
                )}
              </div>
            </div>

            {/* Vigência / Período do Contrato */}
            <div className="p-3.5 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold theme-text-secondary uppercase tracking-wider block">
                  Período de Cobrança
                </span>
                <p className="text-xs theme-title font-bold mt-0.5">
                  {client.billingStartDate ? `Início: ${formatYearMonth(client.billingStartDate)}` : 'Sem restrição de início'}
                </p>
                {client.billingEndDate && (
                  <p className="text-[11px] theme-text-secondary">
                    Fim: {formatYearMonth(client.billingEndDate)}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Observações / Notas */}
          {client.notes ? (
            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Observações & Instruções</span>
              </div>
              <p className="theme-text-primary text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {client.notes}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed text-center text-xs theme-text-secondary" style={{ borderColor: 'var(--card-border)' }}>
              Nenhuma observação cadastrada para este cliente.
            </div>
          )}

        </div>

        {/* Rodapé com Ações Principais */}
        <div className="p-4 sm:p-6 border-t theme-modal-header flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          
          {/* Botões de Exclusão e Edição */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              id="modal-edit-client-btn"
              onClick={() => {
                onClose();
                onEditClient(client);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl theme-btn-secondary border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:text-indigo-400 active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              id="modal-delete-client-btn"
              onClick={() => {
                onClose();
                onDeleteClient(client.id, client.name);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>

          {/* Botão de Ação Financeira Primária (Dar Baixa / Estornar) */}
          <div className="w-full sm:w-auto">
            {currentStatus === 'pago' ? (
              <button
                type="button"
                id="modal-undo-pay-btn"
                onClick={() => {
                  onClose();
                  onUndoPayment(client.id, selectedYearMonth);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-amber-500/25 active:scale-95"
              >
                <Undo2 className="w-4 h-4" />
                <span>Estornar Pagamento</span>
              </button>
            ) : currentStatus === 'sem_cobranca' ? (
              <div className="text-xs theme-text-secondary text-center italic py-2">
                Fora do período contratual
              </div>
            ) : (
              <button
                type="button"
                id="modal-give-pay-btn"
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(client);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Dar Baixa (Receber)</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
