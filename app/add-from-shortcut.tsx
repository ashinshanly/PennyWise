import { Categories, CategoryId, Colors } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { categorizeTransaction, parseBankMessage } from '@/utils/categorizer';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
    const { addTransaction, accounts, isPro } = useTransactions();

    const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'premium_required'>('processing');
    const [transactionDetails, setTransactionDetails] = useState<{
        amount: number;
        description: string;
        type: 'income' | 'expense';
        category: CategoryId;
        accountName?: string;
    } | null>(null);

    useEffect(() => {
        if (!isPro) {
            setStatus('premium_required');
            return;
        }

        if (accounts.length > 0) {
            processTransaction();
        }
    }, [accounts, isPro]);

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

                {status === 'premium_required' && (
                    <Animated.View entering={FadeIn} style={styles.statusContainer}>
                        <View style={[styles.errorIcon, { backgroundColor: '#FFD700' + '20', padding: 20, borderRadius: 50 }]}>
                            <Ionicons name="diamond" size={60} color="#FFD700" />
                        </View>
                        <Text style={styles.statusTitle}>Premium Feature</Text>
                        <Text style={styles.statusText}>
                            Automated SMS tracking is a Pro feature. Please upgrade to continue.
                        </Text>

                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
                            onPress={() => router.push('/subscription')}
                        >
                            <Text style={styles.retryButtonText}>Upgrade Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 20 }}
                            onPress={() => router.replace('/')}
                        >
                            <Text style={{ color: Colors.textMuted }}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView >
    );
}


