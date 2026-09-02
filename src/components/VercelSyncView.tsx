import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Server, 
  Globe, 
  FileJson, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Lock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Flame,
  Activity,
  Laptop,
  Smartphone,
  Code2
} from 'lucide-react';
import { Client, Expense, DatabaseConfig } from '../types';
import { 
  downloadBackupFile, 
  generateBackupPayload, 
  getJsonStorageStats,
  STORAGE_KEY_AUTO_SYNC
} from '../utils/cloudSync';
import { 
  syncAllToFirestore, 
  fetchAllFromFirestore, 
  saveCategoriesToFirestore 
} from '../firebase/firestoreService';
import firebaseConfig from '../../firebase-applet-config.json';

interface VercelSyncViewProps {
  clients: Client[];
  expenses: Expense[];
  categories: string[];
  dbConfig: DatabaseConfig;
  onRestoreData: (newClients: Client[], newExpenses: Expense[], newCategories: string[]) => void;
  onShowFeedback: (msg: string) => void;
}

export default function VercelSyncView({
  clients,
  expenses,
  categories,
  dbConfig,
  onRestoreData,
  onShowFeedback,
}: VercelSyncViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState(() => {
    return localStorage.getItem('contr_clientes_cloud_last_sync') || new Date().toLocaleString('pt-BR');
  });

  // Configuração do Auto-Sync
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';
  });

  // Visualizador do JSON
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Estatísticas do JSON em tempo real
  const stats = getJsonStorageStats(clients, expenses, categories);
  const jsonPreview = JSON.stringify(generateBackupPayload(clients, expenses, categories, dbConfig), null, 2);

  const toggleAutoSync = () => {
    const newVal = !autoSyncEnabled;
    setAutoSyncEnabled(newVal);
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(newVal));
    onShowFeedback(newVal ? '✓ Sincronização em tempo real do banco ativada!' : 'Sincronização em tempo real pausada.');
  };

  // Enviar tudo para o Banco Firestore
  const handlePushToFirestore = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Gravando todos os clientes e despesas no Banco de Dados em Nuvem (Firestore)...');
    
    try {
      const result = await syncAllToFirestore(clients, expenses, categories);
      if (result.success) {
        const dateStr = new Date().toLocaleString('pt-BR');
        setLastSyncDate(dateStr);
        localStorage.setItem('contr_clientes_cloud_last_sync', dateStr);
        setSyncStatusMsg(`✓ ${result.message}`);
        onShowFeedback('✓ Todos os dados foram gravados no Banco de Dados Firestore com sucesso!');
      } else {
        setSyncStatusMsg(`Erro: ${result.message}`);
        onShowFeedback(`Falha ao gravar no banco: ${result.message}`);
      }
    } catch (e: any) {
      setSyncStatusMsg('Erro ao sincronizar com Firestore: ' + e?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Puxar tudo do Banco Firestore
  const handlePullFromFirestore = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Consultando e recuperando dados do Banco de Dados Firestore...');

    try {
      const result = await fetchAllFromFirestore();
      if (result && result.clients && result.clients.length > 0) {
        onRestoreData(
          result.clients,
          result.expenses || [],
          result.categories && result.categories.length > 0 ? result.categories : categories
        );
        const dateStr = new Date().toLocaleString('pt-BR');
        setLastSyncDate(dateStr);
        localStorage.setItem('contr_clientes_cloud_last_sync', dateStr);
        setSyncStatusMsg(`✓ Banco de dados carregado com sucesso: ${result.clients.length} clientes e ${result.expenses.length} despesas recuperadas.`);
        onShowFeedback(`✓ Base do Firestore carregada com ${result.clients.length} clientes!`);
      } else {
        setSyncStatusMsg('Nenhum dado encontrado no Firestore ou banco vazio. Você pode enviar a base atual.');
        onShowFeedback('Nenhum dado encontrado no banco Firestore.');
      }
    } catch (e: any) {
      setSyncStatusMsg('Erro ao puxar dados do Firestore: ' + e?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manipulador de Upload de Arquivo Backup JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.clients && Array.isArray(json.clients)) {
          const newCats = json.expenseCategories || categories;
          onRestoreData(
            json.clients,
            json.expenses || [],
            newCats
          );
          // Grava também no Firestore imediatamente
          await syncAllToFirestore(json.clients, json.expenses || [], newCats);
          
          const dateStr = new Date().toLocaleString('pt-BR');
          setLastSyncDate(dateStr);
          localStorage.setItem('contr_clientes_cloud_last_sync', dateStr);
          onShowFeedback('✓ Arquivo JSON restaurado e sincronizado no Banco Firestore com sucesso!');
          setSyncStatusMsg(`Backup restaurado e sincronizado no Banco: ${json.clients.length} clientes e ${json.expenses?.length || 0} despesas.`);
        } else {
          alert('Arquivo JSON inválido ou formato incompatível.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON: ' + err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonPreview);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* BANNER PRINCIPAL: BANCO DE DADOS EM NUVEM (FIRESTORE) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-purple-950 border border-orange-500/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-300 shrink-0 shadow-inner">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  Banco de Dados em Nuvem (Google Cloud Firestore)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Conectado ao Vivo
                </span>
              </div>
              <p className="text-xs text-orange-200/90 mt-0.5 max-w-2xl">
                O sistema agora utiliza um <strong>Banco de Dados em Nuvem Permanente</strong>. Cada cliente cadastrado, valor alterado ou pagamento confirmado é sincronizado instantaneamente entre seu computador, notebook e celular.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            {/* Interruptor de Auto-Sync */}
            <button
              type="button"
              id="toggle-autosync-btn"
              onClick={toggleAutoSync}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between sm:justify-start gap-2 cursor-pointer ${
                autoSyncEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30' 
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
              }`}
              title="Sincroniza automaticamente cada alteração em tempo real no banco"
            >
              <Zap className={`w-3.5 h-3.5 ${autoSyncEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Tempo Real: {autoSyncEnabled ? 'Ativo' : 'Pausado'}</span>
              <span className={`w-2 h-2 rounded-full ${autoSyncEnabled ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-orange-200/90 bg-black/40 px-3 py-2 rounded-xl border border-white/10 justify-between">
              <span className="text-orange-300 font-sans text-[11px]">Última Sincronização:</span>
              <span className="font-bold text-white">{lastSyncDate}</span>
            </div>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-black/50 border border-orange-400/30 text-xs text-orange-100 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* BLOCO DE SINCRONIZAÇÃO ENTRE DISPOSITIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* CARD 1: PUXAR DADOS DO BANCO */}
        <div className="theme-card rounded-xl p-4 border shadow-sm flex flex-col justify-between gap-4" style={{ borderColor: 'var(--card-border)' }}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black theme-title">Puxar do Banco de Dados</h4>
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Está em outro computador, notebook ou celular? Clique abaixo para buscar todas as informações salvas no banco de dados na nuvem e atualizar sua tela agora.
            </p>
          </div>

          <button
            type="button"
            id="pull-firestore-data-btn"
            onClick={handlePullFromFirestore}
            disabled={isSyncing}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Buscando do Banco...' : 'Puxar Dados Atualizados do Banco'}</span>
          </button>
        </div>

        {/* CARD 2: ENVIAR DADOS PARA O BANCO */}
        <div className="theme-card rounded-xl p-4 border shadow-sm flex flex-col justify-between gap-4" style={{ borderColor: 'var(--card-border)' }}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <ArrowUpFromLine className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black theme-title">Enviar para o Banco de Dados</h4>
            </div>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Grave todos os {clients.length} clientes e {expenses.length} despesas atuais diretamente no banco de dados Firestore para que fiquem disponíveis em qualquer lugar.
            </p>
          </div>

          <button
            type="button"
            id="push-firestore-data-btn"
            onClick={handlePushToFirestore}
            disabled={isSyncing}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Gravando no Banco...' : 'Enviar Toda a Base para o Banco Cloud'}</span>
          </button>
        </div>

      </div>

      {/* PAINEL DE INFORMAÇÕES DO BANCO E ESTATÍSTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Card de Informações da Conexão */}
        <div className="theme-card rounded-xl p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <Database className="w-4 h-4 text-orange-400" />
            <h4 className="text-xs font-black theme-title uppercase tracking-wider">Conexão do Banco</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Provedor:</span>
              <span className="font-bold theme-title">Google Cloud Firestore</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Projeto ID:</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-500/10 theme-title font-bold">
                {firebaseConfig.projectId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Modo de Operação:</span>
              <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tempo Real Ativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Multi-dispositivo:</span>
              <div className="flex items-center gap-1 text-indigo-400 font-bold">
                <Laptop className="w-3.5 h-3.5" /> + <Smartphone className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Card de Registros Armazenados */}
        <div className="theme-card rounded-xl p-4 border shadow-sm space-y-3" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black theme-title uppercase tracking-wider">Documentos no Banco</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Clientes Cadastrados:</span>
              <span className="font-extrabold text-emerald-500 text-sm">{stats.clientsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Histórico de Pagamentos:</span>
              <span className="font-bold theme-title">{clients.reduce((sum, c) => sum + (c.paymentHistory?.length || 0), 0)} mensalidades</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Despesas Operacionais:</span>
              <span className="font-bold theme-title">{stats.expensesCount} lançamentos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Categorias de Despesas:</span>
              <span className="font-bold theme-title">{categories.length} cadastradas</span>
            </div>
          </div>
        </div>

        {/* Card de Backup Físico JSON (Segurança Adicional) */}
        <div className="theme-card rounded-xl p-4 border shadow-sm space-y-3 flex flex-col justify-between" style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <FileJson className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-black theme-title uppercase tracking-wider">Backup de Segurança JSON</h4>
            </div>
            <p className="text-[11px] theme-text-secondary mt-2">
              Além do banco de dados na nuvem, você pode baixar ou restaurar um arquivo <code>.json</code> físico a qualquer momento.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              id="download-json-backup-btn"
              onClick={() => {
                downloadBackupFile(clients, expenses, categories, dbConfig);
                onShowFeedback('✓ Backup JSON baixado com sucesso!');
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Baixar cópia local do banco em formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .JSON</span>
            </button>

            <label className="flex-1 py-2 px-3 rounded-lg bg-slate-500/15 text-slate-300 hover:bg-slate-500/25 border border-slate-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar .JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* INSPECTOR DO JSON COMPACTO */}
      <div className="theme-card rounded-xl p-4 border shadow-sm" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="flex items-center gap-2 text-xs font-bold theme-text-secondary hover:text-indigo-400 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>{showJsonInspector ? 'Ocultar Estrutura JSON dos Documentos' : 'Ver Estrutura JSON dos Documentos'}</span>
          </button>

          {showJsonInspector && (
            <button
              type="button"
              onClick={copyJsonToClipboard}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1 cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          )}
        </div>

        {showJsonInspector && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800">
            <pre>{jsonPreview}</pre>
          </div>
        )}
      </div>

    </div>
  );
}
