import { CategoryId } from '@/constants/Colors';
import { MockTransactions } from '@/constants/MockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Account {
    id: string;
    name: string;
    type: 'bank' | 'card' | 'wallet' | 'cash';
    initialBalance: number;
    color: string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: CategoryId;
    description: string;
    date: string;
    source: 'manual' | 'sms';
    accountId?: string;
}

const STORAGE_KEY = '@expense_tracker_transactions';
const ACCOUNTS_KEY = '@expense_tracker_accounts';

const DEFAULT_ACCOUNTS: Account[] = [
    { id: '1', name: 'Cash', type: 'cash', initialBalance: 0, color: '#4CAF50' },
    { id: '2', name: 'Main Bank', type: 'bank', initialBalance: 0, color: '#2196F3' },
];

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    // Load transactions from storage
    const loadTransactions = useCallback(async () => {
        try {
            const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
            const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);

            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
            } else {
                setTransactions(MockTransactions);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MockTransactions));
            }

            if (storedAccounts) {
                setAccounts(JSON.parse(storedAccounts));
            } else {
                setAccounts(DEFAULT_ACCOUNTS);
                await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions(MockTransactions);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    // Save transactions to storage
    const saveTransactions = useCallback(async (newTransactions: Transaction[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
        } catch (error) {
            console.error('Error saving transactions:', error);
        }
    }, []);

    // Save accounts to storage
    const saveAccounts = useCallback(async (newAccounts: Account[]) => {
        try {
            await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(newAccounts));
        } catch (error) {
            console.error('Error saving accounts:', error);
        }
    }, []);

    // Add a new transaction
    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
        };
        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        await saveTransactions(updated);
        return newTransaction;
    }, [transactions, saveTransactions]);

    // Delete a transaction
    const deleteTransaction = useCallback(async (id: string) => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        await saveTransactions(updated);
    }, [transactions, saveTransactions]);

    // Import multiple transactions (from SMS scan)
    const importTransactions = useCallback(async (newTransactions: Omit<Transaction, 'id'>[]) => {
        const withIds = newTransactions.map(t => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        }));
        const updated = [...withIds, ...transactions];
        setTransactions(updated);
        await saveTransactions(updated);
        return withIds;
    }, [transactions, saveTransactions]);

    // Calculate totals
    const totals = transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expenses += t.amount;
            }
            acc.balance = acc.income - acc.expenses;
            return acc;
        },
        { income: 0, expenses: 0, balance: 0 }
    );

    // Get spending by category
    const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<CategoryId, number>);

    // Get recent transactions
    const recentTransactions = transactions.slice(0, 10);

    // Account Management
    const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
        const newAccount: Account = {
            ...account,
            id: Date.now().toString(),
        };
        const updated = [...accounts, newAccount];
        setAccounts(updated);
        await saveAccounts(updated);
        return newAccount;
    }, [accounts, saveAccounts]);

    const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
        const updated = accounts.map(acc =>
            acc.id === id ? { ...acc, ...updates } : acc
        );
        setAccounts(updated);
        await saveAccounts(updated);
    }, [accounts, saveAccounts]);

    const deleteAccount = useCallback(async (id: string) => {
        const updated = accounts.filter(acc => acc.id !== id);
        setAccounts(updated);
        await saveAccounts(updated);
        // Also remove accountId from linked transactions? Or keep for history?
        // For now, keep history but maybe warn user.
    }, [accounts, saveAccounts]);

    // Calculate account balances (Initial + Transactions)
    const getAccountBalances = useCallback(() => {
        const balances: Record<string, number> = {};

        // Initialize with initial balances
        accounts.forEach(acc => {
            balances[acc.id] = acc.initialBalance;
        });

        // Apply transactions
        transactions.forEach(t => {
            if (t.accountId && balances[t.accountId] !== undefined) {
                if (t.type === 'income') {
                    balances[t.accountId] += t.amount;
                } else {
                    balances[t.accountId] -= t.amount;
                }
            }
        });

        return balances;
    }, [accounts, transactions]);

    const accountBalances = getAccountBalances();

    // Clear all data (for testing)
    const clearAllData = useCallback(async () => {
        await AsyncStorage.multiRemove([STORAGE_KEY, ACCOUNTS_KEY]);
        setTransactions([]);
        setAccounts([]);
    }, []);

    return {
        transactions,
        accounts,
        loading,
        totals,
        spendingByCategory,
        recentTransactions,
        accountBalances,
        addTransaction,
        deleteTransaction,
        importTransactions,
        loadTransactions,
        addAccount,
        updateAccount,
        deleteAccount,
        clearAllData,
    };
}
