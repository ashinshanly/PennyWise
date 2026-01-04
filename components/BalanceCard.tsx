import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface BalanceCardProps {
    balance: number;
    income: number;
    expenses: number;
    currencySymbol: string;
}

// Animated number component
const AnimatedNumber: React.FC<{ value: number; prefix?: string; delay?: number }> = ({
    value,
    prefix = '₹',
    delay = 0,
}) => {
    // ... logic
    return (
        <Animated.Text style={[styles.balanceAmount, animatedStyle]}>
            {prefix}{formatNumber(value)}
        </Animated.Text>
    );
};

export default function BalanceCard({ balance, income, expenses, currencySymbol }: BalanceCardProps) {
    const cardScale = useSharedValue(0.9);
    const cardOpacity = useSharedValue(0);
    const incomeTranslate = useSharedValue(30);
    const expenseTranslate = useSharedValue(30);

    useEffect(() => {
        cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        cardOpacity.value = withTiming(1, { duration: 600 });
        incomeTranslate.value = withDelay(300, withSpring(0, { damping: 15 }));
        expenseTranslate.value = withDelay(400, withSpring(0, { damping: 15 }));
    }, []);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
        opacity: cardOpacity.value,
    }));

    const incomeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: incomeTranslate.value }],
        opacity: interpolate(incomeTranslate.value, [30, 0], [0, 1]),
    }));

    const expenseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: expenseTranslate.value }],
        opacity: interpolate(expenseTranslate.value, [30, 0], [0, 1]),
    }));

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    return (
        <Animated.View style={[styles.container, cardAnimatedStyle]}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Glass overlay effect */}
                <View style={styles.glassOverlay} />

                <View style={styles.content}>
                    {/* Balance Section */}
                    <View style={styles.balanceSection}>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <AnimatedNumber value={balance} prefix={currencySymbol} delay={200} />
                    </View>

                    {/* Income/Expense Row */}
                    <View style={styles.statsRow}>
                        <Animated.View style={[styles.statItem, incomeAnimatedStyle]}>
                            <View style={[styles.statIcon, styles.incomeIcon]}>
                                <Ionicons name="arrow-down" size={16} color={Colors.success} />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Income</Text>
                                <Text style={[styles.statAmount, styles.incomeColor]}>
                                    {currencySymbol}{formatCurrency(income)}
                                </Text>
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.statItem, expenseAnimatedStyle]}>
                            <View style={[styles.statIcon, styles.expenseIcon]}>
                                <Ionicons name="arrow-up" size={16} color={Colors.danger} />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Expenses</Text>
                                <Text style={[styles.statAmount, styles.expenseColor]}>
                                    {currencySymbol}{formatCurrency(expenses)}
                                </Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* Decorative circles */}
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: Spacing.base,
        marginTop: Spacing.md,
        borderRadius: Radius.xl,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    gradient: {
        padding: Spacing.xl,
        borderRadius: Radius.xl,
        position: 'relative',
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: Radius.xl,
    },
    content: {
        zIndex: 1,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    balanceAmount: {
        color: Colors.text,
        fontSize: Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        letterSpacing: -1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.base,
        borderRadius: Radius.lg,
        flex: 0.48,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    incomeIcon: {
        backgroundColor: 'rgba(0, 230, 118, 0.2)',
    },
    expenseIcon: {
        backgroundColor: 'rgba(255, 82, 82, 0.2)',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
    },
    statAmount: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    incomeColor: {
        color: Colors.successLight,
    },
    expenseColor: {
        color: Colors.dangerLight,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorCircle1: {
        width: 150,
        height: 150,
        top: -50,
        right: -30,
    },
    decorCircle2: {
        width: 100,
        height: 100,
        bottom: -30,
        left: -20,
    },
});
