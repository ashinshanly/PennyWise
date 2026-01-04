import TransactionItem from '@/components/TransactionItem';
import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Transaction, useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { transactions, accounts, deleteTransaction } = useTransactions();

    const account = accounts.find(a => a.id === id);
    const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');

    const handleDelete = useCallback((txId: string) => {
        deleteTransaction(txId);
    }, [deleteTransaction]);

    if (!account) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Account not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Filter transactions for this account
    const accountTransactions = transactions.filter(t => t.accountId === id);

    const filteredTransactions = accountTransactions.filter((t) => {
        if (filter === 'All') return true;
        return filter === 'Income' ? t.type === 'income' : t.type === 'expense';
    });

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const sections = Object.entries(groupedTransactions).map(([date, items]) => ({
        date,
        data: items,
        total: items.reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0),
    }));

    // Calculate totals for this account
    const totalIncome = accountTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = accountTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = account.initialBalance + totalIncome - totalExpense;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{account.name}</Text>
                <View style={styles.headerButton} />
            </View>

            {/* Account Summary Card */}
            <View style={[styles.card, { borderLeftColor: account.color, borderLeftWidth: 4 }]}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>₹{currentBalance.toLocaleString('en-IN')}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="arrow-down-circle" size={16} color={Colors.success} />
                        <Text style={styles.statValue}>₹{totalIncome.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="arrow-up-circle" size={16} color={Colors.text} />
                        <Text style={styles.statValue}>₹{totalExpense.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </View>

            {/* Transaction List */}
            <Text style={styles.sectionTitle}>Transactions</Text>

            {filteredTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.emptySubtext}>No transactions for this account</Text>
                </View>
            ) : (
                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: section }) => (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionDate}>{section.date}</Text>
                            </View>
                            {section.data.map((transaction, index) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    index={index}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
    },
    card: {
        margin: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        marginBottom: Spacing.xl,
    },
    balanceLabel: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        marginBottom: Spacing.xs,
    },
    balanceAmount: {
        color: Colors.text,
        fontSize: Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.xl,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statValue: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
        marginLeft: Spacing.md,
        marginBottom: Spacing.md,
    },
    listContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        marginBottom: Spacing.sm,
    },
    sectionDate: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl * 2,
    },
    emptyText: {
        color: Colors.text,
        fontSize: Typography.sizes.lg,
        marginBottom: Spacing.md,
    },
    emptySubtext: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
        marginTop: Spacing.md,
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
    },
    backButtonText: {
        color: Colors.text,
        fontWeight: Typography.weights.bold,
    },
});
