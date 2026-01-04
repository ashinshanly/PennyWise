import { Categories, CategoryId, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { categorizeTransaction, parseBankMessage } from '@/utils/categorizer';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { BounceIn, FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Deep Link Handler Screen
 * 
 * Receives transaction data from iOS Shortcuts via URL scheme:
 * expense-tracker://add-from-shortcut?amount=450&desc=SWIGGY&type=expense
 */
export default function AddFromShortcutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        amount?: string;
        desc?: string;
        type?: string;
        bank?: string;
        sms?: string;
        sender?: string;
    }>();
    const { addTransaction, accounts } = useTransactions();

    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [transactionDetails, setTransactionDetails] = useState<{
        amount: number;
        description: string;
        type: 'income' | 'expense';
        category: CategoryId;
        accountName?: string;
    } | null>(null);

    useEffect(() => {
        if (accounts.length > 0) {
            processTransaction();
        }
    }, [accounts]);

    const processTransaction = async () => {
        try {
            let amount = 0;
            let description = '';
            let type: 'income' | 'expense' = 'expense';
            let category: CategoryId = 'other';

            if (params.sms) {
                // Parse from raw SMS
                const smsContent = decodeURIComponent(params.sms);
                console.log('Parsing SMS:', smsContent);
                const parsed = parseBankMessage(smsContent);

                amount = parsed.amount || 0;
                description = parsed.description;
                type = parsed.type;
                category = parsed.category;

                // Fallback description if parser fails
                if (!description) description = 'Transaction from SMS';
            } else {
                // Legacy: Parse individual params
                amount = parseFloat(params.amount || '0');
                description = decodeURIComponent(params.desc || 'Transaction from SMS');
                type = (params.type === 'income' ? 'income' : 'expense') as 'income' | 'expense';
                category = type === 'income' ? 'income' : categorizeTransaction(description);
            }

            if (isNaN(amount) || amount <= 0) {
                setStatus('error');
                return;
            }

            // Find matching account
            let accountId = accounts[0]?.id; // Default to first account
            let accountName = accounts[0]?.name;

            const bankIdentifier = (params.bank || params.sender || '').toLowerCase();
            if (bankIdentifier) {
                const bankName = decodeURIComponent(bankIdentifier);
                const matchedAccount = accounts.find(acc =>
                    acc.name.toLowerCase().includes(bankName) ||
                    bankName.includes(acc.name.toLowerCase())
                );
                if (matchedAccount) {
                    accountId = matchedAccount.id;
                    accountName = matchedAccount.name;
                }
            } else {
                // Default logic if no bank param
                const defaultAcc = accounts.find(a => a.type === 'bank') || accounts[0];
                if (defaultAcc) {
                    accountId = defaultAcc.id;
                    accountName = defaultAcc.name;
                }
            }

            setTransactionDetails({ amount, description, type, category, accountName });

            // Save transaction
            await addTransaction({
                amount,
                type,
                category,
                description,
                date: new Date().toISOString(),
                source: 'sms',
                accountId,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStatus('success');

            // Auto-navigate to home after delay
            setTimeout(() => {
                router.replace('/');
            }, 2000);

        } catch (error) {
            console.error('Error processing transaction:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setStatus('error');
        }
    };

    const getCategoryInfo = (categoryId: CategoryId) => {
        return Categories[categoryId] || Categories.other;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {status === 'processing' && (
                    <Animated.View entering={FadeIn} style={styles.statusContainer}>
                        <View style={styles.processingIcon}>
                            <Ionicons name="sync" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.statusTitle}>Processing...</Text>
                        <Text style={styles.statusText}>Adding transaction from SMS</Text>
                    </Animated.View>
                )}

                {status === 'success' && transactionDetails && (
                    <Animated.View entering={BounceIn} style={styles.statusContainer}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
                        </View>
                        <Text style={styles.statusTitle}>Transaction Added!</Text>

                        <Animated.View entering={FadeInUp.delay(200)} style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Amount</Text>
                                <Text style={[
                                    styles.detailAmount,
                                    transactionDetails.type === 'income' ? styles.incomeText : styles.expenseText
                                ]}>
                                    {transactionDetails.type === 'income' ? '+' : '-'}₹{transactionDetails.amount.toLocaleString('en-IN')}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Description</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {transactionDetails.description}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Account</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {transactionDetails.accountName}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Category</Text>
                                <View style={styles.categoryBadge}>
                                    <Ionicons
                                        name={getCategoryInfo(transactionDetails.category).icon as any}
                                        size={16}
                                        color={getCategoryInfo(transactionDetails.category).color}
                                    />
                                    <Text style={[
                                        styles.categoryText,
                                        { color: getCategoryInfo(transactionDetails.category).color }
                                    ]}>
                                        {getCategoryInfo(transactionDetails.category).name}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        <Text style={styles.redirectText}>Redirecting to home...</Text>
                    </Animated.View>
                )}

                {status === 'error' && (
                    <Animated.View entering={FadeIn} style={styles.statusContainer}>
                        <View style={styles.errorIcon}>
                            <Ionicons name="alert-circle" size={80} color={Colors.danger} />
                        </View>
                        <Text style={styles.statusTitle}>Something went wrong</Text>
                        <Text style={styles.statusText}>Could not process the transaction</Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => router.replace('/')}
                        >
                            <Text style={styles.retryButtonText}>Go to Home</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    statusContainer: {
        alignItems: 'center',
        width: '100%',
    },
    processingIcon: {
        marginBottom: Spacing.lg,
    },
    successIcon: {
        marginBottom: Spacing.lg,
    },
    errorIcon: {
        marginBottom: Spacing.lg,
    },
    statusTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    statusText: {
        fontSize: Typography.sizes.base,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    redirectText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        marginTop: Spacing.xl,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginTop: Spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    detailLabel: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
    },
    detailAmount: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    detailValue: {
        fontSize: Typography.sizes.base,
        color: Colors.text,
        flex: 1,
        textAlign: 'right',
        marginLeft: Spacing.md,
    },
    incomeText: {
        color: Colors.success,
    },
    expenseText: {
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    categoryText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    retryButton: {
        marginTop: Spacing.xl,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.lg,
    },
    retryButtonText: {
        color: Colors.text,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
});
