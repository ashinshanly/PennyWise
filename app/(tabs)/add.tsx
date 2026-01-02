import { Categories, CategoryId, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const categoryList = Object.values(Categories).filter(c => c.id !== 'income');

export default function AddScreen() {
    const router = useRouter();
    const { addTransaction } = useTransactions();

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [category, setCategory] = useState<CategoryId>('food');
    const [description, setDescription] = useState('');

    const buttonScale = useSharedValue(1);

    const handleNumberPress = (num: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (num === '.' && amount.includes('.')) return;
        if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
        setAmount(prev => prev + num);
    };

    const handleBackspace = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAmount(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setAmount('');
    };

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        await addTransaction({
            amount: parseFloat(amount),
            type,
            category: type === 'income' ? 'income' : category,
            description: description || Categories[category].name,
            date: new Date().toISOString(),
            source: 'manual',
        });

        // Reset form
        setAmount('');
        setDescription('');

        // Navigate back to home
        router.push('/');
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const numpadButtons = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', 'backspace'],
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                        <Text style={styles.title}>Add Transaction</Text>
                    </Animated.View>

                    {/* Type Toggle */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.typeToggle}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setType('expense');
                            }}
                        >
                            <Ionicons
                                name="arrow-up-circle"
                                size={20}
                                color={type === 'expense' ? Colors.text : Colors.textMuted}
                            />
                            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                                Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setType('income');
                            }}
                        >
                            <Ionicons
                                name="arrow-down-circle"
                                size={20}
                                color={type === 'income' ? Colors.text : Colors.textMuted}
                            />
                            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                                Income
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Amount Display */}
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <Text style={[styles.amountText, !amount && styles.amountPlaceholder]}>
                            {amount || '0'}
                        </Text>
                    </Animated.View>

                    {/* Categories (only for expenses) */}
                    {type === 'expense' && (
                        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                            <Text style={styles.sectionLabel}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {categoryList.map((cat, index) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryPill,
                                            category === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color },
                                        ]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setCategory(cat.id as CategoryId);
                                        }}
                                    >
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={18}
                                            color={category === cat.id ? cat.color : Colors.textMuted}
                                        />
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                category === cat.id && { color: cat.color },
                                            ]}
                                        >
                                            {cat.name.split(' ')[0]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}

                    {/* Description Input */}
                    <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.inputContainer}>
                        <Text style={styles.sectionLabel}>Note (optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Add a note..."
                            placeholderTextColor={Colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </Animated.View>

                    {/* Numpad */}
                    <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.numpad}>
                        {numpadButtons.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.numpadRow}>
                                {row.map((btn) => (
                                    <TouchableOpacity
                                        key={btn}
                                        style={styles.numpadButton}
                                        onPress={() => {
                                            if (btn === 'backspace') {
                                                handleBackspace();
                                            } else {
                                                handleNumberPress(btn);
                                            }
                                        }}
                                        onLongPress={() => {
                                            if (btn === 'backspace') {
                                                handleClear();
                                            }
                                        }}
                                    >
                                        {btn === 'backspace' ? (
                                            <Ionicons name="backspace-outline" size={28} color={Colors.text} />
                                        ) : (
                                            <Text style={styles.numpadText}>{btn}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </Animated.View>

                    {/* Save Button */}
                    <AnimatedTouchable
                        style={[
                            styles.saveButton,
                            buttonAnimatedStyle,
                            type === 'income' ? styles.saveButtonIncome : styles.saveButtonExpense,
                            !amount && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={!amount}
                    >
                        <Text style={styles.saveButtonText}>
                            {type === 'expense' ? 'Add Expense' : 'Add Income'}
                        </Text>
                    </AnimatedTouchable>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardAvoid: {
        flex: 1,
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
        textAlign: 'center',
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
    },
    typeButtonActive: {
        backgroundColor: Colors.danger + '30',
    },
    typeButtonActiveIncome: {
        backgroundColor: Colors.success + '30',
    },
    typeText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
    },
    typeTextActive: {
        color: Colors.text,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    currencySymbol: {
        color: Colors.textMuted,
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.medium,
        marginRight: Spacing.xs,
    },
    amountText: {
        color: Colors.text,
        fontSize: Typography.sizes['4xl'],
        fontWeight: Typography.weights.bold,
    },
    amountPlaceholder: {
        color: Colors.textMuted,
    },
    sectionLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    categoriesContainer: {
        paddingBottom: Spacing.base,
        gap: Spacing.sm,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Spacing.sm,
    },
    categoryText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    inputContainer: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    textInput: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        color: Colors.text,
        fontSize: Typography.sizes.base,
    },
    numpad: {
        marginBottom: Spacing.xl,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    numpadButton: {
        width: '31%',
        aspectRatio: 2,
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadText: {
        color: Colors.text,
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.medium,
    },
    saveButton: {
        paddingVertical: Spacing.lg,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonExpense: {
        backgroundColor: Colors.primary,
    },
    saveButtonIncome: {
        backgroundColor: Colors.success,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    bottomSpacer: {
        height: 100,
    },
});
