import React, { useRef } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  Download, 
  Upload, 
  FolderOpen, 
  AlertTriangle, 
  Sun, 
  Moon, 
  ShieldCheck,
  Cloud,
  CheckCircle2,
  FileJson,
  Smartphone
} from 'lucide-react';
import { DatabaseConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbConfig: DatabaseConfig;
  onUpdateDbPath?: (newPath: string) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clientsCount: number;
  expensesCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClearData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  dbConfig,
  onExportBackup,
  onImportBackup,
  clientsCount,
  expensesCount,
  theme,
  onToggleTheme,
  onClearData,
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="theme-card w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        style={{ borderColor: 'var(--card-border)' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b transition-colors duration-300" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl shrink-0">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black theme-title flex items-center gap-2">
                Configurações & Banco de Dados
              </h2>
              <p className="text-xs theme-text-secondary">
                Restauração de dados JSON, cópias de segurança e preferências do sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-text-secondary hover:bg-slate-500/10 hover:text-rose-500 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal (Scrollável) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin">
          
          {/* SESSÃO 1: STATUS DO BANCO DE DADOS EM NUVEM (FIRESTORE) */}
          <div className="p-4 rounded-2xl border bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold theme-title">
                    Banco de Dados Cloud Conectado
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-xs theme-text-secondary mt-0.5 leading-relaxed">
                  Sincronização em tempo real ativa entre computadores e celulares via Cloud Firestore.
                </p>
              </div>
            </div>

            {/* Contadores Rápidos */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] theme-text-secondary uppercase font-bold block">Clientes</span>
                <span className="text-xs font-black theme-title">{clientsCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-[10px] theme-text-secondary uppercase font-bold block">Despesas</span>
                <span className="text-xs font-black theme-title">{expensesCount}</span>
              </div>
            </div>
          </div>

          {/* SESSÃO 2: RESTAURAR JSON PARA O BANCO DE DADOS & EXPORTAR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold theme-title uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <FolderOpen className="w-4 h-4 text-purple-400" />
                Restauração & Backup do Banco de Dados
              </h3>
            </div>

            <p className="text-xs theme-text-secondary leading-relaxed">
              Use as opções abaixo para carregar um arquivo <strong>.JSON</strong> existente diretamente para o seu banco de dados na nuvem ou exportar uma cópia completa dos registros.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              {/* CARD 1: RESTAURAR ARQUIVO JSON PARA O BANCO DE DADOS */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between bg-purple-500/5 border-purple-500/30 hover:border-purple-500/50 transition-all">
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                      <Upload className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-extrabold theme-title">
                      Restaurar JSON p/ Banco
                    </h4>
                  </div>
                  <p className="text-[11px] theme-text-secondary leading-relaxed">
                    Selecione um arquivo <strong className="text-purple-400 font-mono">.json</strong> de backup para carregar os clientes e despesas e gravá-los no Banco de Dados em Nuvem.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onImportBackup}
                  accept=".json,application/json"
                  className="hidden"
                />

                <button
                  type="button"
                  id="settings-restore-json-btn"
                  onClick={handleSelectFileClick}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo .JSON</span>
                </button>
              </div>

              {/* CARD 2: EXPORTAR CÓPIA COMPLETA DO BANCO */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Download className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-extrabold theme-title">
                      Exportar Cópia (.JSON)
                    </h4>
                  </div>
                  <p className="text-[11px] theme-text-secondary leading-relaxed">
                    Baixe um arquivo cópia do banco de dados atual com todos os clientes, pagamentos e despesas cadastrados.
                  </p>
                </div>

                <button
                  type="button"
                  id="settings-export-json-btn"
                  onClick={onExportBackup}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo .JSON</span>
                </button>
              </div>

            </div>
          </div>

          <hr style={{ borderColor: 'var(--card-border)' }} />

          {/* SESSÃO 3: APARÊNCIA & REINICIALIZAÇÃO */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold theme-title uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Settings className="w-4 h-4 text-indigo-400" />
              Preferências & Manutenção
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {/* Alternar Tema */}
              <button
                type="button"
                id="settings-toggle-theme-btn"
                onClick={onToggleTheme}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 theme-btn-secondary"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Mudar para Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>Mudar para Modo Escuro</span>
                  </>
                )}
              </button>

              {/* Limpar Todos os Dados */}
              <button
                type="button"
                id="settings-clear-data-btn"
                onClick={onClearData}
                className="w-full sm:w-auto py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Limpar Banco de Dados</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t flex justify-end transition-colors duration-300" style={{ borderColor: 'var(--card-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
