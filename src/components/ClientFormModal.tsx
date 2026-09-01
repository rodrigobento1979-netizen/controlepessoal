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
    <div id="client-form-modal-backdrop" className="fixed inset-0 theme-modal-backdrop backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all animate-fade-in">
      <div 
        id="client-form-modal-card" 
        className="theme-modal rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="px-6 py-4 theme-modal-header flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold theme-title">
              {clientToEdit ? 'Editar Dados do Cliente' : 'Cadastrar Novo Cliente'}
            </h3>
            <p className="text-xs theme-text-secondary mt-0.5">
              {clientToEdit ? 'Altere as informações de faturamento do cliente' : 'Adicione um novo cliente e defina suas regras de cobrança'}
            </p>
          </div>
          <button 
            id="close-form-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-500/10 theme-text-secondary hover:theme-title rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-4">
          
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
              <User className="w-3.5 h-3.5 text-indigo-500" /> Nome Completo / Empresa *
            </label>
            <input
              id="input-name"
              type="text"
              className={`w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold transition-all placeholder-slate-400 ${
                errors.name ? 'border-red-500 focus:ring-red-500/30' : ''
              }`}
              placeholder="Ex: Sorveteria Central ou João da Silva"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <DollarSign className="w-3.5 h-3.5 text-indigo-500" /> Valor Mensal (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted text-sm font-bold">R$</span>
                <input
                  id="input-value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold transition-all placeholder-slate-400 ${
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
              {errors.value && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.value}</p>}
            </div>

            {/* Dia do Vencimento */}
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Dia de Vencimento *
              </label>
              <input
                id="input-due-date-day"
                type="number"
                min="1"
                max="31"
                className={`w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold transition-all placeholder-slate-400 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.dueDateDay ? 'border-red-500 focus:ring-red-500/30' : ''
                }`}
                placeholder="Ex: 10"
                value={dueDateDay}
                onChange={(e) => {
                  setDueDateDay(Number(e.target.value));
                  if (errors.dueDateDay) setErrors(prev => ({ ...prev, dueDateDay: '' }));
                }}
              />
              <p className="text-[10px] theme-text-muted mt-1">Dia do vencimento recorrente (1-31)</p>
              {errors.dueDateDay && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.dueDateDay}</p>}
            </div>
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-2 select-none">
              Tipo de Cobrança / Contrato
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="type-recorrente-btn"
                type="button"
                onClick={() => setContractType('recorrente')}
                className={`p-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  contractType === 'recorrente'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'theme-btn-secondary'
                }`}
              >
                <span>Recorrente</span>
                <span className="text-[10px] font-normal opacity-85 text-center">Fatura todo mês automaticamente</span>
              </button>
              
              <button
                id="type-mensal-btn"
                type="button"
                onClick={() => setContractType('mensal')}
                className={`p-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  contractType === 'mensal'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'theme-btn-secondary'
                }`}
              >
                <span>Mensal</span>
                <span className="text-[10px] font-normal opacity-85 text-center">Contrato avulso / faturado manualmente</span>
              </button>
            </div>
          </div>

          {/* Período de Faturamento (Início e Fim) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Início da Cobrança */}
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Início das Cobranças (Opcional)
              </label>
              <input
                id="input-billing-start-date"
                type="month"
                className="w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold transition-all"
                value={billingStartDate}
                onChange={(e) => setBillingStartDate(e.target.value)}
              />
              <p className="text-[10px] theme-text-muted mt-1">
                Deixe vazio para cobrar imediatamente.
              </p>
            </div>

            {/* Término da Cobrança */}
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <Calendar className="w-3.5 h-3.5 text-rose-500" /> Término das Cobranças (Opcional)
              </label>
              <input
                id="input-billing-end-date"
                type="month"
                className="w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold transition-all"
                value={billingEndDate}
                onChange={(e) => setBillingEndDate(e.target.value)}
              />
              <p className="text-[10px] theme-text-muted mt-1">
                Deixe vazio para cobrar continuamente.
              </p>
            </div>
          </div>
          <p className="text-[10px] theme-text-secondary -mt-2">
            Perfeito para contratos temporários ou sazonais: por exemplo, configurando Junho como Início e Julho como Término, as cobranças ocorrerão apenas nesses dois meses.
          </p>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Observações (Opcional)
            </label>
            <textarea
              id="input-notes"
              className="w-full px-4 py-2.5 theme-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-normal min-h-[80px] max-h-[150px] placeholder-slate-400"
              placeholder="Ex: Paga sempre via Pix, contato principal: Sandra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Estado de Ativo (Somente para edição) */}
          {clientToEdit && (
            <div className="pt-2 flex items-center gap-3">
              <label className="block text-xs font-bold theme-text-primary uppercase tracking-wider select-none">
                Situação do Cliente:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSave({ ...clientToEdit, status: 'ativo', name, dueDateDay, value: parseFloat(value) || 0, contractType, notes })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clientToEdit.status === 'ativo'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : 'theme-btn-secondary'
                  }`}
                >
                  Ativo
                </button>
                <button
                  type="button"
                  onClick={() => onSave({ ...clientToEdit, status: 'inativo', name, dueDateDay, value: parseFloat(value) || 0, contractType, notes })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

        {/* Footer */}
        <div className="px-6 py-4 theme-modal-footer flex justify-end gap-3">
          <button
            id="cancel-form-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 theme-btn-secondary rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            Ir para trás / Fechar
          </button>
          
          <button
            id="save-client-btn"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            {clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}
