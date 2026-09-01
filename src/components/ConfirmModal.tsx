import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="confirm-modal-backdrop" 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all animate-fade-in"
    >
      <div 
        id="confirm-modal-card" 
        className="bg-slate-900 border border-white/10 dark-theme-class rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 text-white"
        style={{
          backgroundColor: 'var(--modal-bg, #0f172a)',
          borderColor: 'var(--modal-border, rgba(255, 255, 255, 0.1))',
          color: 'var(--modal-text, #ffffff)'
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5" style={{ borderBottomColor: 'var(--modal-border, rgba(255, 255, 255, 0.1))', backgroundColor: 'var(--modal-header-bg, rgba(255, 255, 255, 0.05))' }}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${isDanger ? 'text-rose-400' : 'text-indigo-400'}`} />
            <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          </div>
          <button 
            id="close-confirm-modal"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5">
          <p className="text-xs text-slate-300 leading-relaxed font-medium" style={{ color: 'var(--modal-desc-color, #cbd5e1)' }}>
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-white/5 border-t border-white/10 flex justify-end gap-2.5" style={{ borderTopColor: 'var(--modal-border, rgba(255, 255, 255, 0.1))', backgroundColor: 'var(--modal-header-bg, rgba(255, 255, 255, 0.05))' }}>
          <button
            id="cancel-confirm-btn"
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            style={{ 
              borderColor: 'var(--modal-border, rgba(255, 255, 255, 0.1))',
              color: 'var(--modal-desc-color, #cbd5e1)'
            }}
          >
            {cancelText}
          </button>
          <button
            id="confirm-confirm-btn"
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
              isDanger 
                ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/10' 
                : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
