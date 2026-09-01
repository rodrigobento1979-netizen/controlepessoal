import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  Download, 
  Upload, 
  FolderOpen, 
  Check, 
  AlertTriangle, 
  Sun, 
  Moon, 
  HardDrive, 
  RefreshCw, 
  Info,
  ShieldCheck,
  FileJson
} from 'lucide-react';
import { DatabaseConfig, Client, Expense } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbConfig: DatabaseConfig;
  onUpdateDbPath: (newPath: string) => void;
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
  onUpdateDbPath,
  onExportBackup,
  onImportBackup,
  clientsCount,
  expensesCount,
  theme,
  onToggleTheme,
  onClearData,
}: SettingsModalProps) {
  const [filePathInput, setFilePathInput] = useState(dbConfig.filePath);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSavePath = (e: React.FormEvent) => {
    e.preventDefault();
    if (filePathInput.trim()) {
      onUpdateDbPath(filePathInput.trim());
      setIsSavedSuccessfully(true);
      setTimeout(() => setIsSavedSuccessfully(false), 2500);
    }
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="theme-card w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        style={{ borderColor: 'var(--card-border)' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b transition-colors duration-300" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold theme-title flex items-center gap-2">
                Configurações do Sistema & Banco de Dados
              </h2>
              <p className="text-xs theme-text-secondary">
                Gerencie a localização do banco .JSON, backups e preferências
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg theme-text-secondary hover:bg-slate-500/10 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal (Scrollvel) */}
        <div className="p-5 space-y-5 overflow-y-auto scrollbar-thin">
          
          {/* SESSÃO 1: LOCALIZAÇÃO DO ARQUIVO DE BANCO DE DADOS JSON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold theme-title uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Database className="w-4 h-4 text-indigo-400" />
                Caminho do Banco de Dados (.JSON)
              </h3>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                dbConfig.isFound 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dbConfig.isFound ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                {dbConfig.isFound ? 'Banco Conectado' : 'Arquivo Não Localizado'}
              </span>
            </div>

            <p className="text-xs theme-text-secondary leading-relaxed">
              Especifique onde o arquivo do banco de dados em formato <strong>JSON</strong> fica salvo no seu computador. Ao abrir o sistema, os dados são vinculados a essa referência.
            </p>

            <form onSubmit={handleSavePath} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <HardDrive className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: C:/Financeiro/banco_dados_clientes.json"
                    value={filePathInput}
                    onChange={(e) => setFilePathInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isSavedSuccessfully ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                  {isSavedSuccessfully ? 'Caminho Salvo!' : 'Salvar Caminho'}
                </button>
              </div>
            </form>

            <div className="p-3 rounded-xl border flex items-start gap-2.5 text-xs theme-text-secondary" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold theme-text-primary text-[11px]">
                  Como funciona o salvamento local em navegadores:
                </p>
                <p className="text-[10px] leading-relaxed">
                  Por segurança do navegador, a aplicação mantém a sincronização instantânea em memória/armazenamento local associada ao arquivo de banco <strong>{dbConfig.filePath}</strong>. Você pode exportar uma cópia atualizada desse arquivo a qualquer momento abaixo.
                </p>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--card-border)' }} />

          {/* SESSÃO 2: BACKUP E RESTAURAÇÃO DE ARQUIVO */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold theme-title uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              Backup e Restauração de Dados
            </h3>

            <p className="text-xs theme-text-secondary">
              Exporte todos os seus cadastros para um arquivo <strong>.JSON</strong> de backup ou escolha um arquivo existente para restaurar seu banco de dados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Botão Exportar Backup */}
              <button
                onClick={onExportBackup}
                className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup (.JSON)</span>
              </button>

              {/* Botão Restaurar Backup */}
              <button
                onClick={handleSelectFileClick}
                className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Restaurar Backup (.JSON)</span>
              </button>

              {/* Input invisível para selecionar o arquivo JSON */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportBackup}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          </div>

          <hr style={{ borderColor: 'var(--card-border)' }} />

          {/* SESSÃO 3: ESTATÍSTICAS E STATUS DO BANCO */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold theme-title uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              Resumo do Banco de Dados Ativo
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border bg-slate-100/50 dark:bg-white/5" style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-[10px] theme-text-secondary uppercase font-bold block">Clientes</span>
                <span className="text-base font-black theme-title">{clientsCount}</span>
              </div>

              <div className="p-2.5 rounded-xl border bg-slate-100/50 dark:bg-white/5" style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-[10px] theme-text-secondary uppercase font-bold block">Despesas</span>
                <span className="text-base font-black theme-title">{expensesCount}</span>
              </div>

              <div className="p-2.5 rounded-xl border bg-slate-100/50 dark:bg-white/5 col-span-2 sm:col-span-1" style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-[10px] theme-text-secondary uppercase font-bold block">Formato</span>
                <span className="text-xs font-mono font-bold text-indigo-400">JSON 1.0</span>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--card-border)' }} />

          {/* SESSÃO 4: TEMAS E ZONA DE PERIGO */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onToggleTheme}
              className="w-full sm:w-auto py-2 px-4 rounded-xl border font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 theme-btn-secondary"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Alternar para Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Alternar para Modo Escuro</span>
                </>
              )}
            </button>

            <button
              onClick={onClearData}
              className="w-full sm:w-auto py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Limpar Todos os Dados</span>
            </button>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t flex justify-end transition-colors duration-300" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
