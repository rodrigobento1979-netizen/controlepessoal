import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Calendar, FileText } from 'lucide-react';
import { Client } from '../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt' | 'paymentHistory'> & { id?: string }) => void;
  clientToEdit: Client | null;
}

export default function ClientFormModal({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [dueDateDay, setDueDateDay] = useState(10);
  const [value, setValue] = useState<string>('');
  const [contractType, setContractType] = useState<'recorrente' | 'mensal'>('recorrente');
  const [notes, setNotes] = useState('');
  const [billingStartDate, setBillingStartDate] = useState('');
  const [billingEndDate, setBillingEndDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Carregar os dados se for edição
  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setDueDateDay(clientToEdit.dueDateDay);
      setValue(String(clientToEdit.value));
      setContractType(clientToEdit.contractType);
      setNotes(clientToEdit.notes || '');
      setBillingStartDate(clientToEdit.billingStartDate || '');
      setBillingEndDate(clientToEdit.billingEndDate || '');
      setErrors({});
    } else {
      // Valor padrão para novo cliente
      setName('');
      setDueDateDay(10);
      setValue('');
      setContractType('recorrente');
      setNotes('');
      setBillingStartDate('');
      setBillingEndDate('');
      setErrors({});
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'O nome do cliente é obrigatório.';
    }

    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue) || numericValue <= 0) {
      newErrors.value = 'Insira um valor de contrato válido (maior que zero).';
    }

    const numericDay = Number(dueDateDay);
    if (isNaN(numericDay) || numericDay < 1 || numericDay > 31) {
      newErrors.dueDateDay = 'O dia de vencimento deve ser entre 1 e 31.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: clientToEdit?.id,
      name: name.trim(),
      dueDateDay: Number(dueDateDay),
      value: numericValue,
      contractType,
      notes: notes.trim(),
      status: clientToEdit ? clientToEdit.status : 'ativo',
      billingStartDate: billingStartDate || undefined,
      billingEndDate: billingEndDate || undefined,
    });
    
    onClose();
  };

  return (
    <div id="client-form-modal-backdrop" className="fixed inset-0 theme-modal-backdrop backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4 transition-all animate-fade-in" onClick={onClose}>
      <div 
        id="client-form-modal-card" 
        className="theme-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Compacto */}
        <div className="px-4 py-2.5 theme-modal-header flex justify-between items-center border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <h3 className="text-sm font-bold theme-title">
              {clientToEdit ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </h3>
            <p className="text-[10px] theme-text-secondary">
              {clientToEdit ? 'Altere os dados de faturamento' : 'Adicione um novo cliente e vencimento'}
            </p>
          </div>
          <button 
            id="close-form-modal"
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-500/10 theme-text-secondary hover:theme-title rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content / Form Compacto */}
        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs">
          
          {/* Nome */}
          <div>
            <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
              <User className="w-3 h-3 text-indigo-500" /> Nome Completo / Empresa *
            </label>
            <input
              id="input-name"
              type="text"
              className={`w-full px-3 py-1.5 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400 ${
                errors.name ? 'border-red-500 focus:ring-red-500/30' : ''
              }`}
              placeholder="Ex: Sorveteria Central ou João da Silva"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              autoFocus
            />
            {errors.name && <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Valor */}
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                <DollarSign className="w-3 h-3 text-indigo-500" /> Valor Mensal (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted text-xs font-bold">R$</span>
                <input
                  id="input-value"
                  type="text"
                  inputMode="decimal"
                  className={`w-full pl-8 pr-3 py-1.5 theme-input rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400 ${
                    errors.value ? 'border-red-500 focus:ring-red-500/30' : ''
                  }`}
                  placeholder="250,00"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (errors.value) setErrors(prev => ({ ...prev, value: '' }));
                  }}
                />
              </div>
              {errors.value && <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{errors.value}</p>}
            </div>

            {/* Dia do Vencimento */}
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                <Calendar className="w-3 h-3 text-indigo-500" /> Dia Vencimento *
              </label>
              <input
                id="input-due-date-day"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="31"
                className={`w-full px-3 py-1.5 theme-input rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.dueDateDay ? 'border-red-500 focus:ring-red-500/30' : ''
                }`}
                placeholder="Ex: 10"
                value={dueDateDay}
                onChange={(e) => {
                  setDueDateDay(Number(e.target.value));
                  if (errors.dueDateDay) setErrors(prev => ({ ...prev, dueDateDay: '' }));
                }}
              />
              {errors.dueDateDay && <p className="text-[10px] text-rose-500 mt-0.5 font-semibold">{errors.dueDateDay}</p>}
            </div>
          </div>

          {/* Tipo de Cobrança: Recorrente (Verde) e Mensal (Azul) sem explicações */}
          <div>
            <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 select-none">
              Tipo de Cobrança
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="type-recorrente-btn"
                type="button"
                onClick={() => setContractType('recorrente')}
                className={`py-2 px-3 rounded-xl border text-xs font-black tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all ${
                  contractType === 'recorrente'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500 shadow-sm'
                    : 'theme-btn-secondary opacity-70 hover:opacity-100 hover:border-emerald-500/50'
                }`}
              >
                RECORRENTE
              </button>
              
              <button
                id="type-mensal-btn"
                type="button"
                onClick={() => setContractType('mensal')}
                className={`py-2 px-3 rounded-xl border text-xs font-black tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all ${
                  contractType === 'mensal'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 shadow-sm'
                    : 'theme-btn-secondary opacity-70 hover:opacity-100 hover:border-blue-500/50'
                }`}
              >
                MENSAL
              </button>
            </div>
          </div>

          {/* Período de Faturamento Compacto */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                <Calendar className="w-3 h-3 text-indigo-500" /> Início Cobrança
              </label>
              <input
                id="input-billing-start-date"
                type="month"
                inputMode="numeric"
                className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                value={billingStartDate}
                onChange={(e) => setBillingStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                <Calendar className="w-3 h-3 text-rose-500" /> Término Cobrança
              </label>
              <input
                id="input-billing-end-date"
                type="month"
                inputMode="numeric"
                className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                value={billingEndDate}
                onChange={(e) => setBillingEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[10px] font-bold theme-text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
              <FileText className="w-3 h-3 text-indigo-500" /> Observações (Opcional)
            </label>
            <input
              id="input-notes"
              type="text"
              className="w-full px-3 py-1.5 theme-input rounded-xl text-xs font-normal focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 transition-all"
              placeholder="Ex: Paga via Pix, contato: Sandra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Estado de Ativo / Inativo (Edição) */}
          {clientToEdit && (
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] font-bold theme-text-primary uppercase tracking-wider select-none">
                Situação:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onSave({ ...clientToEdit, status: 'ativo', name, dueDateDay: Number(dueDateDay), value: parseFloat(value) || 0, contractType, notes, billingStartDate: billingStartDate || undefined, billingEndDate: billingEndDate || undefined })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    clientToEdit.status === 'ativo'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : 'theme-btn-secondary'
                  }`}
                >
                  Ativo
                </button>
                <button
                  type="button"
                  onClick={() => onSave({ ...clientToEdit, status: 'inativo', name, dueDateDay: Number(dueDateDay), value: parseFloat(value) || 0, contractType, notes, billingStartDate: billingStartDate || undefined, billingEndDate: billingEndDate || undefined })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    clientToEdit.status === 'inativo'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                      : 'theme-btn-secondary'
                  }`}
                >
                  Inativo
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Footer Compacto */}
        <div className="px-4 py-2.5 theme-modal-footer flex justify-end gap-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            id="cancel-form-btn"
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 theme-btn-secondary rounded-xl font-semibold text-xs transition-all cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            id="save-client-btn"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            {clientToEdit ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
