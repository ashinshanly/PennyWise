import { Categories, CategoryId, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SpendingChartProps {
    spendingByCategory: Record<CategoryId, number>;
}

export default function SpendingChart({ spendingByCategory }: SpendingChartProps) {
    const chartScale = useSharedValue(0);
    const legendOpacity = useSharedValue(0);

    useEffect(() => {
        chartScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 80 }));
        legendOpacity.value = withDelay(600, withSpring(1));
    }, []);

    const chartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: chartScale.value }],
        opacity: interpolate(chartScale.value, [0, 0.5, 1], [0, 0.5, 1]),
    }));

    const legendAnimatedStyle = useAnimatedStyle(() => ({
        opacity: legendOpacity.value,
        transform: [{ translateY: interpolate(legendOpacity.value, [0, 1], [20, 0]) }],
    }));

    // Prepare chart data
    const chartData = Object.entries(spendingByCategory)
        .filter(([_, amount]) => amount > 0)
        .map(([categoryId, amount]) => {
            const category = Categories[categoryId as CategoryId];
            return {
                value: amount,
                color: category?.color || Colors.textMuted,
                text: category?.name || categoryId,
                gradientCenterColor: category?.gradient?.[1] || category?.color,
            };
        })
        .sort((a, b) => b.value - a.value);

    const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0);

    // Show placeholder if no data
    if (chartData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Spending by Category</Text>
                <View style={styles.emptyState}>
                    <Ionicons name="pie-chart-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>No spending data yet</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Spending by Category</Text>

            <View style={styles.chartContainer}>
                <Animated.View style={[styles.chartWrapper, chartAnimatedStyle]}>
                    <PieChart
                        data={chartData}
                        donut
                        showGradient
                        radius={70}
                        innerRadius={45}
                        innerCircleColor={Colors.card}
                        centerLabelComponent={() => (
                            <View style={styles.centerLabel}>
                                <Text style={styles.centerAmount}>₹{(totalSpending / 1000).toFixed(1)}k</Text>
                                <Text style={styles.centerText}>Total</Text>
                            </View>
                        )}
                    />
                </Animated.View>

                <Animated.View style={[styles.legend, legendAnimatedStyle]}>
                    {chartData.slice(0, 4).map((item, index) => {
                        const percentage = ((item.value / totalSpending) * 100).toFixed(0);
                        return (
                            <View key={item.text} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <View style={styles.legendTextContainer}>
                                    <Text style={styles.legendLabel} numberOfLines={1}>
                                        {item.text}
                                    </Text>
                                    <Text style={styles.legendValue}>{percentage}%</Text>
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        marginHorizontal: Spacing.base,
        marginTop: Spacing.lg,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
    },
    title: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.base,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
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
    legend: {
        flex: 1,
        marginLeft: Spacing.lg,
        gap: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    legendLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        flex: 1,
    },
    legendValue: {
        color: Colors.text,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['2xl'],
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.sm,
    },
});
