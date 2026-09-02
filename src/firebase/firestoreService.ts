import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Client, Expense } from '../types';

export interface FirestoreSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastUpdated: string | null;
  clientsCount: number;
  expensesCount: number;
  error: string | null;
}

/**
 * Salva ou atualiza um cliente individual no Firestore em tempo real
 */
export async function saveClientToFirestore(client: Client): Promise<void> {
  try {
    const docRef = doc(db, 'clients', client.id);
    await setDoc(docRef, {
      ...client,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar cliente no Firestore:', error);
    throw error;
  }
}

/**
 * Remove um cliente do Firestore
 */
export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  try {
    const docRef = doc(db, 'clients', clientId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir cliente no Firestore:', error);
    throw error;
  }
}

/**
 * Salva ou atualiza uma despesa individual no Firestore
 */
export async function saveExpenseToFirestore(expense: Expense): Promise<void> {
  try {
    const docRef = doc(db, 'expenses', expense.id);
    await setDoc(docRef, {
      ...expense,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar despesa no Firestore:', error);
    throw error;
  }
}

/**
 * Remove uma despesa do Firestore
 */
export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir despesa no Firestore:', error);
    throw error;
  }
}

/**
 * Salva a lista de categorias de despesas no Firestore
 */
export async function saveCategoriesToFirestore(categories: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'expenseCategories');
    await setDoc(docRef, {
      categories,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar categorias no Firestore:', error);
  }
}

/**
 * Sincroniza em lote todos os dados locais para o Firestore (Upload Completo)
 */
export async function syncAllToFirestore(
  clients: Client[],
  expenses: Expense[],
  categories: string[]
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const batch = writeBatch(db);

    // Salvar Clientes
    for (const client of clients) {
      const cRef = doc(db, 'clients', client.id);
      batch.set(cRef, { ...client, updatedAt: new Date().toISOString() });
    }

    // Salvar Despesas
    for (const expense of expenses) {
      const eRef = doc(db, 'expenses', expense.id);
      batch.set(eRef, { ...expense, updatedAt: new Date().toISOString() });
    }

    // Salvar Categorias e Metadados do Sistema
    const settingsRef = doc(db, 'settings', 'systemConfig');
    batch.set(settingsRef, {
      categories,
      lastFullSync: new Date().toISOString(),
      version: '2.0.0-firestore',
    });

    await batch.commit();

    return {
      success: true,
      message: `Sincronização concluída! ${clients.length} clientes e ${expenses.length} despesas salvas no Firestore.`,
      count: clients.length + expenses.length,
    };
  } catch (error: any) {
    console.error('Erro no syncAllToFirestore:', error);
    return {
      success: false,
      message: error?.message || 'Falha ao sincronizar com Firestore',
      count: 0,
    };
  }
}

/**
 * Puxa todos os dados do Firestore de uma só vez
 */
export async function fetchAllFromFirestore(): Promise<{
  clients: Client[];
  expenses: Expense[];
  categories: string[];
} | null> {
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const expensesSnap = await getDocs(collection(db, 'expenses'));
    const settingsSnap = await getDocs(collection(db, 'settings'));

    const clients: Client[] = [];
    clientsSnap.forEach((d) => {
      clients.push(d.data() as Client);
    });

    const expenses: Expense[] = [];
    expensesSnap.forEach((d) => {
      expenses.push(d.data() as Expense);
    });

    let categories: string[] = [];
    settingsSnap.forEach((d) => {
      if (d.id === 'systemConfig' || d.id === 'expenseCategories') {
        const data = d.data();
        if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        }
      }
    });

    return { clients, expenses, categories };
  } catch (error) {
    console.error('Erro ao buscar dados do Firestore:', error);
    return null;
  }
}

/**
 * Cria escuta em tempo real (Realtime Listener) com o Firestore.
 * Sempre que qualquer usuário em qualquer dispositivo alterar um cliente ou despesa,
 * a função callback é disparada instantaneamente!
 */
export function subscribeToFirestore(
  onClientsChange: (clients: Client[]) => void,
  onExpensesChange: (expenses: Expense[]) => void,
  onCategoriesChange: (categories: string[]) => void,
  onError?: (err: Error) => void
): () => void {
  const clientsCol = collection(db, 'clients');
  const expensesCol = collection(db, 'expenses');
  const settingsDoc = doc(db, 'settings', 'systemConfig');

  const unsubClients = onSnapshot(
    clientsCol,
    (snapshot) => {
      const list: Client[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Client);
      });
      // Ordenar por nome para manter consistência
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      onClientsChange(list);
    },
    (err) => {
      console.error('Erro no listener de clientes:', err);
      if (onError) onError(err);
    }
  );

  const unsubExpenses = onSnapshot(
    expensesCol,
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Expense);
      });
      // Ordenar por data decrescente
      list.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
      onExpensesChange(list);
    },
    (err) => {
      console.error('Erro no listener de despesas:', err);
      if (onError) onError(err);
    }
  );

  const unsubSettings = onSnapshot(
    settingsDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.categories && Array.isArray(data.categories)) {
          onCategoriesChange(data.categories);
        }
      }
    },
    (err) => {
      console.warn('Configurações do Firestore ainda não criadas:', err);
    }
  );

  // Retorna função para cancelar todas as assinaturas quando necessário
  return () => {
    unsubClients();
    unsubExpenses();
    unsubSettings();
  };
}
