import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  Undo2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  CalendarDays,
  Plus,
  HelpCircle,
  Filter,
  DollarSign,
  Sun,
  Moon,
  ArrowUpDown,
  Users,
  CreditCard,
  Download,
  Upload,
  Database,
  ShieldAlert,
  FileJson,
  Settings,
  BarChart3,
  PieChart,
  FileCheck2,
  CheckSquare,
  Square,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { Client, Expense, AppTab, DatabaseConfig, UserAuth } from './types';
import { 
  formatCurrency, 
  formatDate, 
  formatDueDate, 
  getClientStatusForMonth, 
  getInitialClients,
  getDueDateForMonth,
  getInitialExpenses,
  formatYearMonth,
  isBillingIssuedForMonth
} from './utils/clientHelpers';
import { downloadBackupFile, syncDataToCloud, scheduleAutoSync, fetchCloudData, subscribeToSyncBroadcast } from './utils/cloudSync';
import MonthBar from './components/MonthBar';
import StatsSection from './components/StatsSection';
import ClientFormModal from './components/ClientFormModal';
import PaymentDialogModal from './components/PaymentDialogModal';
import ConfirmModal from './components/ConfirmModal';
import DashboardView from './components/DashboardView';
import SettingsModal from './components/SettingsModal';
import DatabaseNotFoundModal from './components/DatabaseNotFoundModal';
import LoginView from './components/LoginView';
import TopHeader from './components/TopHeader';
import SidebarNav from './components/SidebarNav';
import VercelSyncView from './components/VercelSyncView';
import MobileBottomNav from './components/MobileBottomNav';
import ClientDetailModal from './components/ClientDetailModal';
import { ClientCard } from './components/ClientCard';

// Data de "hoje" ancorada de acordo com o ambiente da aplicação (Junho de 2026)
const TODAY_STR = '2026-06-04';

