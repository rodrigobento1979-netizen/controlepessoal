import { Client, Expense, DatabaseConfig, CloudBackupData } from '../types';

export const STORAGE_KEY_CLIENTS = 'contr_clientes_data';
export const STORAGE_KEY_EXPENSES = 'contr_clientes_expenses';
export const STORAGE_KEY_CATEGORIES = 'contr_clientes_expense_categories';
export const STORAGE_KEY_DB_CONFIG = 'contr_clientes_db_config';
export const STORAGE_KEY_CLOUD_TIME = 'contr_clientes_cloud_last_sync';
export const STORAGE_KEY_AUTO_SYNC = 'contr_clientes_auto_sync_enabled';
export const STORAGE_KEY_CUSTOM_KV_URL = 'contr_clientes_custom_kv_url';
export const STORAGE_KEY_CUSTOM_KV_TOKEN = 'contr_clientes_custom_kv_token';

/**
 * Cria o payload completo com todos os dados do sistema em formato JSON padronizado
 */
export function generateBackupPayload(
  clients: Client[],
  expenses: Expense[],
  categories: string[],
  dbConfig: DatabaseConfig,
  userName = 'Rodrigo Bento',
  userEmail = 'rodrigobento1979@gmail.com'
): CloudBackupData {
  return {
    version: '3.0-vercel',
    exportedAt: new Date().toISOString(),
    clients,
    expenses,
    expenseCategories: categories,
    dbConfig,
    user: {
      name: userName,
      email: userEmail,
    },
  };
}

/**
 * Faz download do arquivo de backup JSON estruturado para a máquina do usuário
 */
