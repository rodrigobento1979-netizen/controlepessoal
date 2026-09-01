import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Check } from 'lucide-react';
import { Client } from '../types';
import { formatCurrency } from '../utils/clientHelpers';

interface PaymentDialogModalProps {
  isOpen: boolean;
  client: Client | null;
  yearMonth: string;
  defaultTodayStr: string; // "YYYY-MM-DD" e.g. "2026-06-04"
  onClose: () => void;
  onConfirm: (clientId: string, yearMonth: string, paymentDate: string, amount: number) => void;
}

export default function PaymentDialogModal({
  isOpen,
  client,
  yearMonth,
  defaultTodayStr,
  onClose,
  onConfirm,
}: PaymentDialogModalProps) {
  const [paymentDate, setPaymentDate] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [errorModel, setErrorModel] = useState('');

  // Sincronizar dados iniciais quando modal abre
  useEffect(() => {
    if (client) {
      setPaymentDate(defaultTodayStr);
      setAmountStr(String(client.value));
      setErrorModel('');
    }
  }, [client, defaultTodayStr, isOpen]);

  if (!isOpen || !client) return null;

  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const parsedMonthName = monthNames[parseInt(month, 10) - 1];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amountStr);
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorModel('Insira um valor pago válido.');
      return;
    }

    if (!paymentDate) {
      setErrorModel('Selecione uma data de pagamento válida.');
      return;
    }

    onConfirm(client.id, yearMonth, paymentDate, finalAmount);
    onClose();
  };

  return (
    <div id="payment-modal-backdrop" className="fixed inset-0 theme-modal-backdrop backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in">
      <div 
        id="payment-modal-card" 
        className="theme-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="px-6 py-4 theme-modal-header flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300">
            <Check className="w-5 h-5 bg-indigo-500/10 p-1 rounded-full border border-indigo-500/20" />
            <h3 className="text-base font-bold theme-title">Registrar Recebimento</h3>
          </div>
          <button 
            id="close-payment-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-500/10 theme-text-secondary hover:theme-title rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
            <p className="text-[11px] font-bold theme-text-secondary uppercase tracking-wider">Cliente de Cobrança</p>
            <h4 className="text-sm font-black theme-title mt-0.5">{client.name}</h4>
            <div className="mt-2.5 flex justify-between text-xs theme-text-secondary border-t pt-2.5" style={{ borderColor: 'var(--baixa-border)' }}>
              <span>Referência: <strong className="theme-text-primary font-bold">{parsedMonthName} de {year}</strong></span>
              <span>Valor Padrão: <strong className="theme-text-primary font-bold">{formatCurrency(client.value)}</strong></span>
            </div>
          </div>

          {/* Valor Real Recebido */}
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Valor Recebido (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted text-sm font-bold">R$</span>
              <input
                id="payment-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                className="w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold transition-all placeholder-slate-400"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (errorModel) setErrorModel('');
                }}
              />
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Data do Pagamento *
            </label>
            <input
              id="payment-date-input"
              type="date"
              className="w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                if (errorModel) setErrorModel('');
              }}
            />
          </div>

          {errorModel && (
            <p className="text-xs text-rose-500 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{errorModel}</p>
          )}

          {/* Footer buttons */}
          <div className="pt-3.5 flex justify-end gap-3 theme-modal-footer -mx-6 -mb-6 p-4">
            <button
              id="cancel-payment-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 theme-btn-secondary rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="confirm-payment-btn"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
