import TransactionItem from '@/components/TransactionItem';
import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Transaction, useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const filterOptions = ['All', 'Income', 'Expense'] as const;
type FilterType = typeof filterOptions[number];

export default function HistoryScreen() {
    const { transactions, loading, deleteTransaction, loadTransactions } = useTransactions();
    const [filter, setFilter] = useState<FilterType>('All');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    }, [loadTransactions]);

    const handleDelete = useCallback((id: string) => {
        deleteTransaction(id);
    }, [deleteTransaction]);

    const filteredTransactions = transactions.filter((t) => {
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

    const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => (
        <TransactionItem
            transaction={item}
            index={index}
            onDelete={handleDelete}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                <Text style={styles.title}>Transaction History</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={22} color={Colors.text} />
                </TouchableOpacity>
            </Animated.View>

            {/* Filter Tabs */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.filterContainer}>
                {filterOptions.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.filterButton, filter === option && styles.filterButtonActive]}
                        onPress={() => setFilter(option)}
                    >
                        <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>

            {/* Transaction List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : filteredTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>No transactions found</Text>
                    <Text style={styles.emptySubtext}>
                        {filter !== 'All' ? `Try changing the filter` : 'Add your first transaction'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                        />
                    }
                    renderItem={({ item: section }) => (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionDate}>{section.date}</Text>
                                <Text style={[
                                    styles.sectionTotal,
                                    section.total >= 0 ? styles.positiveTotal : styles.negativeTotal
                                ]}>
                                    {section.total >= 0 ? '+' : ''}₹{Math.abs(section.total).toLocaleString('en-IN')}
                                </Text>
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
                    ListFooterComponent={<View style={styles.bottomSpacer} />}
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
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    title: {
        color: Colors.text,
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    filterButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.full,
        backgroundColor: Colors.card,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    filterTextActive: {
        color: Colors.text,
    },
    listContainer: {
        paddingBottom: Spacing['2xl'],
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.sm,
    },
    sectionDate: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    sectionTotal: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    positiveTotal: {
        color: Colors.success,
    },
    negativeTotal: {
        color: Colors.danger,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing['2xl'],
    },
    emptyText: {
        color: Colors.text,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        marginTop: Spacing.lg,
    },
    emptySubtext: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 100,
    },
});
