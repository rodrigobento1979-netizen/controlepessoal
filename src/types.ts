export interface PaymentHistoryItem {
  yearMonth: string; // Formato "YYYY-MM" (ex: "2026-06")
  paymentDate: string; // Data em que o pagamento foi realizado (ex: "2026-06-04")
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  dueDateDay: number; // Dia do vencimento (1 a 31)
  value: number; // Valor do contrato em R$
  contractType: 'recorrente' | 'mensal'; // Tipo de contrato: Recorrente ou Mensal
  lastPaymentDate?: string; // Data do último pagamento realizado (ex: "2026-05-10")
  paymentHistory: PaymentHistoryItem[]; // Histórico de pagamentos por mês
  status: 'ativo' | 'inativo'; // Facilitar desativação caso o cliente saia
  createdAt: string;
  notes?: string;
  billingStartDate?: string; // Mês inicial de cobrança modelo YYYY-MM
  billingEndDate?: string; // Mês final de cobrança modelo YYYY-MM
  issuedBillingMonths?: string[]; // Meses ("YYYY-MM") onde a cobrança/fatura foi emitida ou gerada
}

export type ClientPaymentStatus = 'pago' | 'atrasado' | 'pendente' | 'sem_cobranca';

export type ExpensePayer = 'Rodrigo' | 'Aryadner';

export interface Expense {
  id: string;
  description: string; // Descrição da despesa (ex: "Servidor AWS", "Aluguel", "Internet")
  category: string; // "Infraestrutura", "Marketing", "Serviços", "Salários", "Impostos", "Outros"
  value: number; // Valor cobrado / pago
  paymentDate: string; // Data do pagamento (YYYY-MM-DD)
  yearMonth: string; // Mês de referência (YYYY-MM)
  notes?: string; // Notas de observação
  payer?: ExpensePayer; // Quem pagou: 'Rodrigo' ou 'Aryadner' (padrão: 'Rodrigo')
}

export interface DatabaseConfig {
  filePath: string;
  lastSyncAt: string;
  autoSync: boolean;
  isFound: boolean;
}

export interface UserAuth {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
  avatarColor?: string;
}

export interface CloudBackupData {
  version: string;
  exportedAt: string;
  clients: Client[];
  expenses: Expense[];
  expenseCategories: string[];
  dbConfig: DatabaseConfig;
  user: {
    email: string;
    name: string;
  };
}

export type AppTab = 'clientes' | 'despesas' | 'dashboard' | 'sync';


