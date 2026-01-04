import { Transaction } from '@/hooks/useTransactions';

// Helper to generate past dates
const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Mock transactions for demo
export const MockTransactions: Transaction[] = [
    {
        id: '1',
        amount: 45.50,
        type: 'expense',
        category: 'food',
        description: 'Dinner at Restaurant',
        date: daysAgo(0).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '2',
        amount: 2500,
        type: 'income',
        category: 'income',
        description: 'Freelance Payment',
        date: daysAgo(1).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '3',
        amount: 35.00,
        type: 'expense',
        category: 'transport',
        description: 'Uber rides',
        date: daysAgo(1).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '4',
        amount: 120.00,
        type: 'expense',
        category: 'shopping',
        description: 'Amazon order',
        date: daysAgo(2).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '5',
        amount: 89.99,
        type: 'expense',
        category: 'bills',
        description: 'Internet bill',
        date: daysAgo(3).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '6',
        amount: 15.00,
        type: 'expense',
        category: 'entertainment',
        description: 'Netflix subscription',
        date: daysAgo(4).toISOString(),
        source: 'manual',
        accountId: '2', // Main Bank
    },
    {
        id: '7',
        amount: 5000,
        type: 'income',
        category: 'income',
        description: 'Salary',
        date: daysAgo(5).toISOString(),
        source: 'sms',
        accountId: '2', // Main Bank
    },
    {
        id: '8',
        amount: 250.00,
        type: 'expense',
        category: 'health',
        description: 'Doctor visit',
        date: daysAgo(6).toISOString(),
        source: 'manual',
        accountId: '1', // Cash
    },
];

// Mock SMS messages for scan demo
export const MockSMSMessages = [
    {
        id: 'sms1',
        sender: 'HDFC-Bank',
        message: 'Your A/c XX1234 debited by Rs.450.00 on 02-Jan for UPI-Amazon. Avl Bal Rs.12,550.00',
        timestamp: daysAgo(0).toISOString(),
        parsed: {
            amount: 450.00,
            type: 'expense' as const,
            category: 'shopping' as const,
            description: 'Amazon Purchase',
        },
    },
    {
        id: 'sms2',
        sender: 'SBI-Bank',
        message: 'Rs.2,500 credited to your A/c XX5678 via IMPS. Avl Bal: Rs.45,000',
        timestamp: daysAgo(1).toISOString(),
        parsed: {
            amount: 2500,
            type: 'income' as const,
            category: 'income' as const,
            description: 'IMPS Transfer Received',
        },
    },
    {
        id: 'sms3',
        sender: 'ICICI-Bank',
        message: 'Alert: INR 899.00 spent on your Card XX9012 at SWIGGY. If not done by you, call 1800XXX',
        timestamp: daysAgo(1).toISOString(),
        parsed: {
            amount: 899.00,
            type: 'expense' as const,
            category: 'food' as const,
            description: 'Swiggy Food Order',
        },
    },
    {
        id: 'sms4',
        sender: 'Axis-Bank',
        message: 'Your A/c debited for Rs.1,200 on 30-Dec at UBER TRIP. SMS BLOCK to 9999000000 if not you.',
        timestamp: daysAgo(2).toISOString(),
        parsed: {
            amount: 1200.00,
            type: 'expense' as const,
            category: 'transport' as const,
            description: 'Uber Trip',
        },
    },
    {
        id: 'sms5',
        sender: 'HDFC-Bank',
        message: 'Payment of Rs.2,499 received for your Electricity Bill. Transaction ID: TXN123456',
        timestamp: daysAgo(3).toISOString(),
        parsed: {
            amount: 2499.00,
            type: 'expense' as const,
            category: 'bills' as const,
            description: 'Electricity Bill',
        },
    },
];
