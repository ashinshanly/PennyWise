import { CategoryId } from '@/constants/Colors';
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

export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'warning' | 'success';
}

export const CURRENCIES = {
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

export type CurrencyCode = keyof typeof CURRENCIES;

const STORAGE_KEY = '@expense_tracker_transactions';
const ACCOUNTS_KEY = '@expense_tracker_accounts';
const STORAGE_KEY = '@expense_tracker_transactions';
const ACCOUNTS_KEY = '@expense_tracker_accounts';
const NOTIFICATIONS_KEY = '@expense_tracker_notifications';
const CURRENCY_KEY = '@expense_tracker_currency';

const DEFAULT_ACCOUNTS: Account[] = [];

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
    const [loading, setLoading] = useState(true);

    // Load transactions from storage
    const loadTransactions = useCallback(async () => {
        try {
            const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY);
            const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_KEY);

            const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
            const storedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);

            if (storedCurrency && CURRENCIES[storedCurrency as CurrencyCode]) {
                setCurrencyState(storedCurrency as CurrencyCode);
            }

            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
            } else {
                setTransactions([]);
                await AsyncStorage.removeItem(STORAGE_KEY);
            }

            if (storedAccounts) {
                setAccounts(JSON.parse(storedAccounts));
            } else {
                setAccounts([]);
                await AsyncStorage.removeItem(ACCOUNTS_KEY);
            }

            if (storedNotifications) {
                let parsedNotifications: Notification[] = JSON.parse(storedNotifications);

                // Ensure privacy message is updated or added
                const welcomeIndex = parsedNotifications.findIndex(n => n.id === 'welcome-1');
                const welcomeNotification: Notification = {
                    id: 'welcome-1',
                    title: 'Welcome to PennyWise! 🤡',
                    message: 'Your smart automated expense tracker is ready. 🔒 Privacy First: All your data stays on this device. No servers, no cloud storage. All processing happens locally.',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'info'
                };

                if (welcomeIndex !== -1) {
                    // Update existing welcome message text
                    parsedNotifications[welcomeIndex] = {
                        ...parsedNotifications[welcomeIndex],
                        message: welcomeNotification.message
                    };
                } else {
                    // Add if missing
                    parsedNotifications = [welcomeNotification, ...parsedNotifications];
                }

                setNotifications(parsedNotifications);
                // We typically don't await save here to avoid blocking load, but for data consistency let's save
                AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(parsedNotifications));
            } else {
                const welcomeNotification: Notification = {
                    id: 'welcome-1',
                    title: 'Welcome to PennyWise! 🤡',
                    message: 'Your smart automated expense tracker is ready. 🔒 Privacy First: All your data stays on this device. No servers, no cloud storage. All processing happens locally.',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'info'
                };
                setNotifications([welcomeNotification]);
                await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([welcomeNotification]));
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            console.error('Error loading transactions:', error);
            setTransactions([]);
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

    // Save notifications to storage
    const saveNotifications = useCallback(async (newNotifications: Notification[]) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }, []);

    const setCurrency = useCallback(async (code: CurrencyCode) => {
        try {
            setCurrencyState(code);
            await AsyncStorage.setItem(CURRENCY_KEY, code);
        } catch (error) {
            console.error('Error saving currency:', error);
        }
    }, []);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        };
        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        await saveNotifications(updated);
    }, [notifications, saveNotifications]);

    const markAllNotificationsAsRead = useCallback(async () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        await saveNotifications(updated);
    }, [notifications, saveNotifications]);

    // Add a new transaction
    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
        };
        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        await saveTransactions(updated);

        // Check for budget warning (Example threshold: 50000)
        // In a real app, this would be user-configurable
        const currentExpenses = transactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
        const newTotalExpenses = currentExpenses + (transaction.type === 'expense' ? transaction.amount : 0);

        // Simple logic: Trigger warning if crossing 50k, 1lakh etc. 
        // For demonstration, let's just say if expense > 10000 single transaction or total > 50000
        if (transaction.type === 'expense' && transaction.amount > 10000) {
            addNotification({
                title: 'High Expense Alert ⚠️',
                message: `You just spent ₹${transaction.amount}. Make sure this was planned!`,
                date: new Date().toISOString(),
                read: false,
                type: 'warning',
            });
        }

        return newTransaction;
    }, [transactions, saveTransactions, addNotification]);

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
            return acc;
        },
        { income: 0, expenses: 0, balance: 0 }
    );

    // Add initial balances from accounts to the total balance
    const accountsInitialBalance = accounts.reduce((sum, acc) => sum + (acc.initialBalance || 0), 0);
    totals.balance = accountsInitialBalance + totals.income - totals.expenses;

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
        notifications,
        accountBalances,
        addTransaction,
        addNotification,
        markAllNotificationsAsRead,
        deleteTransaction,
        importTransactions,
        loadTransactions,
        addAccount,
        updateAccount,
        deleteAccount,
        clearAllData,
        currency,
        setCurrency,
        currencySymbol: CURRENCIES[currency].symbol,
    };
}
