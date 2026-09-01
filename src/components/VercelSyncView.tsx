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
  Code2, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Eye, 
  EyeOff, 
  Settings2,
  Lock,
  ArrowDownUp
} from 'lucide-react';
import { Client, Expense, DatabaseConfig } from '../types';
import { 
  downloadBackupFile, 
  syncDataToCloud, 
  fetchCloudData, 
  generateBackupPayload, 
  getJsonStorageStats,
  STORAGE_KEY_AUTO_SYNC,
  STORAGE_KEY_CUSTOM_KV_URL,
  STORAGE_KEY_CUSTOM_KV_TOKEN
} from '../utils/cloudSync';

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
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);

  // Vercel KV / Storage Avançado
  const [showKvSettings, setShowKvSettings] = useState(false);
  const [kvUrl, setKvUrl] = useState(() => localStorage.getItem(STORAGE_KEY_CUSTOM_KV_URL) || '');
  const [kvToken, setKvToken] = useState(() => localStorage.getItem(STORAGE_KEY_CUSTOM_KV_TOKEN) || '');
  const [isKvSaved, setIsKvSaved] = useState(false);

  // Estatísticas do JSON em tempo real
  const stats = getJsonStorageStats(clients, expenses, categories);
  const jsonPreview = JSON.stringify(generateBackupPayload(clients, expenses, categories, dbConfig), null, 2);

  const toggleAutoSync = () => {
    const newVal = !autoSyncEnabled;
    setAutoSyncEnabled(newVal);
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(newVal));
    onShowFeedback(newVal ? '✓ Sincronização automática em tempo real ativada!' : 'Sincronização automática desativada.');
  };

  const handleSaveKvConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY_CUSTOM_KV_URL, kvUrl.trim());
    localStorage.setItem(STORAGE_KEY_CUSTOM_KV_TOKEN, kvToken.trim());
    setIsKvSaved(true);
    setTimeout(() => setIsKvSaved(false), 2500);
    onShowFeedback('✓ Credenciais do Vercel KV salvas com sucesso!');
  };

  // Manipulador de Envio para a Nuvem / Vercel
  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Enviando dados JSON para a nuvem da Vercel...');
    
    try {
      const result = await syncDataToCloud(clients, expenses, categories, dbConfig);
      setLastSyncDate(result.timestamp);
      setSyncStatusMsg(result.message);
      onShowFeedback('✓ Dados sincronizados e gravados no JSON da Vercel com sucesso!');
    } catch (e: any) {
      setSyncStatusMsg('Erro ao sincronizar dados: ' + e?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manipulador de Puxar da Nuvem / Vercel
  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Buscando base JSON da nuvem / Vercel...');

    try {
      const result = await fetchCloudData();
      if (result.success && result.data) {
        onRestoreData(
          result.data.clients || [],
          result.data.expenses || [],
          result.data.expenseCategories || categories
        );
        const dateStr = new Date().toLocaleString('pt-BR');
        setLastSyncDate(dateStr);
        localStorage.setItem('contr_clientes_cloud_last_sync', dateStr);
        setSyncStatusMsg(result.message);
        onShowFeedback(`✓ Base JSON restaurada a partir de ${result.source || 'Vercel'}!`);
      } else {
        setSyncStatusMsg(result.message || 'Nenhum dado encontrado na nuvem.');
      }
    } catch (e: any) {
      setSyncStatusMsg('Erro ao recuperar dados: ' + e?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manipulador de Upload de Arquivo Backup JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.clients && Array.isArray(json.clients)) {
          onRestoreData(
            json.clients,
            json.expenses || [],
            json.expenseCategories || categories
          );
          const dateStr = new Date().toLocaleString('pt-BR');
          setLastSyncDate(dateStr);
          localStorage.setItem('contr_clientes_cloud_last_sync', dateStr);
          onShowFeedback('✓ Arquivo JSON importado e aplicado com sucesso!');
          setSyncStatusMsg(`Backup restaurado: ${json.clients.length} clientes e ${json.expenses?.length || 0} despesas.`);
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

  const copyConfigSnippet = () => {
    const vercelConfig = `{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;
    navigator.clipboard.writeText(vercelConfig);
    setCopiedVercelJson(true);
    setTimeout(() => setCopiedVercelJson(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Banner Principal de Status Nuvem / Vercel */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950 border border-purple-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-200 shrink-0 shadow-inner">
              <Globe className="w-6 h-6 text-purple-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  Sincronização & Armazenamento JSON na Vercel
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5 max-w-2xl">
                Sim! Todos os dados do sistema são organizados em um documento JSON padronizado e sincronizados com a nuvem da Vercel para você acessar de qualquer computador ou celular.
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
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30' 
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
              }`}
              title="Salva automaticamente cada alteração na nuvem"
            >
              <Zap className={`w-3.5 h-3.5 ${autoSyncEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Auto-Sync: {autoSyncEnabled ? 'Ativado' : 'Pausado'}</span>
              <span className={`w-2 h-2 rounded-full ${autoSyncEnabled ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-purple-200/90 bg-black/30 px-3 py-2 rounded-xl border border-white/10 justify-between">
              <span className="text-purple-300 font-sans text-[11px]">Última Sincronização:</span>
              <span className="font-bold text-white">{lastSyncDate}</span>
            </div>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-black/40 border border-purple-400/20 text-xs text-purple-100 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Grade de Estatísticas do Documento JSON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl theme-card border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] theme-text-secondary font-medium">Tamanho do JSON</div>
            <div className="text-sm font-black theme-title">{stats.sizeKb}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl theme-card border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] theme-text-secondary font-medium">Clientes Cadastrados</div>
            <div className="text-sm font-black theme-title">{stats.clientsCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl theme-card border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] theme-text-secondary font-medium">Despesas Registradas</div>
            <div className="text-sm font-black theme-title">{stats.expensesCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl theme-card border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] theme-text-secondary font-medium">Status da Estrutura</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">100% Válido</div>
          </div>
        </div>
      </div>

      {/* Cartões de Ação Imediata (Enviar, Puxar, Exportar e Importar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Enviar dados da máquina para a Vercel */}
        <div className="p-5 rounded-2xl theme-card border flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                Máquina → JSON Vercel
              </span>
            </div>

            <h4 className="text-sm font-black theme-title">
              Enviar JSON para a Nuvem da Vercel
            </h4>
            <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
              Envia e atualiza o documento JSON no backend serverless da Vercel e no Vercel KV com todos os clientes, status e despesas.
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              id="push-cloud-btn"
              onClick={handlePushToCloud}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Sincronizar Agora com a Vercel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Puxar e Restaurar da Vercel */}
        <div className="p-5 rounded-2xl theme-card border flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                JSON Vercel → Máquina
              </span>
            </div>

            <h4 className="text-sm font-black theme-title">
              Carregar Dados do JSON da Vercel
            </h4>
            <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
              Busca o JSON mais recente salvo na nuvem da Vercel e atualiza a aplicação instantaneamente.
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              id="pull-cloud-btn"
              onClick={handlePullFromCloud}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Puxar & Atualizar do JSON da Vercel</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Seção de Arquivo Físico de Backup (.JSON) */}
      <div className="p-5 rounded-2xl theme-card border space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b theme-card-border pb-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-black theme-title">
              Arquivo Físico de Backup em JSON
            </h4>
          </div>
          <span className="text-[11px] theme-text-secondary">
            {clients.length} clientes • {expenses.length} despesas
          </span>
        </div>

        <p className="text-xs theme-text-secondary">
          Baixe o arquivo JSON para salvar uma cópia física no seu computador, Google Drive, ou transfira para outro dispositivo a qualquer momento.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            id="download-backup-btn"
            onClick={() => downloadBackupFile(clients, expenses, categories, dbConfig)}
            className="flex-1 py-2.5 px-4 theme-btn-secondary rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-purple-500"
          >
            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Baixar Arquivo JSON da Base</span>
          </button>

          <label
            htmlFor="import-backup-file-input"
            className="flex-1 py-2.5 px-4 theme-btn-secondary rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 text-center"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Restaurar / Importar Arquivo JSON</span>
            <input
              id="import-backup-file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJsonFile}
            />
          </label>
        </div>
      </div>

      {/* Visualizador do JSON ao Vivo (Inspecionar dados que estão na Vercel) */}
      <div className="p-5 rounded-2xl theme-card border space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b theme-card-border pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-500" />
            <div>
              <h4 className="text-sm font-black theme-title">
                Inspecionar Estrutura do JSON
              </h4>
              <p className="text-[11px] theme-text-secondary">
                Veja exatamente o documento JSON que a Vercel armazena e processa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyJsonToClipboard}
              className="px-3 py-1.5 text-xs font-semibold theme-btn-secondary rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonInspector(!showJsonInspector)}
              className="px-3 py-1.5 text-xs font-semibold theme-btn-secondary rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              {showJsonInspector ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showJsonInspector ? 'Recolher' : 'Visualizar JSON'}</span>
            </button>
          </div>
        </div>

        {showJsonInspector && (
          <div className="animate-fade-in space-y-2">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto scrollbar-thin border border-slate-700">
              <pre>{jsonPreview}</pre>
            </div>
            <p className="text-[11px] theme-text-secondary text-right">
              Tamanho total serializado: {stats.sizeKb}
            </p>
          </div>
        )}
      </div>

      {/* Configuração do Vercel KV / Persistência Global Permanente */}
      <div className="p-5 rounded-2xl theme-card border space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b theme-card-border pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <div>
              <h4 className="text-sm font-black theme-title">
                Persistência Permanente com Vercel KV (Opcional)
              </h4>
              <p className="text-[11px] theme-text-secondary">
                Conecte o serviço gratuito de KV Storage da Vercel para persistência de dados permanente em nuvem
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKvSettings(!showKvSettings)}
            className="px-3 py-1.5 text-xs font-semibold theme-btn-secondary rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showKvSettings ? 'Ocultar' : 'Configurar KV'}</span>
          </button>
        </div>

        {showKvSettings && (
          <form onSubmit={handleSaveKvConfig} className="space-y-3 animate-fade-in pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold theme-text-primary mb-1">
                  KV_REST_API_URL:
                </label>
                <input
                  type="text"
                  placeholder="https://...kv.vercel-storage.com"
                  value={kvUrl}
                  onChange={(e) => setKvUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl theme-input border font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold theme-text-primary mb-1">
                  KV_REST_API_TOKEN:
                </label>
                <input
                  type="password"
                  placeholder="Token de autorização do Vercel KV"
                  value={kvToken}
                  onChange={(e) => setKvToken(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl theme-input border font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] theme-text-secondary">
                Disponível na aba <strong>Storage &gt; KV</strong> no seu painel da Vercel.
              </span>

              <button
                type="submit"
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isKvSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isKvSaved ? 'Configuração Salva!' : 'Salvar Chaves'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Guia Prático de Publicação na Vercel */}
      <div className="p-5 rounded-2xl theme-card border space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b theme-card-border pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            <h4 className="text-sm font-black theme-title">
              Como Funciona a Sincronização na Vercel (Passo a Passo)
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            Pronto para Produção
          </span>
        </div>

        <div className="space-y-3 text-xs theme-text-secondary leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
            <div>
              <strong className="theme-text-primary">Estrutura em JSON:</strong> Todas as informações financeiras de clientes, valores mensais, despesas e datas são transformadas em um JSON limpo e estruturado.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
            <div>
              <strong className="theme-text-primary">Sincronização Serverless (/api/sync):</strong> A Vercel recebe o JSON na rota serverless e mantém a base acessível para qualquer instância ou usuário.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
            <div>
              <strong className="theme-text-primary">Auto-Sync em Segundo Plano:</strong> Com o Auto-Sync ligado, você não precisa se preocupar em clicar em salvar: qualquer cliente adicionado ou mensalidade dada baixa é sincronizada instantaneamente.
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={copyConfigSnippet}
            className="px-3 py-1.5 text-xs font-semibold theme-btn-secondary rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            {copiedVercelJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedVercelJson ? 'Configuração Copiada!' : 'Copiar vercel.json'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
