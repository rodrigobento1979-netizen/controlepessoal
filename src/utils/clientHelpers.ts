import { Client, Expense } from '../types';

/**
 * Formata um valor numérico para a moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data "YYYY-MM-DD" para "DD/MM/AAAA"
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Nenhum pagamento';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Helper para obter o dia de vencimento de forma formatada (ex: "Dia 10")
 */
export function formatDueDate(day: number): string {
  return `Dia ${String(day).padStart(2, '0')}`;
}

/**
 * Formata um ano-mês "YYYY-MM" para o nome do mês e ano em português (ex: "Agosto de 2026")
 */
export function formatYearMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthNum = parseInt(monthStr, 10);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = months[monthNum - 1] || monthStr;
  return `${monthName} de ${yearStr}`;
}

/**
 * Retorna a data de vencimento real para um cliente em um determinado ano e mês.
 * Trata casos como dia 31 em meses que possuem menos dias.
 */
export function getDueDateForMonth(day: number, yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // Criar uma data no mês especificado.
  // javascript Date trata transbordo de dia automaticamente se usarmos o construtor correto:
  // Mas para formatação estável "YYYY-MM-DD", limitamos o dia ao tamanho real do mês.
  const daysInMonth = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(day, daysInMonth);
  
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(clampedDay).padStart(2, '0');
  
  return `${year}-${formattedMonth}-${formattedDay}`;
}

/**
 * Determina o status de pagamento de um cliente para um determinado mês
 * @param client Cliente
 * @param yearMonth Mês selecionado no formato "YYYY-MM"
 * @param todayStr Data atual no formato "YYYY-MM-DD"
 */
export function getClientStatusForMonth(
  client: Client,
  yearMonth: string,
  todayStr: string
): 'pago' | 'pendente' | 'atrasado' | 'futuro' | 'sem_cobranca' {
  // Se o cliente tem data de início de cobrança e o mês selecionado for anterior a ela, não cobramos
  if (client.billingStartDate && yearMonth < client.billingStartDate) {
    return 'sem_cobranca';
  }

  // Se o cliente tem data de término de cobrança e o mês selecionado for posterior a ela, não cobramos
  if (client.billingEndDate && yearMonth > client.billingEndDate) {
    return 'sem_cobranca';
  }

  // 1. Procurar nas faturas pagas deste cliente para ver se o mês selecionado está lá
  const payment = client.paymentHistory.find((p) => p.yearMonth === yearMonth);
  if (payment) {
    return 'pago';
  }

  // Se o cliente estiver inativo, não geramos pendência para meses sem pagamento
  if (client.status === 'inativo') {
    return 'futuro'; // Ou outro status neutro
  }

  // 2. Comparar o mês selecionado com o mês atual
  const [currentYear, currentMonth] = todayStr.split('-').map(Number);
  const [targetYear, targetMonth] = yearMonth.split('-').map(Number);

  const currentYearMonthVal = currentYear * 12 + currentMonth;
  const targetYearMonthVal = targetYear * 12 + targetMonth;

  // Se o mês selecionado estiver no futuro
  if (targetYearMonthVal > currentYearMonthVal) {
    return 'futuro';
  }

  // Se o mês selecionado for o mês atual
  if (targetYearMonthVal === currentYearMonthVal) {
    const dueDateStr = getDueDateForMonth(client.dueDateDay, yearMonth);
    
    if (todayStr > dueDateStr) {
      return 'atrasado';
    } else {
      return 'pendente';
    }
  }

  // Se o mês selecionado for no passado e não foi pago, é considerado atrasado
  return 'atrasado';
}

/**
 * Verifica se a cobrança do cliente foi marcada como emitida para um determinado mês
 */
export function isBillingIssuedForMonth(client: Client, yearMonth: string): boolean {
  return Array.isArray(client.issuedBillingMonths) && client.issuedBillingMonths.includes(yearMonth);
}

/**
 * Gera os dados iniciais perfeitos para os clientes para demonstração se o localStorage estiver vazio.
 */
