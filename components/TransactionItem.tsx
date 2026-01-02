import { Categories, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Transaction } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface TransactionItemProps {
    transaction: Transaction;
    index: number;
    onDelete?: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

export default function TransactionItem({ transaction, index, onDelete }: TransactionItemProps) {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(70);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const category = Categories[transaction.category] || Categories.other;
    const isIncome = transaction.type === 'income';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const formatAmount = (amount: number) => {
        return `${isIncome ? '+' : '-'}₹${amount.toLocaleString('en-IN')}`;
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        opacity.value = withTiming(0, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 200 }, () => {
            if (onDelete) {
                runOnJS(onDelete)(transaction.id);
            }
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationX < 0) {
                translateX.value = Math.max(event.translationX, -120);
            }
        })
        .onEnd((event) => {
            if (event.translationX < SWIPE_THRESHOLD) {
                translateX.value = withSpring(-100);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: scale.value },
        ],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value,
        opacity: opacity.value,
        marginBottom: interpolate(itemHeight.value, [0, 70], [0, Spacing.sm], Extrapolation.CLAMP),
    }));

    const deleteButtonStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-100, -50, 0], [1, 0.5, 0], Extrapolation.CLAMP),
        transform: [
            {
                scale: interpolate(translateX.value, [-100, -50, 0], [1, 0.8, 0.5], Extrapolation.CLAMP)
            },
        ],
    }));

    // Entrance animation delay based on index
    const entranceStyle = useAnimatedStyle(() => ({
        opacity: withSpring(1, { delay: index * 50 }),
        transform: [
            {
                translateY: withSpring(0, {
                    delay: index * 50,
                    damping: 15,
                    stiffness: 100,
                })
            },
        ],
    }));

    return (
        <Animated.View style={[styles.container, containerStyle, entranceStyle]}>
            {/* Delete button behind */}
            <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButtonInner}>
                    <Ionicons name="trash-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
            </Animated.View>

            {/* Main content */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.content, animatedStyle]}>
                    {/* Category Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                        <Ionicons
                            name={category.icon as any}
                            size={22}
                            color={category.color}
                        />
                    </View>

                    {/* Transaction Details */}
                    <View style={styles.details}>
                        <Text style={styles.description} numberOfLines={1}>
                            {transaction.description}
                        </Text>
                        <Text style={styles.category}>{category.name}</Text>
                    </View>

                    {/* Amount and Date */}
                    <View style={styles.amountContainer}>
                        <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                            {formatAmount(transaction.amount)}
                        </Text>
                        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginHorizontal: Spacing.base,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.danger,
        borderRadius: Radius.lg,
    },
    deleteButtonInner: {
        padding: Spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    details: {
        flex: 1,
    },
    description: {
        color: Colors.text,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        marginBottom: 2,
    },
    category: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
        marginBottom: 2,
    },
    incomeAmount: {
        color: Colors.success,
    },
    expenseAmount: {
        color: Colors.text,
    },
    date: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
});