// Retorna uma classe de cores pastel estável e determinística com base no nome do tipo da categoria
const getCategoryColorClass = (category: string) => {
  const colors = [
    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/15',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15',
    'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/15',
    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/15',
    'bg-indigo-500/10 text-indigo-150 dark:text-indigo-400 border-indigo-500/15',
    'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/15',
    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/15',
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function App() {
  // --- Autenticação de Usuário ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const localAuth = localStorage.getItem('contr_clientes_is_authenticated');
    const sessionAuth = sessionStorage.getItem('contr_clientes_is_authenticated');
    return localAuth === 'true' || sessionAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserAuth>(() => {
    const savedUser = localStorage.getItem('contr_clientes_auth_user') || sessionStorage.getItem('contr_clientes_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    return {
      id: 'user-default',
      name: 'Rodrigo Bento',
      email: 'rodrigobento1979@gmail.com',
      role: 'admin',
      avatarColor: 'bg-indigo-600',
    };
  });

  // Banner informativo superior (estilo da imagem com botão de dispensar)
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // --- Estados do Sistema ---
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('contr_clientes_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro de decodificação no localStorage:', e);
      }
    }
    return getInitialClients();
  });

  const [selectedYearMonth, setSelectedYearMonth] = useState('2026-06');
  const [filterDueDate, setFilterDueDate] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');
  const [sortBy, setSortBy] = useState<'vencimento' | 'nome' | 'padrao'>('vencimento');

  // --- Estados do Módulo e Navegação ---
  const [activeTab, setActiveTab] = useState<AppTab>('clientes');
  const [dashboardYear, setDashboardYear] = useState<number>(2026);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDbNotFoundModalOpen, setIsDbNotFoundModalOpen] = useState(false);

  // Configurações do Banco de Dados JSON Local
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => {
    const savedPath = localStorage.getItem('contr_clientes_db_path') || 'C:/Financeiro/banco_dados_clientes.json';
    const savedLastSync = localStorage.getItem('contr_clientes_db_last_sync') || new Date().toLocaleString();
    return {
      filePath: savedPath,
      lastSyncAt: savedLastSync,
      autoSync: true,
      isFound: true,
    };
  });

  const [expCategories, setExpCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('contr_clientes_expense_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro de decodificação no localStorage de categorias de despesas:', e);
      }
    }
    return ['Infraestrutura', 'Marketing', 'Serviços', 'Salários', 'Impostos', 'Outros'];
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('contr_clientes_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro de decodificação no localStorage de despesas:', e);
      }
    }
    return getInitialExpenses();
  });

  // Campos de Formulário de Despesa
  const [expId, setExpId] = useState<string | null>(null);
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState(() => {
    // Inicializar com o primeiro elemento disponível, ou fallback
    const savedCats = localStorage.getItem('contr_clientes_expense_categories');
    if (savedCats) {
      try {
        const parsed = JSON.parse(savedCats);
        if (parsed && parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return 'Infraestrutura';
  });
  const [expPayer, setExpPayer] = useState<'Rodrigo' | 'Aryadner'>('Rodrigo');
  const [expValue, setExpValue] = useState('');
  const [expPaymentDate, setExpPaymentDate] = useState(TODAY_STR);
  const [expYearMonth, setExpYearMonth] = useState('2026-06');
  const [expNotes, setExpNotes] = useState('');

  // Filtros de busca de despesas
  const [expSearchQuery, setExpSearchQuery] = useState('');
  const [expCategoryFilter, setExpCategoryFilter] = useState<string>('todos');
  const [expPayerFilter, setExpPayerFilter] = useState<string>('todos');
  const [expShowAllMonths, setExpShowAllMonths] = useState(false);

  // Sincronizar categorias de despesas no localStorage
  useEffect(() => {
    localStorage.setItem('contr_clientes_expense_categories', JSON.stringify(expCategories));
  }, [expCategories]);

  // Sincronizar mês do formulário com o mês global selecionado
  useEffect(() => {
    setExpYearMonth(selectedYearMonth);
  }, [selectedYearMonth]);

  // Tema (light / dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('contr_clientes_theme') as 'light' | 'dark') || 'dark';
  });

  // Controle de Modais
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentClient, setPaymentClient] = useState<Client | null>(null);

  // Modal de Detalhes do Cliente (especialmente otimizado para mobile)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailClient, setSelectedDetailClient] = useState<Client | null>(null);

  // Modal de Confirmação Customizado para substituir os dialogos nativos de exclusao e estorno
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Efeito para sincronizar e aplicar classe do tema no elemento HTML raiz
  useEffect(() => {
    localStorage.setItem('contr_clientes_theme', theme);
    const root = document.documentElement;
    if (root) {
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Mensagens de ajuda / Feedback rápido
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Sincronização e Busca Automática da Nuvem / JSON na Abertura (PC e Celular)
  useEffect(() => {
    async function loadLatestSystemData(silent = false) {
      try {
        if (!silent) setIsCloudSyncing(true);
        const cloudResult = await fetchCloudData();
        if (cloudResult.success && cloudResult.data && cloudResult.data.clients && cloudResult.data.clients.length > 0) {
          setClients(cloudResult.data.clients);
          if (cloudResult.data.expenses && Array.isArray(cloudResult.data.expenses)) {
            setExpenses(cloudResult.data.expenses);
          }
          if (cloudResult.data.expenseCategories && Array.isArray(cloudResult.data.expenseCategories)) {
            setExpCategories(cloudResult.data.expenseCategories);
          }
          if (!silent) {
            showToast(`✓ Base JSON carregada (${cloudResult.data.clients.length} clientes sincronizados)`, 'success');
          }
        }
      } catch (e) {
        console.warn('Sincronização de nuvem em segundo plano:', e);
      } finally {
        if (!silent) setIsCloudSyncing(false);
      }
    }

    loadLatestSystemData(false);

    // Atualiza automaticamente quando a tela ganha foco (ao voltar do celular para PC ou vice-versa)
    const handleFocus = () => {
      loadLatestSystemData(true);
    };

    // Escuta sincronizações disparadas por outras abas / instâncias
    const unsubscribeBroadcast = subscribeToSyncBroadcast(() => {
      loadLatestSystemData(true);
    });

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      unsubscribeBroadcast();
    };
  }, []);

  // Sincronização Manual sob Demanda (1 Clique para enviar do PC ao Celular)
  const handleManualSync = async () => {
    setIsCloudSyncing(true);
    try {
      const res = await syncDataToCloud(clients, expenses, expCategories, dbConfig, currentUser.name, currentUser.email);
      if (res.success) {
        showToast('✓ Dados gravados no JSON do sistema e sincronizados com sucesso!', 'success');
      } else {
        showToast('Aviso: ' + res.message, 'info');
      }
    } catch (e: any) {
      showToast('Erro ao sincronizar com JSON: ' + e?.message, 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Persistir clientes no localStorage e gravar automaticamente no JSON do sistema
  useEffect(() => {
    localStorage.setItem('contr_clientes_data', JSON.stringify(clients));
    scheduleAutoSync(clients, expenses, expCategories, dbConfig);
  }, [clients]);

  // Persistir despesas no localStorage e gravar automaticamente no JSON do sistema
  useEffect(() => {
    localStorage.setItem('contr_clientes_expenses', JSON.stringify(expenses));
    scheduleAutoSync(clients, expenses, expCategories, dbConfig);
  }, [expenses]);

  // Persistir categorias de despesas e gravar automaticamente no JSON do sistema
  useEffect(() => {
    localStorage.setItem('contr_clientes_expense_categories', JSON.stringify(expCategories));
    scheduleAutoSync(clients, expenses, expCategories, dbConfig);
  }, [expCategories]);

  // Verificação de Inicialização do Banco de Dados (.JSON) na Abertura do Sistema
  useEffect(() => {
    const savedClients = localStorage.getItem('contr_clientes_data');
    const savedExpenses = localStorage.getItem('contr_clientes_expenses');
    const dbStatus = localStorage.getItem('contr_clientes_db_status');

    if (dbStatus === 'not_found' || (!savedClients && !savedExpenses && clients.length === 0 && expenses.length === 0)) {
      setIsDbNotFoundModalOpen(true);
      setDbConfig(prev => ({ ...prev, isFound: false }));
    }
  }, []);

  // Atualizar Caminho do Banco de Dados
  const handleUpdateDbPath = (newPath: string) => {
    setDbConfig(prev => ({
      ...prev,
      filePath: newPath,
      isFound: true,
      lastSyncAt: new Date().toLocaleString()
    }));
    localStorage.setItem('contr_clientes_db_path', newPath);
    localStorage.setItem('contr_clientes_db_status', 'found');
    showToast(`Caminho do banco configurado: "${newPath}".`, 'success');
  };

  // Limpar Todos os Dados com Confirmação
  const handleClearAllData = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Limpar Todos os Dados do Sistema',
      description: 'Atenção! Esta ação apagar todos os clientes, históricos de pagamento e despesas. Deseja continuar e redefinir a base?',
      isDanger: true,
      confirmText: 'Sim, Apagar Tudo',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setClients([]);
        setExpenses([]);
        localStorage.removeItem('contr_clientes_data');
        localStorage.removeItem('contr_clientes_expenses');
        localStorage.setItem('contr_clientes_db_status', 'not_found');
        setDbConfig(prev => ({ ...prev, isFound: false }));
        setIsSettingsModalOpen(false);
        setIsDbNotFoundModalOpen(true);
        showToast('Todos os dados foram redefinidos.', 'info');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Mostrar mensagens flutuantes temporárias
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- Sistema de Backup e Restauração (.JSON) ---
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        clients,
        expenses,
        expCategories,
        theme
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `backup_controle_clientes_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Arquivo de backup exportado no seu PC!', 'success');
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      showToast('Ocorreu um erro ao gerar o arquivo de backup.', 'error');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data || typeof data !== 'object') {
          showToast('Arquivo de backup em formato inválido.', 'error');
          return;
        }

        let restoredAnything = false;

        if (Array.isArray(data.clients)) {
          setClients(data.clients);
          localStorage.setItem('contr_clientes_data', JSON.stringify(data.clients));
          restoredAnything = true;
        }

        if (Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
          localStorage.setItem('contr_clientes_expenses', JSON.stringify(data.expenses));
          restoredAnything = true;
        }

        if (Array.isArray(data.expCategories)) {
          setExpCategories(data.expCategories);
          localStorage.setItem('contr_clientes_expense_categories', JSON.stringify(data.expCategories));
          restoredAnything = true;
        }

        if (data.theme === 'light' || data.theme === 'dark') {
          setTheme(data.theme);
          localStorage.setItem('contr_clientes_theme', data.theme);
        }

        if (restoredAnything) {
          localStorage.setItem('contr_clientes_db_status', 'found');
          setDbConfig(prev => ({
            ...prev,
            isFound: true,
            lastSyncAt: new Date().toLocaleString()
          }));
          showToast('Backup restaurado com sucesso! Dados recarregados.', 'success');
          setIsBackupModalOpen(false);
          setIsDbNotFoundModalOpen(false);
          setIsSettingsModalOpen(false);
        } else {
          showToast('Nenhum dado compatível foi encontrado no arquivo.', 'error');
        }
      } catch (err) {
        console.error('Erro ao ler arquivo de backup:', err);
        showToast('Erro ao ler arquivo JSON. Verifique o formato.', 'error');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- Operações de Clientes ---
  
  // Salvar adição ou edição de cliente
  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'paymentHistory'> & { id?: string }) => {
    if (clientData.id) {
      // Edição
      setClients(prev => prev.map(c => {
        if (c.id === clientData.id) {
          return {
            ...c,
            name: clientData.name,
            dueDateDay: clientData.dueDateDay,
            value: clientData.value,
            contractType: clientData.contractType,
            notes: clientData.notes,
            status: clientData.status,
            billingStartDate: clientData.billingStartDate,
            billingEndDate: clientData.billingEndDate,
          };
        }
        return c;
      }));
      showToast(`Cliente "${clientData.name}" atualizado com sucesso!`, 'success');
    } else {
      // Criação de novo cliente
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: clientData.name,
        dueDateDay: clientData.dueDateDay,
        value: clientData.value,
        contractType: clientData.contractType,
        notes: clientData.notes,
        status: 'ativo',
        createdAt: TODAY_STR,
        paymentHistory: [],
        issuedBillingMonths: [],
        billingStartDate: clientData.billingStartDate,
        billingEndDate: clientData.billingEndDate,
      };
      setClients(prev => [newClient, ...prev]);
      showToast(`Cliente "${clientData.name}" cadastrado com sucesso!`, 'success');
    }
    setEditingClient(null);
  };

  // Excluir cliente físico
  const handleDeleteClient = (clientId: string, name: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Excluir Cliente do Sistema',
      description: `Tem certeza absoluta de que deseja excluir o cliente "${name}" do sistema? Todos os dados de históricos de pagamentos serão perdidos permanentemente de forma irreversível.`,
      isDanger: true,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setClients(prev => prev.filter(c => c.id !== clientId));
        showToast(`Cliente "${name}" excluído.`, 'info');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Desativar ou ativar cliente rapidamente
  const toggleClientStatus = (clientId: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const newStatus = c.status === 'ativo' ? 'inativo' : 'ativo';
        showToast(`Cliente "${c.name}" foi marcado como ${newStatus}.`, 'info');
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  // Registrar pagamento para o mês selecionado
  const handleConfirmPayment = (clientId: string, yearMonth: string, paymentDate: string, amount: number) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        // Remover duplicatas caso o usuário já tenha pago este mês por engano
        const cleanHistory = c.paymentHistory.filter(p => p.yearMonth !== yearMonth);
        const newHistory = [
          ...cleanHistory,
          { yearMonth, paymentDate, amount }
        ];

        // Atualizar "data do último pagamento" ordenando o histórico
        const sortedHistory = [...newHistory].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
        const lastPayDate = sortedHistory.length > 0 ? sortedHistory[0].paymentDate : paymentDate;

        // Auto-marcar cobrança como emitida ao confirmar recebimento
        const currentIssued = Array.isArray(c.issuedBillingMonths) ? [...c.issuedBillingMonths] : [];
        const updatedIssued = currentIssued.includes(yearMonth) ? currentIssued : [...currentIssued, yearMonth];

        return {
          ...c,
          paymentHistory: newHistory,
          lastPaymentDate: lastPayDate,
          issuedBillingMonths: updatedIssued
        };
      }
      return c;
    }));
    
    const clientObj = clients.find(c => c.id === clientId);
    if (clientObj) {
      showToast(`Recebimento de ${formatCurrency(amount)} registrado para "${clientObj.name}"!`, 'success');
    }
  };

  // Alternar emissão de cobrança de um cliente no mês selecionado
  const handleToggleBillingIssued = (clientId: string, yearMonth: string) => {
    const clientObj = clients.find(c => c.id === clientId);
    if (!clientObj) return;

    const currentIssued = Array.isArray(clientObj.issuedBillingMonths) ? [...clientObj.issuedBillingMonths] : [];
    const isCurrentlyIssued = currentIssued.includes(yearMonth);
    const updatedIssued = isCurrentlyIssued
      ? currentIssued.filter(m => m !== yearMonth)
      : [...currentIssued, yearMonth];

    setClients(prev => prev.map(c => c.id === clientId ? { ...c, issuedBillingMonths: updatedIssued } : c));

    if (!isCurrentlyIssued) {
      showToast(`Cobrança de "${clientObj.name}" marcada como EMITIDA para ${formatYearMonth(yearMonth)}! 📄✓`, 'success');
    } else {
      showToast(`Cobrança de "${clientObj.name}" desmarcada como emitida para ${formatYearMonth(yearMonth)}.`, 'info');
    }
  };

  // Marcar/Desmarcar todas as cobranças do mês selecionado em lote
  const handleBatchSetBillingIssued = (yearMonth: string, setIssued: boolean) => {
    setClients(prev => prev.map(c => {
      const currentStatus = getClientStatusForMonth(c, yearMonth, TODAY_STR);
      if (currentStatus === 'sem_cobranca' || c.status === 'inativo') return c;

      const currentIssued = Array.isArray(c.issuedBillingMonths) ? [...c.issuedBillingMonths] : [];
      const hasMonth = currentIssued.includes(yearMonth);

      if (setIssued && !hasMonth) {
        return { ...c, issuedBillingMonths: [...currentIssued, yearMonth] };
      } else if (!setIssued && hasMonth) {
        return { ...c, issuedBillingMonths: currentIssued.filter(m => m !== yearMonth) };
      }
      return c;
    }));

    if (setIssued) {
      showToast(`Todas as cobranças de ${formatYearMonth(yearMonth)} foram marcadas como EMITIDAS!`, 'success');
    } else {
      showToast(`Todas as cobranças de ${formatYearMonth(yearMonth)} foram desmarcadas como emitidas.`, 'info');
    }
  };

  // Estornar / Reverter pagamento de um mês selecionado
  const handleUndoPayment = (clientId: string, yearMonth: string) => {
    const clientObj = clients.find(c => c.id === clientId);
    const clientName = clientObj ? clientObj.name : 'Cliente';
    
    setConfirmModalConfig({
      isOpen: true,
      title: 'Estornar Recebimento de Mensalidade',
      description: `Deseja realmente estornar/cancelar o recebimento registrado de "${clientName}" para este mês de referência (${yearMonth})? O recebimento será excluído do histórico deste cliente.`,
      isDanger: true,
      confirmText: 'Estornar Recebimento',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setClients(prev => prev.map(c => {
          if (c.id === clientId) {
            const updatedHistory = c.paymentHistory.filter(p => p.yearMonth !== yearMonth);
            // O último pagamento agora é o pagamento mais recente que sobrou no histórico
            const sortedHistory = [...updatedHistory].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
            const newLastPaymentDate = sortedHistory.length > 0 ? sortedHistory[0].paymentDate : undefined;
            
            return {
              ...c,
              paymentHistory: updatedHistory,
              lastPaymentDate: newLastPaymentDate
            };
          }
          return c;
        }));
        showToast('Pagamento revertido com sucesso.', 'info');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- Operações de Despesas ---
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim()) {
      showToast('Digite a descrição da despesa.', 'error');
      return;
    }
    const valNum = Number(expValue);
    if (!expValue || isNaN(valNum) || valNum <= 0) {
      showToast('Insira um valor válido de despesa.', 'error');
      return;
    }
    if (!expYearMonth) {
      showToast('Selecione o mês de referência.', 'error');
      return;
    }
    if (!expPaymentDate) {
      showToast('Selecione a data de pagamento.', 'error');
      return;
    }

    if (expId) {
      // Edição de despesa existente
      setExpenses(prev => prev.map(item => {
        if (item.id === expId) {
          return {
            ...item,
            description: expDescription.trim(),
            category: expCategory,
            payer: expPayer,
            value: valNum,
            paymentDate: expPaymentDate,
            yearMonth: expYearMonth,
            notes: expNotes.trim()
          };
        }
        return item;
      }));
      showToast(`Despesa "${expDescription}" atualizada com sucesso!`, 'success');
    } else {
      // Nova Despesa
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        description: expDescription.trim(),
        category: expCategory,
        payer: expPayer,
        value: valNum,
        paymentDate: expPaymentDate,
        yearMonth: expYearMonth,
        notes: expNotes.trim()
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast(`Despesa "${expDescription}" lançada com sucesso!`, 'success');
    }

    // Resetar campos
    setExpId(null);
    setExpDescription('');
    setExpCategory(expCategories[0] || 'Outros');
    setExpPayer('Rodrigo');
    setExpValue('');
    setExpNotes('');
  };

  const handleEditExpenseInline = (exp: Expense) => {
    setExpId(exp.id);
    setExpDescription(exp.description);
    setExpCategory(exp.category);
    setExpPayer(exp.payer || 'Rodrigo');
    setExpValue(String(exp.value));
    setExpPaymentDate(exp.paymentDate);
    setExpYearMonth(exp.yearMonth);
    setExpNotes(exp.notes || '');
    
    // Rola para o topo do formulário no celular
    const formEl = document.getElementById('expense-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteExpense = (expenseId: string, desc: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Excluir Lançamento de Despesa',
      description: `Deseja realmente excluir permanentemente o lançamento da despesa de "${desc}"? Esta ação removerá o registro financeiro de forma irreversível.`,
      isDanger: true,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        showToast(`Despesa "${desc}" excluída com sucesso.`, 'info');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        // Se a despesa excluída for a que está sob edição, limpar o form
        if (expId === expenseId) {
          setExpId(null);
          setExpDescription('');
          setExpCategory(expCategories[0] || 'Outros');
          setExpValue('');
          setExpNotes('');
        }
      }
    });
  };

  const handleCancelEditExpense = () => {
    setExpId(null);
    setExpDescription('');
    setExpCategory(expCategories[0] || 'Outros');
    setExpValue('');
    setExpNotes('');
  };

  // --- Processamento de Estatísticas Financeiras ---
  const stats = useMemo(() => {
    // Apenas consideramos clientes com status 'ativo' nas estimativas de recebimento
    const activeClientsList = clients.filter(c => c.status === 'ativo');
    const totalClientsCount = activeClientsList.length;

    // Clientes que devem ter cobrança gerada neste mês
    const billableClients = activeClientsList.filter(
      c => getClientStatusForMonth(c, selectedYearMonth, TODAY_STR) !== 'sem_cobranca'
    );
    const billableClientsCount = billableClients.length;

    // Quantas cobranças já foram marcadas como emitidas para o mês selecionado
    const issuedChargesCount = billableClients.filter(c => 
      isBillingIssuedForMonth(c, selectedYearMonth)
    ).length;

    // Faturamento esperado total (soma de contratos ativos que devem ser cobrados no mês selecionado)
    const expectedRevenue = billableClients.reduce((sum, c) => sum + c.value, 0);

    // Faturamento recebido no mês (soma de pagamentos registrados nesse ANO-MÊS, independente do cliente estar ou não desativado agora)
    const paymentsInMonth = clients.flatMap(c => 
      c.paymentHistory.filter(p => p.yearMonth === selectedYearMonth)
    );
    const receivedRevenue = paymentsInMonth.reduce((sum, p) => sum + p.amount, 0);

    // Pendente de Recebimento (clientes ativos que não pagaram o mês selecionado ainda e devem ser cobrados)
    const pendingRevenue = activeClientsList
      .filter(c => {
        const currentMonthStatus = getClientStatusForMonth(c, selectedYearMonth, TODAY_STR);
        return currentMonthStatus !== 'pago' && currentMonthStatus !== 'sem_cobranca';
      })
      .reduce((sum, c) => sum + c.value, 0);

    const paidPercentage = expectedRevenue > 0 ? (receivedRevenue / expectedRevenue) * 100 : 0;

    return {
      totalClientsCount,
      billableClientsCount,
      issuedChargesCount,
      expectedRevenue,
      receivedRevenue,
      pendingRevenue,
      paidPercentage: Math.min(100, paidPercentage),
    };
  }, [clients, selectedYearMonth]);


  // --- Filtragem dos Clientes para Exibição ---
  const filteredClients = useMemo(() => {
    const filtered = clients.filter(c => {
      // 1. Filtrar pelo vencimento (dia)
      if (filterDueDate !== 'todos') {
        if (filterDueDate === '1-10') {
          if (c.dueDateDay < 1 || c.dueDateDay > 10) return false;
        } else if (filterDueDate === '11-20') {
          if (c.dueDateDay < 11 || c.dueDateDay > 20) return false;
        } else if (filterDueDate === '21-31') {
          if (c.dueDateDay < 21 || c.dueDateDay > 31) return false;
        } else {
          // Dia específico (ex: "5", "10", "15")
          if (c.dueDateDay !== Number(filterDueDate)) return false;
        }
      }

      // 2. Filtrar pelo status de pagamento do mês selecionado
      const currentMonthStatus = getClientStatusForMonth(c, selectedYearMonth, TODAY_STR);
      if (filterStatus === 'pago' && currentMonthStatus !== 'pago') return false;
      if (filterStatus === 'pendente' && currentMonthStatus !== 'pendente') return false;
      if (filterStatus === 'atrasado' && currentMonthStatus !== 'atrasado') return false;

      return true;
    });

    // Ordenação
    if (sortBy === 'nome') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Padrão / Vencimento: Ordena por dia do vencimento crescente
    return [...filtered].sort((a, b) => {
      if (a.dueDateDay !== b.dueDateDay) {
        return a.dueDateDay - b.dueDateDay;
      }
      return a.name.localeCompare(b.name);
    });
  }, [clients, filterDueDate, filterStatus, selectedYearMonth, sortBy]);

  // --- Módulos auxiliares de controle de despesas ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(expSearchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(expSearchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (expCategoryFilter !== 'todos' && e.category !== expCategoryFilter) return false;

      if (expPayerFilter !== 'todos' && (e.payer || 'Rodrigo') !== expPayerFilter) return false;

      if (!expShowAllMonths && e.yearMonth !== selectedYearMonth) return false;

      return true;
    }).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [expenses, expSearchQuery, expCategoryFilter, expPayerFilter, expShowAllMonths, selectedYearMonth]);

  const expenseTotalsInSelectedMonth = useMemo(() => {
    const monthExpenses = expenses.filter(e => e.yearMonth === selectedYearMonth);
    const total = monthExpenses.reduce((sum, e) => sum + e.value, 0);
    const rodrigoTotal = monthExpenses
      .filter(e => (e.payer || 'Rodrigo') === 'Rodrigo')
      .reduce((sum, e) => sum + e.value, 0);
    const aryadnerTotal = monthExpenses
      .filter(e => e.payer === 'Aryadner')
      .reduce((sum, e) => sum + e.value, 0);

    return {
      total,
      rodrigoTotal,
      aryadnerTotal,
      // O saldo abatível leva em consideração apenas o pago por Rodrigo
      deductible: rodrigoTotal
    };
  }, [expenses, selectedYearMonth]);

  const totalExpensesInSelectedMonth = expenseTotalsInSelectedMonth.total;

  // Logout e Limpeza de Sessão
  const handleLogout = () => {
    localStorage.removeItem('contr_clientes_is_authenticated');
    sessionStorage.removeItem('contr_clientes_is_authenticated');
    setIsAuthenticated(false);
    showToast('Sessão encerrada com segurança.', 'info');
  };

  // Download Rápido de Backup do Cabeçalho
  const handleQuickBackup = () => {
    downloadBackupFile(clients, expenses, expCategories, dbConfig, currentUser.name, currentUser.email);
    showToast('Backup JSON baixado com sucesso!', 'success');
  };

  // Se não estiver logado, exibe a tela de login exclusiva
  if (!isAuthenticated) {
    return (
      <LoginView 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          showToast(`Bem-vindo ao sistema, ${user.name}!`, 'success');
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen w-full font-sans flex flex-col antialiased relative overflow-x-hidden transition-colors duration-300 theme-bg ${
      theme === 'dark' ? 'dark' : 'light'
    }`}>
      
      {/* Background Mesh Gradients - suaves e confortáveis */}
      <div className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[125px] pointer-events-none transition-all duration-500 ${
        theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-300/20'
      }`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[125px] pointer-events-none transition-all duration-500 ${
        theme === 'dark' ? 'bg-emerald-500/8' : 'bg-emerald-300/15'
      }`}></div>

      {/* Barra de notificações / Feedback */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 animate-slide-in ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-300' 
              : toastMessage.type === 'error' 
                ? 'bg-rose-950/95 border-rose-500/30 text-rose-300' 
                : 'bg-indigo-950/95 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <div className={`p-1 rounded-full ${
            toastMessage.type === 'success' ? 'bg-emerald-500/10' : toastMessage.type === 'error' ? 'bg-rose-500/10' : 'bg-indigo-500/10'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toastMessage.type === 'info' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
          </div>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cabeçalho Superior Executivo com Perfil, Backup e Status de Nuvem */}
      <TopHeader 
        user={currentUser}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onQuickBackup={handleQuickBackup}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
        onOpenSyncTab={() => setActiveTab('sync')}
        isSyncing={isCloudSyncing}
        onTriggerSync={handleManualSync}
      />

      {/* Banner Informativo Superior (estilo da imagem com botão de fechar) */}
      {isBannerVisible && (
        <div className="w-full bg-[#3b0764] dark:bg-[#2b084b] text-purple-100 px-4 py-2 flex items-center justify-between border-b border-purple-800/60 shadow-xs z-30 transition-all shrink-0">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-400/50 animate-pulse"></span>
              <p className="text-xs font-semibold text-white/90">
                <strong className="text-white font-black">Banco de dados fiscal e financeiro verificado e ativo na sua máquina.</strong> Pronto para operar cobranças, lançamentos e sincronização na Vercel.
              </p>
            </div>
            <button 
              type="button"
              id="dismiss-status-banner-btn"
              onClick={() => setIsBannerVisible(false)}
              className="text-purple-300 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium shrink-0"
              title="Ocultar aviso"
            >
              <span>Fechar</span>
              <span className="font-bold">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Painel Central com Layout Responsivo de 2 Colunas (Menu Lateral + Área de Conteúdo) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4 relative z-10 pb-20 sm:pb-24 lg:pb-6">
        
        {/* Coluna Esquerda: Menu Lateral de Ações e Auditoria */}
        <SidebarNav 
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenNewClientModal={() => {
            setEditingClient(null);
            setIsClientModalOpen(true);
          }}
          onOpenNewExpenseModal={() => {
            setActiveTab('despesas');
            setExpId(null);
            setExpDescription('');
            setExpValue('');
            setExpNotes('');
          }}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          clientsCount={clients.length}
          expensesCount={expenses.length}
        />

        {/* Coluna Direita: Área de Conteúdo das Abas */}
        <main className="flex-1 flex flex-col space-y-3.5 pb-24 sm:pb-28 lg:pb-8">
          
          {activeTab === 'sync' ? (
            <VercelSyncView 
              clients={clients}
              expenses={expenses}
              categories={expCategories}
              dbConfig={dbConfig}
              onRestoreData={(newClients, newExpenses, newCategories) => {
                setClients(newClients);
                setExpenses(newExpenses);
                setExpCategories(newCategories);
                localStorage.setItem('contr_clientes_data', JSON.stringify(newClients));
                localStorage.setItem('contr_clientes_expenses', JSON.stringify(newExpenses));
                localStorage.setItem('contr_clientes_expense_categories', JSON.stringify(newCategories));
              }}
              onShowFeedback={(msg) => showToast(msg, 'success')}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardView 
              clients={clients}
              expenses={expenses}
              currentYear={dashboardYear}
              onYearChange={(newYear) => setDashboardYear(newYear)}
              theme={theme}
            />
          ) : (
            <>
              {/* Componente 1: Barra de Seleção de Mês */}
              <MonthBar 
                selectedYearMonth={selectedYearMonth} 
                onChange={(newVal) => setSelectedYearMonth(newVal)} 
              />

              {/* Componente 2: Seção de Métricas / Estatísticas de Desempenho Mensal */}
              <StatsSection 
                totalClientsCount={stats.totalClientsCount}
                expectedRevenue={stats.expectedRevenue}
                receivedRevenue={stats.receivedRevenue}
                pendingRevenue={stats.pendingRevenue}
                paidPercentage={stats.paidPercentage}
                issuedChargesCount={stats.issuedChargesCount}
                billableClientsCount={stats.billableClientsCount}
              />

            {/* Abas de Exibição Condicionais */}
            {activeTab === 'clientes' ? (
          <>
            {/* Filtros e Busca de Clientes */}
            <div id="filters-container" className="theme-card rounded-xl p-3.5 relative z-10 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Título e Contagem de Clientes */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold theme-title">Clientes Cadastrados</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {filteredClients.length} de {clients.length}
                    </span>
                  </div>
                  <p className="text-[11px] theme-text-secondary mt-0.5">Gerencie os status e pagamentos com visualização simplificada</p>
                </div>

                {/* Controles de Filtragem Rápida: Vencimento + Status + Ordenação */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Filtro do Vencimento */}
                  <div className="flex items-center gap-1 min-w-max">
                    <span className="text-[11px] font-semibold theme-text-secondary flex items-center gap-1 mr-1">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> Vencimento:
                    </span>
                    <div className="flex gap-0.5 border p-0.5 rounded-lg transition-all" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: '1-10', label: 'Dia 01 a 10' },
                        { id: '11-20', label: 'Dia 11 a 20' },
                        { id: '21-31', label: 'Dia 21 a 31' },
                      ].map((item) => {
                        const isActive = filterDueDate === item.id;
                        return (
                          <button
                            id={`filter-duedate-btn-${item.id}`}
                            key={item.id}
                            onClick={() => setFilterDueDate(item.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-500/15 theme-title border border-indigo-500/20 font-extrabold shadow-xs' 
                                : 'theme-text-secondary hover:text-indigo-400 border border-transparent'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtro do Status de Pagamento */}
                  <div className="flex items-center gap-1 min-w-max">
                    <span className="text-[11px] font-semibold theme-text-secondary mr-1">Status:</span>
                    <div className="flex gap-0.5 border p-0.5 rounded-lg transition-all" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'pago', label: 'Pagos' },
                        { id: 'pendente', label: 'Pendentes' },
                        { id: 'atrasado', label: 'Atrasados' },
                      ].map((status) => {
                        const isActive = filterStatus === status.id;
                        return (
                          <button
                            id={`filter-status-btn-${status.id}`}
                            key={status.id}
                            onClick={() => setFilterStatus(status.id as any)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-500/15 theme-title border border-indigo-500/25 font-bold' 
                                : 'theme-text-secondary hover:text-indigo-400 border border-transparent'
                            }`}
                          >
                            {status.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordenar por */}
                  <div className="flex items-center gap-1 min-w-max">
                    <span className="text-[11px] font-semibold theme-text-secondary flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                    </span>
                    <div className="flex gap-0.5 border p-0.5 rounded-lg transition-all" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
                      {[
                        { id: 'vencimento', label: 'Por Vencimento' },
                        { id: 'nome', label: 'Por Nome' },
                      ].map((item) => {
                        const isActive = sortBy === item.id || (sortBy === 'padrao' && item.id === 'vencimento');
                        return (
                          <button
                            id={`sort-btn-${item.id}`}
                            key={item.id}
                            onClick={() => setSortBy(item.id as any)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              isActive 
                                 ? 'bg-indigo-500/15 theme-title border border-indigo-500/20 font-extrabold shadow-xs' 
                                 : 'theme-text-secondary hover:text-indigo-400 border border-transparent'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Listagem de Clientes */}
            {filteredClients.length === 0 ? (
              <div id="no-clients-banner" className="theme-card rounded-xl py-8 px-4 flex flex-col items-center text-center relative z-10">
                <div className="p-3 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full mb-3">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold theme-title">Nenhum cliente encontrado</h3>
                <p className="text-xs theme-text-secondary max-w-sm mt-1">
                  Não há clientes correspondentes ao filtro de vencimento ou status selecionado.
                </p>
                {(filterDueDate !== 'todos' || filterStatus !== 'todos') && (
                  <button
                    id="reset-filters-btn"
                    onClick={() => {
                      setFilterDueDate('todos');
                      setFilterStatus('todos');
                      setSortBy('vencimento');
                    }}
                    className="mt-3 px-3 py-1.5 theme-btn-secondary text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div id="client-cards-container" className="space-y-2 lg:space-y-2.5 relative z-10 pb-6">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    selectedYearMonth={selectedYearMonth}
                    todayStr={TODAY_STR}
                    onSelectDetail={(c) => {
                      setSelectedDetailClient(c);
                      setIsDetailModalOpen(true);
                    }}
                    onOpenPayment={(c) => {
                      setPaymentClient(c);
                      setIsPaymentModalOpen(true);
                    }}
                    onUndoPayment={handleUndoPayment}
                    onToggleIssued={handleToggleBillingIssued}
                    onEditClient={(c) => {
                      setEditingClient(c);
                      setIsClientModalOpen(true);
                    }}
                    onDeleteClient={handleDeleteClient}
                    getClientStatusForMonth={getClientStatusForMonth}
                    isBillingIssuedForMonth={isBillingIssuedForMonth}
                    getDueDateForMonth={getDueDateForMonth}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    formatYearMonth={formatYearMonth}
                  />
                ))}
                {/* Espaçador de segurança para que o último card nunca seja cortado ou tapado */}
                <div className="h-20 lg:h-8 w-full shrink-0" aria-hidden="true" />
              </div>
            )}
            </>
          ) : (
            <div id="expenses-tab-container" className="space-y-3.5 relative z-10 animate-fade-in">
            {/* Linha de Mini-métricas de Fluxo de Caixa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Receitas Recebidas */}
              <div className="theme-card rounded-xl p-3 border flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/10">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold theme-text-secondary block tracking-wider">Receitas (Mês)</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.receivedRevenue)}</span>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Entradas</span>
              </div>

              {/* Total Despesas com Split Rodrigo / Aryadner */}
              <div className="theme-card rounded-xl p-3 border flex items-center justify-between relative" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/10 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold theme-text-secondary block tracking-wider">Despesas Totais</span>
                    <span className="text-base font-extrabold text-rose-600 dark:text-rose-450 truncate block">{formatCurrency(totalExpensesInSelectedMonth)}</span>
                    <div className="flex items-center gap-1.5 text-[9px] mt-0.5">
                      <span className="text-sky-600 dark:text-sky-400 font-bold" title="Pago por Rodrigo (abate do saldo recebido)">
                        R: {formatCurrency(expenseTotalsInSelectedMonth.rodrigoTotal)}
                      </span>
                      <span className="theme-text-muted">•</span>
                      <span className="text-pink-600 dark:text-pink-400 font-bold" title="Pago por Aryadner (não abate do saldo recebido)">
                        A: {formatCurrency(expenseTotalsInSelectedMonth.aryadnerTotal)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold shrink-0 self-start">Saídas</span>
              </div>

              {/* Totalizador por Responsável */}
              <div className="theme-card rounded-xl p-3 border flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2.5 w-full">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/10 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="w-full">
                    <span className="text-[9px] uppercase font-bold theme-text-secondary block tracking-wider">Quem Pagou</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-md px-2 py-1">
                        <span className="text-[8px] font-extrabold text-sky-600 dark:text-sky-400 uppercase block leading-none">Rodrigo (Abate)</span>
                        <span className="text-xs font-black text-sky-700 dark:text-sky-300">{formatCurrency(expenseTotalsInSelectedMonth.rodrigoTotal)}</span>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-md px-2 py-1">
                        <span className="text-[8px] font-extrabold text-pink-600 dark:text-pink-400 uppercase block leading-none">Aryadner</span>
                        <span className="text-xs font-black text-pink-700 dark:text-pink-300">{formatCurrency(expenseTotalsInSelectedMonth.aryadnerTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado Líquido (Receitas - Despesas Rodrigo) */}
              <div className="theme-card rounded-xl p-3 border flex items-center justify-between" style={{ 
                borderColor: 'var(--card-border)',
                backgroundColor: (stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible) >= 0 ? '' : 'rgba(239, 68, 68, 0.03)'
              }}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${
                    (stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible) >= 0 
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold theme-text-secondary block tracking-wider">Saldo Líquido</span>
                    <span className={`text-base font-extrabold ${
                      (stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible) >= 0 
                        ? 'text-blue-500 dark:text-blue-400' 
                        : 'text-amber-500 dark:text-amber-450'
                    }`}>
                      {formatCurrency(stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible)}
                    </span>
                    <span className="text-[9px] theme-text-muted block">
                      Receitas − Rodrigo
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold self-start ${
                  (stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible) >= 0 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : 'bg-amber-505/10 text-amber-500'
                }`}>
                  {(stats.receivedRevenue - expenseTotalsInSelectedMonth.deductible) >= 0 ? 'Superávit' : 'Déficit'}
                </span>
              </div>
            </div>

            {/* Layout em Duas Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              
              {/* Formulário de Despesa (Col Esquerda) */}
              <div id="expense-form-card" className="lg:col-span-5 flex flex-col gap-3 scroll-mt-20">
                <div className="theme-card rounded-xl p-3.5 border transition-all duration-300" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        expId 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {expId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold theme-title">
                          {expId ? 'Editar Despesa' : 'Lançar Nova Despesa'}
                        </h3>
                        <p className="text-[10px] theme-text-secondary mt-0.5">
                          {expId ? 'Atualize as informações da despesa' : 'Registre uma despesa ou custo operacional'}
                        </p>
                      </div>
                    </div>
                    {expId && (
                      <button
                        type="button"
                        onClick={handleCancelEditExpense}
                        className="py-1 px-2 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-[10px] font-bold theme-text-secondary cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveExpense} className="space-y-2.5">
                    {/* Descrição */}
                    <div>
                      <label htmlFor="exp-description-input" className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 select-none font-mono">
                        Descrição da Despesa
                      </label>
                      <input
                        id="exp-description-input"
                        type="text"
                        placeholder="Ex: Aluguel, Internet, Licença Canva..."
                        required
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-400"
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                      />
                    </div>

                    {/* Categoria e Valor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="exp-category-select" className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider select-none font-mono">
                            Categoria
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="text-[9px] text-indigo-500 hover:text-indigo-400 font-extrabold flex items-center gap-0.5 cursor-pointer hover:underline"
                            title="Gerenciar categorias de despesas"
                          >
                            + Gerenciar
                          </button>
                        </div>
                        <select
                          id="exp-category-select"
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer"
                        >
                          {expCategories.map(cat => (
                            <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="exp-value-input" className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 select-none font-mono">
                          Valor da Despesa
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">R$</span>
                          <input
                            id="exp-value-input"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            required
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-400"
                            value={expValue}
                            onChange={(e) => setExpValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mês de Referência e Data de Vencimento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="exp-month-input" className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 select-none font-mono">
                          Mês de Referência
                        </label>
                        <input
                          id="exp-month-input"
                          type="month"
                          required
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all"
                          value={expYearMonth}
                          onChange={(e) => setExpYearMonth(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="exp-date-input" className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 select-none font-mono">
                          Data do Pagamento
                        </label>
                        <input
                          id="exp-date-input"
                          type="date"
                          required
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all"
                          value={expPaymentDate}
                          onChange={(e) => setExpPaymentDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Quem Pagou a Despesa (Rodrigo ou Aryadner) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider select-none font-mono">
                          Quem pagou a despesa?
                        </label>
                        <span className="text-[9px] theme-text-secondary font-medium">
                          {expPayer === 'Rodrigo' ? 'Abate do saldo recebido' : 'Não abate do saldo recebido'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="payer-rodrigo-btn"
                          type="button"
                          onClick={() => setExpPayer('Rodrigo')}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            expPayer === 'Rodrigo'
                              ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 theme-text-secondary hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${expPayer === 'Rodrigo' ? 'bg-white' : 'bg-sky-500'}`}></span>
                          Rodrigo
                        </button>

                        <button
                          id="payer-aryadner-btn"
                          type="button"
                          onClick={() => setExpPayer('Aryadner')}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            expPayer === 'Aryadner'
                              ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 theme-text-secondary hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${expPayer === 'Aryadner' ? 'bg-white' : 'bg-pink-500'}`}></span>
                          Aryadner
                        </button>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label htmlFor="exp-notes-textarea" className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 select-none font-mono">
                        Observações (Opcional)
                      </label>
                      <textarea
                        id="exp-notes-textarea"
                        placeholder="Adicione informações extras desta despesa..."
                        rows={2}
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-400 resize-none font-sans"
                        value={expNotes}
                        onChange={(e) => setExpNotes(e.target.value)}
                      />
                    </div>

                    {/* Botão de Envio */}
                    <button
                      id="exp-submit-btn"
                      type="submit"
                      className={`w-full py-2 px-4 text-white rounded-lg font-bold text-xs select-none shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                        expId
                          ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/10'
                          : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/10'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> 
                      {expId ? 'Atualizar Registro' : 'Registrar lançamento'}
                    </button>
                  </form>
                </div>

                {/* Ajuda / Dica */}
                <div className="theme-card rounded-xl p-3 border flex items-start gap-2 transition-all" style={{ backgroundColor: 'var(--baixa-bg)', borderColor: 'var(--baixa-border)' }}>
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold theme-title">Mapeamento e Fluxo de Caixa</h4>
                    <p className="text-[10px] theme-text-secondary leading-relaxed font-semibold">
                      Lançar suas despesas permite analisar o resultado operacional líquido e o fluxo real em tempo real contra as mensalidades faturadas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Listagem de Despesas Cadastradas (Col Direita) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="theme-card rounded-xl p-3.5 border flex flex-col h-full min-h-[380px] transition-all duration-300" style={{ borderColor: 'var(--card-border)' }}>
                  
                  {/* Cabeçalho */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2 mb-3" style={{ borderColor: 'var(--card-border)' }}>
                    <div>
                      <h3 className="text-xs font-bold theme-title">Histórico Geral de Despesas</h3>
                      <p className="text-[10px] theme-text-secondary mt-0.5 font-medium">
                        {expShowAllMonths ? 'Todas as despesas catalogadas' : `Filtrando referências de ${selectedYearMonth.split('-')[1]}/${selectedYearMonth.split('-')[0]}`}
                      </p>
                    </div>

                    {/* Filtro do Mês */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        id="checkbox-all-months-expenses"
                        type="checkbox"
                        checked={expShowAllMonths}
                        onChange={(e) => setExpShowAllMonths(e.target.checked)}
                        className="rounded border-slate-350 dark:border-white/10 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 bg-slate-100 dark:bg-white/5 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold theme-text-secondary">Ver todo histórico</span>
                    </label>
                  </div>

                  {/* Barra de Filtros Rápidos (Busca & Categorias & Responsável) */}
                  <div className="flex flex-col gap-2 mb-3">
                    {/* Barra de Busca e Filtro de Responsável */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          id="search-expenses-input"
                          type="text"
                          placeholder="Pesquisar despesas..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 font-medium"
                          value={expSearchQuery}
                          onChange={(e) => setExpSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* Filtro por Quem Pagou */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-0.5 rounded-lg shrink-0">
                        <button
                          type="button"
                          id="filter-payer-todos"
                          onClick={() => setExpPayerFilter('todos')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                            expPayerFilter === 'todos'
                              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                              : 'theme-text-secondary hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          id="filter-payer-rodrigo"
                          onClick={() => setExpPayerFilter('Rodrigo')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                            expPayerFilter === 'Rodrigo'
                              ? 'bg-sky-500 text-white shadow-xs'
                              : 'text-sky-600 dark:text-sky-400 hover:bg-sky-500/10'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Rodrigo
                        </button>
                        <button
                          type="button"
                          id="filter-payer-aryadner"
                          onClick={() => setExpPayerFilter('Aryadner')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                            expPayerFilter === 'Aryadner'
                              ? 'bg-pink-500 text-white shadow-xs'
                              : 'text-pink-600 dark:text-pink-400 hover:bg-pink-500/10'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Aryadner
                        </button>
                      </div>
                    </div>

                    {/* Pills de Categorias */}
                    <div className="flex flex-wrap gap-1" id="category-pills">
                      {['todos', ...expCategories].map((cat) => {
                        const isSelected = expCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            id={`category-pills-${cat}`}
                            type="button"
                            onClick={() => setExpCategoryFilter(cat)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500 dark:text-white border-indigo-200 dark:border-indigo-500 shadow-xs'
                                : 'bg-slate-100 dark:bg-white/5 border-slate-200/60 dark:border-white/10 theme-text-secondary hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                          >
                            {cat === 'todos' ? 'Categorias' : cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lista de Registros */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
                    {filteredExpenses.length === 0 ? (
                      <div className="text-center py-12 px-4 border border-dashed rounded-lg border-slate-200 dark:border-white/10 my-auto">
                        <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold theme-title">Nenhuma despesa listada</p>
                        <p className="text-[10px] theme-text-secondary mt-0.5 max-w-xs mx-auto font-medium">
                          Adicione um custo operacional no formulário lateral ou ajuste os filtros ativos.
                        </p>
                      </div>
                    ) : (
                      filteredExpenses.map((exp) => {
                        const expParts = exp.yearMonth.split('-');
                        const formattedExpMonth = `${expParts[1]}/${expParts[0]}`;

                        // Cores dos badges de categorias
                        const categoryColorClass = getCategoryColorClass(exp.category);

                        return (
                          <div
                            id={`expense-item-${exp.id}`}
                            key={exp.id}
                            className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:translate-x-[2px] bg-slate-50/50 dark:bg-white/2 ${
                              expId === exp.id ? 'ring-2 ring-amber-400 border-transparent dark:ring-amber-500' : 'border-slate-200/50 dark:border-white/5'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-black theme-title truncate max-w-xs sm:max-w-md" title={exp.description}>
                                  {exp.description}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${categoryColorClass}`}>
                                  {exp.category}
                                </span>
                                {(exp.payer || 'Rodrigo') === 'Aryadner' ? (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center gap-1" title="Pago por Aryadner (não abate do saldo recebido)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                    Aryadner
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1" title="Pago por Rodrigo (abate do saldo recebido)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    Rodrigo
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] theme-text-secondary font-medium">
                                <span>Ref: <strong className="theme-text-primary">{formattedExpMonth}</strong></span>
                                <span className="h-1 w-1 rounded-full bg-slate-450/40"></span>
                                <span>Pago em: <strong className="theme-text-primary">{formatDate(exp.paymentDate)}</strong></span>
                                {exp.notes && (
                                  <>
                                    <span className="h-1 w-1 rounded-full bg-slate-450/40"></span>
                                    <span className="italic truncate max-w-[150px] sm:max-w-[220px]" title={exp.notes}>"{exp.notes}"</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-200 dark:border-white/5">
                              <div className="sm:text-right">
                                <span className="text-[9px] font-bold theme-text-secondary uppercase tracking-wider block leading-none">Custo Pago</span>
                                <span className="text-xs font-black text-rose-500 dark:text-rose-455">{formatCurrency(exp.value)}</span>
                              </div>

                              <div className="flex items-center gap-1 pl-2 border-l border-slate-200/60 dark:border-white/5">
                                <button
                                  id={`edit-expense-btn-${exp.id}`}
                                  type="button"
                                  onClick={() => handleEditExpenseInline(exp)}
                                  className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg theme-text-secondary transition-colors cursor-pointer"
                                  title="Editar lançamento de despesa"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`delete-expense-btn-${exp.id}`}
                                  type="button"
                                  onClick={() => handleDeleteExpense(exp.id, exp.description)}
                                  className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg theme-text-secondary transition-colors cursor-pointer"
                                  title="Excluir lançamento de despesa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </div>

              {/* Espaçador de segurança para que o final da lista de despesas nunca seja cortado */}
              <div className="h-16 lg:h-6 w-full shrink-0" aria-hidden="true" />

            </div>
          </div>
        )}
      </>
    )}

  </main>
      </div>


      {/* Ajuda de utilização no rodapé (Apenas desktop para evitar sobreposição mobile) */}
      <footer 
        className="hidden lg:block py-3 text-center text-xs theme-text-secondary select-none relative z-10 theme-footer transition-all duration-300 shrink-0"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="flex items-center justify-center gap-1.5 font-medium text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Clique em qualquer mês para exibir o faturamento e pendências correspondentes.
          </p>
          <p className="font-semibold text-slate-500 text-[11px]">
            Controle de Clientes © 2026 - Versão do Administrador
          </p>
        </div>
      </footer>

      {/* Formulário de Criação/Edição de Clientes */}
      <ClientFormModal 
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={editingClient}
      />

      {/* Confirmação de Cobrança / Recebimento */}
      <PaymentDialogModal 
        isOpen={isPaymentModalOpen}
        client={paymentClient}
        yearMonth={selectedYearMonth}
        defaultTodayStr={TODAY_STR}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentClient(null);
        }}
        onConfirm={handleConfirmPayment}
      />

      {/* Modal de Confirmação Customizado para exclusões e estornos */}
      <ConfirmModal 
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        isDanger={confirmModalConfig.isDanger}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
      />

      {/* Modal de Detalhes Completos do Cliente (Aberto ao tocar nos cards no modo Mobile) */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        client={selectedDetailClient}
        selectedYearMonth={selectedYearMonth}
        todayStr={TODAY_STR}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailClient(null);
        }}
        onOpenPaymentModal={(clientToPay) => {
          setIsDetailModalOpen(false);
          setPaymentClient(clientToPay);
          setIsPaymentModalOpen(true);
        }}
        onUndoPayment={(clientId, yearMonth) => {
          handleUndoPayment(clientId, yearMonth);
        }}
        onToggleBillingIssued={(clientId, yearMonth) => {
          handleToggleBillingIssued(clientId, yearMonth);
        }}
        onEditClient={(clientToEdit) => {
          setIsDetailModalOpen(false);
          setEditingClient(clientToEdit);
          setIsClientModalOpen(true);
        }}
        onDeleteClient={(clientId, clientName) => {
          setIsDetailModalOpen(false);
          handleDeleteClient(clientId, clientName);
        }}
      />

      {/* Modal de Gerenciamento de Categorias de Despesa */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCategoryModalOpen(false)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
          />
          
          {/* Card */}
          <div className="theme-card relative w-full max-w-md rounded-2xl p-6 border shadow-2xl z-10 animate-fade-in transition-all duration-300" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold theme-title">Gerenciar Categorias</h3>
                  <p className="text-[11px] theme-text-secondary mt-0.5">Defina as suas categorias pessoais</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="py-1 px-3 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-xs font-bold theme-text-secondary cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Nova Categoria Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formattedName = newCategoryName.trim();
              if (!formattedName) return;
              if (expCategories.some(cat => cat.toLowerCase() === formattedName.toLowerCase())) {
                showToast(`A categoria "${formattedName}" já existe.`, 'error');
                return;
              }
              setExpCategories(prev => [...prev, formattedName]);
              setNewCategoryName('');
              showToast(`Categoria "${formattedName}" adicionada com sucesso!`, 'success');
            }} className="space-y-4 mb-5">
              <div>
                <label htmlFor="new-cat-input" className="block text-[10px] font-bold text-slate-450 dark:text-slate-350 uppercase tracking-wider mb-1.5 font-mono">
                  Cadastrar Nova Categoria
                </label>
                <div className="flex gap-2">
                  <input
                    id="new-cat-input"
                    type="text"
                    required
                    placeholder="Ex: Assinaturas, Gasolina, Impostos..."
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-slate-400"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="py-2 px-3.5 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            </form>

            {/* Listagem de Categorias */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-355 uppercase tracking-wider mb-1 font-mono">
                Categorias Ativas ({expCategories.length})
              </span>
              <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                {expCategories.map((cat) => (
                  <div 
                    key={cat}
                    className="p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold theme-text-primary bg-slate-50/50 dark:bg-white/1"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColorClass(cat).split(' ')[0]}`} />
                      <span>{cat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Se houver despesas usando essa categoria, alertar primeiro!
                        const isInUse = expenses.some(e => e.category === cat);
                        if (isInUse) {
                          showToast(`A categoria "${cat}" possui lançamentos ativos e não pode ser excluída.`, 'error');
                          return;
                        }

                        setExpCategories(prev => prev.filter(c => c !== cat));
                        showToast(`Categoria "${cat}" removida.`, 'info');
                      }}
                      className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg theme-text-secondary transition-colors cursor-pointer"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Segurança, Backup e Restauração de Dados */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsBackupModalOpen(false)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
          />
          <div className="theme-card relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl z-10 animate-fade-in transition-all duration-300" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold theme-title">Backup e Restauração de Dados</h3>
                  <p className="text-[11px] theme-text-secondary mt-0.5">Proteção contra limpeza de cache e cópia local (.JSON)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="py-1 px-3 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-xs font-bold theme-text-secondary cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Aviso Explicativo do Cache */}
            <div className="p-3.5 rounded-xl border mb-5 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold mb-1">Por que perdi os dados ao limpar o cache do PC?</p>
                <p className="opacity-90">
                  Este sistema salva todas as informações diretamente no armazenamento interno do seu navegador (<span className="font-mono text-[11px] font-bold">localStorage</span>). Ao limpar o cache ou dados do navegador, esse histórico é apagado.
                </p>
                <p className="opacity-90 mt-1.5 font-semibold">
                  Use os botões abaixo para <strong>exportar backups</strong> frequentes em seu PC e, sempre que precisar, <strong>restaure</strong> em qualquer dispositivo!
                </p>
              </div>
            </div>

            {/* Grid de Ações: Exportar e Importar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Botão de Exportar */}
              <div className="p-4 rounded-xl border flex flex-col justify-between bg-slate-50/50 dark:bg-white/5" style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold theme-title">Exportar Backup (.JSON)</h4>
                  </div>
                  <p className="text-[11px] theme-text-secondary leading-relaxed mb-3">
                    Baixe um arquivo seguro com todos os seus clientes, faturamentos, despesas e categorias.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Backup</span>
                </button>
              </div>

              {/* Botão de Importar/Restaurar */}
              <div className="p-4 rounded-xl border flex flex-col justify-between bg-slate-50/50 dark:bg-white/5" style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold theme-title">Restaurar do Arquivo</h4>
                  </div>
                  <p className="text-[11px] theme-text-secondary leading-relaxed mb-3">
                    Carregue um arquivo de backup <span className="font-mono">.json</span> salvo anteriormente no seu PC para repor seus dados.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar e Restaurar</span>
                </button>
              </div>
            </div>

            {/* Informações de status dos dados atuais */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 theme-text-secondary">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span>Dados em cache no momento:</span>
              </div>
              <div className="font-bold theme-text-primary flex items-center gap-3">
                <span>{clients.length} clientes</span>
                <span>•</span>
                <span>{expenses.length} despesas</span>
                <span>•</span>
                <span>{expCategories.length} categorias</span>
              </div>
            </div>

            {/* Dica opcional sobre banco em nuvem */}
            <p className="text-[10px] text-center theme-text-secondary mt-3">
              💡 Dica: Se precisar de sincronização automática entre celulares e computadores sem se preocupar com limpeza de cache, solicite a integração com banco de dados em nuvem (Firebase).
            </p>

          </div>
        </div>
      )}

      {/* Modal de Configurações Avançadas e Banco de Dados */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        dbConfig={dbConfig}
        onUpdateDbPath={handleUpdateDbPath}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearData={handleClearAllData}
        clientsCount={clients.length}
        expensesCount={expenses.length}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      />

      {/* Modal de Alerta / Inexistência de Arquivo de Banco de Dados */}
      <DatabaseNotFoundModal 
        isOpen={isDbNotFoundModalOpen}
        filePath={dbConfig.filePath}
        onImportBackup={handleImportBackup}
        onInitializeNew={() => {
          setIsDbNotFoundModalOpen(false);
          localStorage.setItem('contr_clientes_db_status', 'found');
          setDbConfig(prev => ({ ...prev, isFound: true }));
          showToast('Estrutura de banco de dados inicializada com sucesso!', 'success');
        }}
        onOpenSettings={() => {
          setIsDbNotFoundModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Barra de Navegação Inferior Fixa para Smartphones / Mobile */}
      <MobileBottomNav 
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenNewClientModal={() => {
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
        onOpenNewExpenseModal={() => {
          setActiveTab('despesas');
          setExpId(null);
          setExpDescription('');
          setExpValue('');
          setExpNotes('');
        }}
        onQuickSync={handleManualSync}
        isSyncing={isCloudSyncing}
        clientsCount={clients.length}
        expensesCount={expenses.length}
      />

    </div>
  );
}

