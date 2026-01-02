import { Categories, CategoryId, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const { transactions, totals, spendingByCategory } = useTransactions();

    // Calculate monthly data
    const monthlyData = useMemo(() => {
        const months: Record<string, { income: number; expense: number; label: string }> = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            months[key] = {
                income: 0,
                expense: 0,
                label: date.toLocaleDateString('en-IN', { month: 'short' }),
            };
        }

        // Fill in transaction data
        transactions.forEach((t) => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (months[key]) {
                if (t.type === 'income') {
                    months[key].income += t.amount;
                } else {
                    months[key].expense += t.amount;
                }
            }
        });

        return Object.values(months);
    }, [transactions]);

    // Prepare bar chart data
    const barData = monthlyData.flatMap((month) => [
        {
            value: month.expense / 1000,
            label: month.label,
            frontColor: Colors.danger,
            spacing: 2,
        },
        {
            value: month.income / 1000,
            frontColor: Colors.success,
        },
    ]);

    // Prepare pie chart data
    const pieData = Object.entries(spendingByCategory)
        .filter(([_, amount]) => amount > 0)
        .map(([categoryId, amount]) => {
            const category = Categories[categoryId as CategoryId];
            return {
                value: amount,
                color: category?.color || Colors.textMuted,
                text: category?.name?.split(' ')[0] || categoryId,
            };
        })
        .sort((a, b) => b.value - a.value);

    const totalSpending = pieData.reduce((sum, item) => sum + item.value, 0);

    // Calculate savings rate
    const savingsRate = totals.income > 0
        ? Math.round(((totals.income - totals.expenses) / totals.income) * 100)
        : 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                </Animated.View>

                {/* Summary Cards */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryCards}>
                    <View style={[styles.summaryCard, { backgroundColor: Colors.success + '20' }]}>
                        <View style={[styles.summaryIcon, { backgroundColor: Colors.success + '30' }]}>
                            <Ionicons name="trending-up" size={20} color={Colors.success} />
                        </View>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, { color: Colors.success }]}>
                            ₹{totals.income.toLocaleString('en-IN')}
                        </Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: Colors.danger + '20' }]}>
                        <View style={[styles.summaryIcon, { backgroundColor: Colors.danger + '30' }]}>
                            <Ionicons name="trending-down" size={20} color={Colors.danger} />
                        </View>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                            ₹{totals.expenses.toLocaleString('en-IN')}
                        </Text>
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: Colors.primary + '20' }]}>
                        <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + '30' }]}>
                            <Ionicons name="wallet" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.summaryLabel}>Savings</Text>
                        <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                            {savingsRate}%
                        </Text>
                    </View>
                </Animated.View>

                {/* Monthly Comparison */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Monthly Overview</Text>
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                                <Text style={styles.legendText}>Expense</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                                <Text style={styles.legendText}>Income</Text>
                            </View>
                        </View>
                    </View>

                    {transactions.length > 0 ? (
                        <BarChart
                            data={barData}
                            barWidth={16}
                            spacing={24}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                            noOfSections={4}
                            maxValue={Math.max(...monthlyData.map(m => Math.max(m.income, m.expense))) / 1000 * 1.2 || 10}
                            width={width - 80}
                            height={180}
                            isAnimated
                            animationDuration={500}
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <Ionicons name="bar-chart-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No data yet</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Spending by Category</Text>

                    {pieData.length > 0 ? (
                        <View style={styles.pieContainer}>
                            <PieChart
                                data={pieData}
                                donut
                                showGradient
                                radius={80}
                                innerRadius={50}
                                innerCircleColor={Colors.card}
                                centerLabelComponent={() => (
                                    <View style={styles.centerLabel}>
                                        <Text style={styles.centerAmount}>
                                            ₹{(totalSpending / 1000).toFixed(1)}k
                                        </Text>
                                        <Text style={styles.centerText}>Total</Text>
                                    </View>
                                )}
                            />

                            <View style={styles.categoryList}>
                                {pieData.slice(0, 5).map((item, index) => {
                                    const percentage = ((item.value / totalSpending) * 100).toFixed(0);
                                    return (
                                        <View key={item.text} style={styles.categoryItem}>
                                            <View style={styles.categoryLeft}>
                                                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                                <Text style={styles.categoryName}>{item.text}</Text>
                                            </View>
                                            <View style={styles.categoryRight}>
                                                <Text style={styles.categoryAmount}>
                                                    ₹{item.value.toLocaleString('en-IN')}
                                                </Text>
                                                <Text style={styles.categoryPercent}>{percentage}%</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyChart}>
                            <Ionicons name="pie-chart-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No spending data</Text>
                        </View>
                    )}
                </Animated.View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.base,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        color: Colors.text,
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    summaryCards: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    summaryCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    chartCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    chartTitle: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    legend: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    emptyChart: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['3xl'],
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.sm,
    },
    pieContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    centerLabel: {
        alignItems: 'center',
    },
    centerAmount: {
        color: Colors.text,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    centerText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    categoryList: {
        flex: 1,
        marginLeft: Spacing.lg,
        gap: Spacing.md,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryName: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
    },
    categoryRight: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        color: Colors.text,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    categoryPercent: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    bottomSpacer: {
        height: 100,
    },
});