export function getInitialClients(): Client[] {
  return [
    {
      id: 'cli-1',
      name: 'Sorveteria Central Ltda',
      dueDateDay: 10,
      value: 350.00,
      contractType: 'recorrente',
      lastPaymentDate: '2026-05-09',
      status: 'ativo',
      createdAt: '2026-01-15',
      notes: 'Envio automático de boleto no dia 1 de cada mês.',
      issuedBillingMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
      paymentHistory: [
        { yearMonth: '2026-01', paymentDate: '2026-01-10', amount: 350.00 },
        { yearMonth: '2026-02', paymentDate: '2026-02-08', amount: 350.00 },
        { yearMonth: '2026-03', paymentDate: '2026-03-09', amount: 350.00 },
        { yearMonth: '2026-04', paymentDate: '2026-04-10', amount: 350.00 },
        { yearMonth: '2026-05', paymentDate: '2026-05-09', amount: 350.00 }
      ]
    },
    {
      id: 'cli-2',
      name: 'Clínica Sorriso Feliz',
      dueDateDay: 5,
      value: 650.00,
      contractType: 'recorrente',
      lastPaymentDate: '2026-05-05',
      status: 'ativo',
      createdAt: '2026-02-12',
      notes: 'Contato comercial: Dra. Sandra. Paga sempre via Pix.',
      issuedBillingMonths: ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
      paymentHistory: [
        { yearMonth: '2026-02', paymentDate: '2026-02-05', amount: 650.00 },
        { yearMonth: '2026-03', paymentDate: '2026-03-05', amount: 650.00 },
        { yearMonth: '2026-04', paymentDate: '2026-04-04', amount: 650.00 },
        { yearMonth: '2026-05', paymentDate: '2026-05-05', amount: 650.00 }
      ]
    },
    {
      id: 'cli-3',
      name: 'Mercantil Silva & Filhos',
      dueDateDay: 15,
      value: 1200.00,
      contractType: 'recorrente',
      lastPaymentDate: '2026-05-14',
      status: 'ativo',
      createdAt: '2026-03-01',
      notes: 'Suporte de TI mensal avançado.',
      issuedBillingMonths: ['2026-03', '2026-04', '2026-05'],
      paymentHistory: [
        { yearMonth: '2026-03', paymentDate: '2026-03-15', amount: 1200.00 },
        { yearMonth: '2026-04', paymentDate: '2026-04-15', amount: 1200.00 },
        { yearMonth: '2026-05', paymentDate: '2026-05-14', amount: 1200.00 }
      ]
    },
    {
      id: 'cli-4',
      name: 'Ana Carolina (Consultoria de Marca)',
      dueDateDay: 30,
      value: 900.00,
      contractType: 'mensal',
      lastPaymentDate: '2026-04-28',
      status: 'ativo',
      createdAt: '2026-04-10',
      notes: 'Contrato pontual de 3 meses. Último mês será Junho.',
      issuedBillingMonths: ['2026-04', '2026-05'],
      paymentHistory: [
        { yearMonth: '2026-04', paymentDate: '2026-04-28', amount: 900.00 }
      ]
    }
  ];
}

/**
 * Gera as despesas iniciais se o localStorage estiver vazio.
 */
export function getInitialExpenses(): Expense[] {
  return [
    {
      id: 'exp-1',
      description: 'Aluguel do Coworking',
      category: 'Infraestrutura',
      value: 1200.00,
      paymentDate: '2026-06-05',
      yearMonth: '2026-06',
      notes: 'Imobiliária Jardim Alianças',
      payer: 'Rodrigo'
    },
    {
      id: 'exp-2',
      description: 'Internet Fibra Óptica',
      category: 'Infraestrutura',
      value: 150.00,
      paymentDate: '2026-06-02',
      yearMonth: '2026-06',
      notes: 'Plano Vivo Empresas 500mb',
      payer: 'Rodrigo'
    },
    {
      id: 'exp-3',
      description: 'Hospedagem e API OpenAI / Gemini',
      category: 'Infraestrutura',
      value: 435.50,
      paymentDate: '2026-06-03',
      yearMonth: '2026-06',
      notes: 'Consumo faturado em dólar',
      payer: 'Rodrigo'
    },
    {
      id: 'exp-4',
      description: 'Campanha de Anúncios (SGE & Social Media)',
      category: 'Marketing',
      value: 800.00,
      paymentDate: '2026-06-01',
      yearMonth: '2026-06',
      notes: 'Google Ads e Meta Ads',
      payer: 'Aryadner'
    },
    {
      id: 'exp-5',
      description: 'Contador e Taxas MEI',
      category: 'Impostos',
      value: 320.00,
      paymentDate: '2026-06-05',
      yearMonth: '2026-06',
      notes: 'DAS + honorários mensais',
      payer: 'Rodrigo'
    },
    {
      id: 'exp-6',
      description: 'Hospedagem Vercel Pro & Velo',
      category: 'Infraestrutura',
      value: 110.00,
      paymentDate: '2026-05-25',
      yearMonth: '2026-05',
      notes: 'Servidores de produção e teste.',
      payer: 'Aryadner'
    }
  ];
}

