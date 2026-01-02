import { Categories, CategoryId, Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { MockSMSMessages } from '@/constants/MockData';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ParsedSMS {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    parsed: {
        amount: number;
        type: 'income' | 'expense';
        category: CategoryId;
        description: string;
    };
    selected: boolean;
}

export default function ScanScreen() {
    const router = useRouter();
    const { importTransactions } = useTransactions();
    const [isScanning, setIsScanning] = useState(false);
    const [scannedMessages, setScannedMessages] = useState<ParsedSMS[]>([]);
    const [showResults, setShowResults] = useState(false);

    const pulseScale = useSharedValue(1);
    const rotateValue = useSharedValue(0);

    useEffect(() => {
        if (isScanning) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            rotateValue.value = withRepeat(
                withTiming(360, { duration: 2000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            pulseScale.value = withTiming(1);
            rotateValue.value = 0;
        }
    }, [isScanning]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotateValue.value}deg` }],
    }));

    const handleScan = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsScanning(true);
        setShowResults(false);

        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Use mock data as "scanned" messages
        const parsedMessages: ParsedSMS[] = MockSMSMessages.map(sms => ({
            ...sms,
            selected: true,
        }));

        setScannedMessages(parsedMessages);
        setIsScanning(false);
        setShowResults(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const toggleMessageSelection = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setScannedMessages(prev =>
            prev.map(msg =>
                msg.id === id ? { ...msg, selected: !msg.selected } : msg
            )
        );
    };

    const handleImport = async () => {
        const selectedMessages = scannedMessages.filter(msg => msg.selected);
        if (selectedMessages.length === 0) {
            Alert.alert('No Selection', 'Please select at least one transaction to import.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const transactionsToImport = selectedMessages.map(msg => ({
            amount: msg.parsed.amount,
            type: msg.parsed.type,
            category: msg.parsed.category,
            description: msg.parsed.description,
            date: msg.timestamp,
            source: 'sms' as const,
        }));

        await importTransactions(transactionsToImport);

        Alert.alert(
            'Import Successful',
            `${selectedMessages.length} transactions have been imported.`,
            [{ text: 'OK', onPress: () => router.push('/') }]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={styles.title}>Scan Messages</Text>
                </Animated.View>

                {/* Info Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="information-circle" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Demo Mode</Text>
                        <Text style={styles.infoText}>
                            Due to iOS privacy restrictions, apps cannot access SMS messages directly.
                            This is a simulation showing how the feature would work with sample bank messages.
                        </Text>
                    </View>
                </Animated.View>

                {/* Scan Button */}
                {!showResults && (
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.scanContainer}>
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={handleScan}
                            disabled={isScanning}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={[styles.scanButtonInner, pulseStyle]}>
                                {isScanning ? (
                                    <Animated.View style={rotateStyle}>
                                        <Ionicons name="sync" size={48} color={Colors.text} />
                                    </Animated.View>
                                ) : (
                                    <Ionicons name="scan" size={48} color={Colors.text} />
                                )}
                            </Animated.View>
                            <View style={styles.scanRing} />
                            <View style={styles.scanRing2} />
                        </TouchableOpacity>

                        <Text style={styles.scanLabel}>
                            {isScanning ? 'Scanning messages...' : 'Tap to scan messages'}
                        </Text>
                        <Text style={styles.scanSubtext}>
                            We'll look for bank transaction alerts
                        </Text>
                    </Animated.View>
                )}

                {/* Results */}
                {showResults && (
                    <Animated.View entering={FadeInUp.duration(400)}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>
                                Found {scannedMessages.length} Transactions
                            </Text>
                            <TouchableOpacity
                                style={styles.rescanButton}
                                onPress={() => {
                                    setShowResults(false);
                                    setScannedMessages([]);
                                }}
                            >
                                <Ionicons name="refresh" size={18} color={Colors.primary} />
                                <Text style={styles.rescanText}>Rescan</Text>
                            </TouchableOpacity>
                        </View>

                        {scannedMessages.map((msg, index) => {
                            const category = Categories[msg.parsed.category];
                            const isExpense = msg.parsed.type === 'expense';

                            return (
                                <Animated.View
                                    key={msg.id}
                                    entering={FadeInUp.delay(index * 100).duration(300)}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.messageCard,
                                            msg.selected && styles.messageCardSelected,
                                        ]}
                                        onPress={() => toggleMessageSelection(msg.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.messageCheckbox}>
                                            <Ionicons
                                                name={msg.selected ? 'checkbox' : 'square-outline'}
                                                size={24}
                                                color={msg.selected ? Colors.primary : Colors.textMuted}
                                            />
                                        </View>

                                        <View style={styles.messageContent}>
                                            <View style={styles.messageHeader}>
                                                <Text style={styles.messageSender}>{msg.sender}</Text>
                                                <Text style={styles.messageTime}>{formatDate(msg.timestamp)}</Text>
                                            </View>

                                            <Text style={styles.messageText} numberOfLines={2}>
                                                {msg.message}
                                            </Text>

                                            <View style={styles.parsedInfo}>
                                                <View style={[styles.categoryTag, { backgroundColor: category.color + '20' }]}>
                                                    <Ionicons name={category.icon as any} size={14} color={category.color} />
                                                    <Text style={[styles.categoryTagText, { color: category.color }]}>
                                                        {category.name.split(' ')[0]}
                                                    </Text>
                                                </View>
                                                <Text style={[
                                                    styles.parsedAmount,
                                                    isExpense ? styles.expenseAmount : styles.incomeAmount
                                                ]}>
                                                    {isExpense ? '-' : '+'}₹{msg.parsed.amount.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}

                        {/* Import Button */}
                        <TouchableOpacity
                            style={[
                                styles.importButton,
                                scannedMessages.filter(m => m.selected).length === 0 && styles.importButtonDisabled
                            ]}
                            onPress={handleImport}
                        >
                            <Ionicons name="download-outline" size={22} color={Colors.text} />
                            <Text style={styles.importButtonText}>
                                Import {scannedMessages.filter(m => m.selected).length} Transactions
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '15',
        borderRadius: Radius.lg,
        padding: Spacing.base,
        marginBottom: Spacing.xl,
        gap: Spacing.md,
    },
    infoIcon: {
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.xs,
    },
    infoText: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        lineHeight: 20,
    },
    scanContainer: {
        alignItems: 'center',
        paddingVertical: Spacing['3xl'],
    },
    scanButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    scanButtonInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    scanRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: Colors.primary + '40',
    },
    scanRing2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1,
        borderColor: Colors.primary + '20',
    },
    scanLabel: {
        color: Colors.text,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        marginTop: Spacing.xl,
    },
    scanSubtext: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    resultsTitle: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    rescanText: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    messageCard: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    messageCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    messageCheckbox: {
        marginRight: Spacing.md,
        justifyContent: 'center',
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    messageSender: {
        color: Colors.text,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    messageTime: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    messageText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
        lineHeight: 16,
        marginBottom: Spacing.sm,
    },
    parsedInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: 4,
        paddingHorizontal: Spacing.sm,
        borderRadius: Radius.full,
    },
    categoryTagText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
    },
    parsedAmount: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    incomeAmount: {
        color: Colors.success,
    },
    expenseAmount: {
        color: Colors.danger,
    },
    importButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: Radius.lg,
        marginTop: Spacing.lg,
    },
    importButtonDisabled: {
        opacity: 0.5,
    },
    importButtonText: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    bottomSpacer: {
        height: 100,
    },
});
