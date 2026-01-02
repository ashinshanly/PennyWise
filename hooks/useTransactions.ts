import { CategoryId } from '@/constants/Colors';
import { MockTransactions } from '@/constants/MockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: CategoryId;
    description: string;
    date: string;
    source: 'manual' | 'sms';
}

const STORAGE_KEY = '@expense_tracker_transactions';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Load transactions from storage
    const loadTransactions = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setTransactions(JSON.parse(stored));
            } else {
                // Initialize with mock data for demo
                setTransactions(MockTransactions);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MockTransactions));
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

    // Clear all data (for testing)
    const clearAllData = useCallback(async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setTransactions([]);
    }, []);

    return {
        transactions,
        loading,
        totals,
        spendingByCategory,
        recentTransactions,
        addTransaction,
        deleteTransaction,
        importTransactions,
        loadTransactions,
        clearAllData,
    };
}
