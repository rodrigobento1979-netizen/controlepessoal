import React, { useRef } from 'react';
import { 
  AlertTriangle, 
  Upload, 
  FolderSearch, 
  Database, 
  PlusCircle, 
  FileJson,
  HelpCircle
} from 'lucide-react';

interface DatabaseNotFoundModalProps {
  isOpen: boolean;
  filePath: string;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInitializeNew: () => void;
  onOpenSettings: () => void;
}

export default function DatabaseNotFoundModal({
  isOpen,
  filePath,
  onImportBackup,
  onInitializeNew,
  onOpenSettings,
}: DatabaseNotFoundModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="theme-card w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-scale-up"
        style={{ borderColor: 'var(--card-border)' }}
      >
        {/* Cabeçalho de Alerta */}
        <div className="p-6 bg-amber-500/10 border-b border-amber-500/20 text-center flex flex-col items-center">
          <div className="p-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full mb-3 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black theme-title">
            Banco de Dados Não Encontrado!
          </h2>
          <p className="text-xs theme-text-secondary mt-1 max-w-sm">
            Não foi localizado um arquivo de banco de dados ativo ou o local configurado precisa de sincronização.
          </p>
        </div>

        {/* Informações sobre o caminho */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border bg-slate-100/50 dark:bg-white/5 space-y-1" style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-[10px] uppercase font-bold theme-text-secondary block">
              Caminho Configurado do Arquivo .JSON:
            </span>
            <div className="flex items-center gap-2 font-mono text-indigo-500 dark:text-indigo-300 font-bold break-all">
              <FileJson className="w-4 h-4 shrink-0" />
              <span>{filePath || 'banco_dados_clientes.json'}</span>
            </div>
          </div>

          <p className="theme-text-secondary leading-relaxed">
            Para continuar utilizando o sistema sem perda de informações, por favor selecione seu <strong>arquivo de backup (.JSON)</strong> para recuperar os dados ou inicie uma nova estrutura zerada.
          </p>

          {/* Opções de Ação */}
          <div className="space-y-2.5 pt-2">
            {/* Opção 1: Selecionar e Restaurar o Arquivo Backup */}
            <button
              onClick={handleSelectFileClick}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Restaurar / Escolher Arquivo de Backup (.JSON)</span>
            </button>

            {/* Input para selecionar o arquivo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportBackup}
              accept=".json,application/json"
              className="hidden"
            />

            {/* Opção 2: Inicializar com Dados Padrão */}
            <button
              onClick={onInitializeNew}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 theme-text-primary rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Iniciar com Banco de Dados Padrão</span>
            </button>

            {/* Opção 3: Alterar Configurações */}
            <button
              onClick={onOpenSettings}
              className="w-full py-2 px-4 theme-text-secondary hover:text-indigo-400 text-[11px] font-semibold text-center cursor-pointer transition-colors"
            >
              Alterar caminho do arquivo nas Configurações
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