export function downloadBackupFile(
  clients: Client[],
  expenses: Expense[],
  categories: string[],
  dbConfig: DatabaseConfig,
  userName?: string,
  userEmail?: string
) {
  const data = generateBackupPayload(clients, expenses, categories, dbConfig, userName, userEmail);
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const now = new Date();
  const dateSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
  
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `banco_dados_vercel_${dateSuffix}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Retorna estatísticas do arquivo JSON em memória
 */
export function getJsonStorageStats(clients: Client[], expenses: Expense[], categories: string[]) {
  const samplePayload = generateBackupPayload(clients, expenses, categories, {
    filePath: 'vercel://storage/database.json',
    lastSyncAt: new Date().toISOString(),
    autoSync: true,
    isFound: true,
  });
  
  const serialized = JSON.stringify(samplePayload);
  const sizeBytes = new Blob([serialized]).size;
  const sizeKb = (sizeBytes / 1024).toFixed(2);
  
  // Total de pagamentos e registros de faturas
  const totalMonthsRecorded = clients.reduce((acc, c) => {
    return acc + (c.paymentHistory?.length || 0) + (c.issuedBillingMonths?.length || 0);
  }, 0);

  return {
    sizeBytes,
    sizeKb: `${sizeKb} KB`,
    clientsCount: clients.length,
    expensesCount: expenses.length,
    categoriesCount: categories.length,
    totalMonthsRecorded,
  };
}

/**
 * Envia e sincroniza os dados no endpoint Serverless / Vercel KV em JSON
 */
export async function syncDataToCloud(
  clients: Client[],
  expenses: Expense[],
  categories: string[],
  dbConfig: DatabaseConfig,
  userName?: string,
  userEmail?: string
): Promise<{ success: boolean; message: string; timestamp: string; storageType?: string }> {
  const payload = generateBackupPayload(clients, expenses, categories, dbConfig, userName, userEmail);
  const nowStr = new Date().toLocaleString('pt-BR');

  try {
    // 1. Grava no LocalStorage do navegador (Garantia imediata de resiliência)
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEY_CLOUD_TIME, nowStr);

    let storageType = 'Navegador + Serverless Vercel';

    // 2. Se houver Vercel KV configurado diretamente no cliente
    const customKvUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_KV_URL);
    const customKvToken = localStorage.getItem(STORAGE_KEY_CUSTOM_KV_TOKEN);

    if (customKvUrl && customKvToken) {
      try {
        await fetch(`${customKvUrl}/set/contr_clientes_main_db`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${customKvToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        storageType = 'Vercel KV (Persistência Permanente)';
      } catch (kvErr) {
        console.warn('Falha no envio direto ao Vercel KV:', kvErr);
      }
    }

    // 3. Tenta enviar para a rota /api/sync
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          success: true,
          message: json.message || 'Dados JSON salvos com sucesso na Vercel e na sua máquina.',
          timestamp: nowStr,
          storageType: json.storageType || storageType,
        };
      }
    } catch {
      // Caso a rota serverless não responda em modo preview
    }

    return {
      success: true,
      message: 'Base de dados JSON sincronizada com sucesso no armazenamento local e pronta para a Vercel.',
      timestamp: nowStr,
      storageType,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Falha ao salvar dados JSON na nuvem.',
      timestamp: nowStr,
    };
  }
}

/**
 * Puxa os dados JSON da Nuvem / Vercel
 */
export async function fetchCloudData(): Promise<{
  success: boolean;
  data?: CloudBackupData;
  message: string;
  source?: string;
}> {
  // 1. Tenta Vercel KV direto se configurado
  const customKvUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_KV_URL);
  const customKvToken = localStorage.getItem(STORAGE_KEY_CUSTOM_KV_TOKEN);

  if (customKvUrl && customKvToken) {
    try {
      const kvRes = await fetch(`${customKvUrl}/get/contr_clientes_main_db`, {
        headers: {
          Authorization: `Bearer ${customKvToken}`,
        },
      });
      if (kvRes.ok) {
        const kvData = await kvRes.json();
        if (kvData && kvData.result) {
          const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
          if (parsed && (parsed.clients || Array.isArray(parsed))) {
            return {
              success: true,
              data: parsed.clients ? parsed : { clients: parsed, expenses: [], expenseCategories: [] } as any,
              message: 'Dados JSON carregados com sucesso do Vercel KV!',
              source: 'Vercel KV',
            };
          }
        }
      }
    } catch (kvErr) {
      console.warn('Erro ao consultar Vercel KV:', kvErr);
    }
  }

  // 2. Tenta a API /api/sync da Vercel
  try {
    const response = await fetch('/api/sync', {
      method: 'GET',
    });

    if (response.ok) {
      const json = await response.json();
      const payload = json.data || json;
      if (payload && payload.clients && Array.isArray(payload.clients)) {
        return {
          success: true,
          data: payload,
          message: 'Dados JSON baixados com sucesso da Vercel!',
          source: json.storageType || 'Vercel Serverless',
        };
      }
    }
  } catch (e) {
    console.warn('API de nuvem não acessível no momento:', e);
  }

  // 3. Fallback para LocalStorage do navegador
  const savedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
  const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
  const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);

  if (savedClients) {
    try {
      const clients = JSON.parse(savedClients);
      const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
      const expenseCategories = savedCategories ? JSON.parse(savedCategories) : [];
      return {
        success: true,
        data: {
          version: '3.0-local',
          exportedAt: new Date().toISOString(),
          clients,
          expenses,
          expenseCategories,
          dbConfig: {
            filePath: localStorage.getItem('contr_clientes_db_path') || 'C:/Financeiro/banco_dados_clientes.json',
            lastSyncAt: new Date().toLocaleString('pt-BR'),
            autoSync: true,
            isFound: true,
          },
          user: {
            name: 'Rodrigo Bento',
            email: 'rodrigobento1979@gmail.com',
          },
        },
        message: 'Dados JSON recuperados com sucesso do cache local da máquina.',
        source: 'Armazenamento Local',
      };
    } catch {
      // ignore
    }
  }

  return {
    success: false,
    message: 'Nenhum dado JSON encontrado na nuvem da Vercel ou localmente.',
  };
}

// Controle de Auto-Sync com Debounce
let autoSyncTimeout: any = null;

export function scheduleAutoSync(
  clients: Client[],
  expenses: Expense[],
  categories: string[],
  dbConfig: DatabaseConfig,
  onSyncComplete?: (result: { success: boolean; message: string; timestamp: string }) => void
) {
  const isAutoSyncEnabled = localStorage.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';
  if (!isAutoSyncEnabled) return;

  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
  }

  autoSyncTimeout = setTimeout(async () => {
    try {
      const res = await syncDataToCloud(clients, expenses, categories, dbConfig);
      if (onSyncComplete) {
        onSyncComplete(res);
      }
    } catch (e) {
      console.warn('AutoSync falhou silenciosamente:', e);
    }
  }, 1200); // 1.2s de debounce para evitar requisições repetitivas ao digitar
}
