import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, Tag, User, Plus } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: {
    id?: string;
    description: string;
    category: string;
    payer: 'Rodrigo' | 'Aryadner';
    value: number;
    paymentDate: string;
    yearMonth: string;
    notes?: string;
  }) => void;
  expenseToEdit: Expense | null;
  categories: string[];
  onOpenManageCategories: () => void;
  defaultYearMonth: string;
  todayStr: string;
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  categories,
  onOpenManageCategories,
  defaultYearMonth,
  todayStr,
}: ExpenseFormModalProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Geral');
  const [payer, setPayer] = useState<'Rodrigo' | 'Aryadner'>('Rodrigo');
  const [value, setValue] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayStr);
  const [yearMonth, setYearMonth] = useState(defaultYearMonth);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setCategory(expenseToEdit.category || categories[0] || 'Geral');
      setPayer(expenseToEdit.payer || 'Rodrigo');
      setValue(String(expenseToEdit.value));
      setPaymentDate(expenseToEdit.paymentDate || todayStr);
      setYearMonth(expenseToEdit.yearMonth || defaultYearMonth);
      setNotes(expenseToEdit.notes || '');
      setError('');
    } else {
      setDescription('');
      setCategory(categories[0] || 'Geral');
      setPayer('Rodrigo');
      setValue('');
      setPaymentDate(todayStr);
      setYearMonth(defaultYearMonth);
      setNotes('');
      setError('');
    }
  }, [expenseToEdit, isOpen, categories, defaultYearMonth, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Informe a descrição da despesa.');
      return;
    }
    const numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      setError('Insira um valor válido maior que zero.');
      return;
    }

    onSave({
      id: expenseToEdit?.id,
      description: description.trim(),
      category: category || categories[0] || 'Geral',
      payer,
      value: numValue,
      paymentDate: paymentDate || todayStr,
      yearMonth: yearMonth || defaultYearMonth,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div 
      id="expense-form-modal-backdrop" 
      className="fixed inset-0 theme-modal-backdrop backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4 transition-all animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="expense-form-modal-card" 
        className="theme-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Compacto */}
        <div className="px-4 py-3 theme-modal-header flex justify-between items-center border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold theme-title">
                {expenseToEdit ? 'Editar Despesa' : 'Lançar Nova Despesa'}
              </h3>
              <p className="text-[10px] theme-text-secondary">
                {expenseToEdit ? 'Atualize as informações da saída' : 'Preencha os dados da saída financeira'}
              </p>
            </div>
          </div>
          <button 
            id="close-expense-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário Compacto sem Rolagem */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
              Descrição da Despesa *
            </label>
            <input
              id="exp-input-desc"
              type="text"
              required
              placeholder="Ex: Servidor AWS, Anúncio Google, Aluguel..."
              className="w-full px-3 py-2 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          {/* Grid: Valor e Quem Pagou */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Valor */}
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted text-xs font-bold">R$</span>
                <input
                  id="exp-input-value"
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 theme-input rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            {/* Pagador: Rodrigo ou Aryadner */}
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
                Quem Pagou?
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPayer('Rodrigo')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    payer === 'Rodrigo'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'theme-text-secondary hover:text-sky-500'
                  }`}
                >
                  Rodrigo
                </button>
                <button
                  type="button"
                  onClick={() => setPayer('Aryadner')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    payer === 'Aryadner'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'theme-text-secondary hover:text-pink-500'
                  }`}
                >
                  Aryadner
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Categoria com Botão de Gerenciar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageCategories();
                }}
                className="text-[10px] text-indigo-500 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Gerenciar
              </button>
            </div>
            <select
              id="exp-select-category"
              className="w-full px-3 py-2 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Grid: Data de Pagamento e Mês de Referência */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
                Data do Pagamento *
              </label>
              <input
                id="exp-input-date"
                type="date"
                inputMode="numeric"
                required
                className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  if (e.target.value) {
                    const ym = e.target.value.substring(0, 7);
                    setYearMonth(ym);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
                Mês Referência
              </label>
              <input
                id="exp-input-yearmonth"
                type="month"
                inputMode="numeric"
                required
                className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1">
              Observações (Opcional)
            </label>
            <input
              id="exp-input-notes"
              type="text"
              placeholder="Ex: Pago no Pix, comprovante arquivado..."
              className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-normal focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex justify-end gap-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <button
              id="exp-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 theme-btn-secondary rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="exp-save-btn"
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {expenseToEdit ? 'Atualizar Despesa' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
