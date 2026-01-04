import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInRight
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TutorialStep {
    id: number;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    details?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 1,
        title: 'Open Shortcuts App',
        description: 'Open the Shortcuts app on your iPhone and go to the "Automation" tab at the bottom.',
        icon: 'apps-outline',
    },
    {
        id: 2,
        title: 'Create New Automation',
        description: 'Tap the "+" button, then select "Create Personal Automation".',
        icon: 'add-circle-outline',
    },
    {
        id: 3,
        title: 'Set Message Trigger',
        description: 'Choose "Message" as your trigger. Select your bank as the sender (e.g., "HDFC-Bank", "SBI", "ICICI").',
        icon: 'chatbubble-outline',
        details: [
            'Tap "Sender" and choose "Contact"',
            'Search for your bank name',
            'You can add multiple bank senders',
        ],
    },
    {
        id: 4,
        title: 'Add URL Action',
        description: 'Search for "URL" action and add it. Paste the template URL we provide.',
        icon: 'link-outline',
        details: [
            'Tap "Add Action"',
            'Search for "URL"',
            'Paste the URL template (copy below)',
        ],
    },
    {
        id: 5,
        title: 'Add Open URL Action',
        description: 'Search for "Open URLs" action and add it after the URL action.',
        icon: 'open-outline',
    },
    {
        id: 6,
        title: 'Enable Run Immediately',
        description: 'Turn off "Ask Before Running" so transactions are added automatically.',
        icon: 'flash-outline',
        details: [
            'Tap "Next" after adding actions',
            'Toggle OFF "Ask Before Running"',
            'Tap "Done" to save',
        ],
    },
];

const URL_TEMPLATE = 'expense-tracker://add-from-shortcut?amount=AMOUNT&desc=MERCHANT&type=expense&bank=SENDER';

export default function ScanScreen() {
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [copiedUrl, setCopiedUrl] = useState(false);

    const handleOpenShortcuts = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            // Try to open Shortcuts app
            const canOpen = await Linking.canOpenURL('shortcuts://');
            if (canOpen) {
                await Linking.openURL('shortcuts://create-automation');
            } else {
                Alert.alert(
                    'Shortcuts App',
                    'Please open the Shortcuts app manually from your home screen.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.log('Could not open Shortcuts:', error);
        }
    };

    const handleCopyUrl = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Clipboard.setStringAsync(URL_TEMPLATE);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const toggleStep = (stepId: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpandedStep(expandedStep === stepId ? null : stepId);
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
                    <Text style={styles.title}>Auto-Track Expenses</Text>
                    <Text style={styles.subtitle}>
                        Set up iOS Shortcuts to automatically import transactions from bank SMS
                    </Text>
                </Animated.View>

                {/* How It Works Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.howItWorksCard}>
                    <View style={styles.howItWorksHeader}>
                        <Ionicons name="bulb" size={24} color={Colors.warning} />
                        <Text style={styles.howItWorksTitle}>How It Works</Text>
                    </View>
                    <View style={styles.flowDiagram}>
                        <View style={styles.flowStep}>
                            <View style={[styles.flowIcon, { backgroundColor: Colors.primary + '30' }]}>
                                <Ionicons name="chatbubble" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.flowLabel}>Bank SMS</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                        <View style={styles.flowStep}>
                            <View style={[styles.flowIcon, { backgroundColor: Colors.secondary + '30' }]}>
                                <Ionicons name="flash" size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.flowLabel}>Shortcut</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                        <View style={styles.flowStep}>
                            <View style={[styles.flowIcon, { backgroundColor: Colors.success + '30' }]}>
                                <Ionicons name="wallet" size={20} color={Colors.success} />
                            </View>
                            <Text style={styles.flowLabel}>Saved</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* URL Template */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.urlCard}>
                    <Text style={styles.urlLabel}>URL Template (Step 4)</Text>
                    <View style={styles.urlContainer}>
                        <Text style={styles.urlText} numberOfLines={2}>
                            {URL_TEMPLATE}
                        </Text>
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopyUrl}>
                            <Ionicons
                                name={copiedUrl ? 'checkmark' : 'copy-outline'}
                                size={20}
                                color={copiedUrl ? Colors.success : Colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                    {copiedUrl && (
                        <Text style={styles.copiedText}>✓ Copied to clipboard!</Text>
                    )}
                    <Text style={styles.urlHint}>
                        In Shortcuts, replace AMOUNT, MERCHANT, and SENDER with the corresponding variables from the message.
                    </Text>
                </Animated.View>

                {/* Tutorial Steps */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>Setup Guide</Text>

                    {TUTORIAL_STEPS.map((step, index) => (
                        <Animated.View
                            key={step.id}
                            entering={FadeInRight.delay(300 + index * 50).duration(300)}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.stepCard,
                                    expandedStep === step.id && styles.stepCardExpanded,
                                ]}
                                onPress={() => toggleStep(step.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.stepHeader}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{step.id}</Text>
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepTitle}>{step.title}</Text>
                                        <Text style={styles.stepDescription}>{step.description}</Text>
                                    </View>
                                    <View style={styles.stepIcon}>
                                        <Ionicons name={step.icon} size={24} color={Colors.primary} />
                                    </View>
                                </View>

                                {expandedStep === step.id && step.details && (
                                    <Animated.View entering={FadeIn.duration(200)} style={styles.stepDetails}>
                                        {step.details.map((detail, i) => (
                                            <View key={i} style={styles.detailRow}>
                                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                                <Text style={styles.detailText}>{detail}</Text>
                                            </View>
                                        ))}
                                    </Animated.View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Open Shortcuts Button */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                    <TouchableOpacity style={styles.openButton} onPress={handleOpenShortcuts}>
                        <Ionicons name="apps" size={22} color={Colors.text} />
                        <Text style={styles.openButtonText}>Open Shortcuts App</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Tip Card */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.tipCard}>
                    <Ionicons name="information-circle" size={20} color={Colors.primary} />
                    <Text style={styles.tipText}>
                        For best results, add all your bank senders to the same automation so all transactions are tracked automatically.
                    </Text>
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
    subtitle: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
        lineHeight: 20,
    },
    howItWorksCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    howItWorksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    howItWorksTitle: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    flowDiagram: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
    },
    flowStep: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    flowIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flowLabel: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
    },
    urlCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    urlLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: Spacing.sm,
    },
    urlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    urlText: {
        flex: 1,
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontFamily: 'SpaceMono',
    },
    copyButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
    },
    copiedText: {
        color: Colors.success,
        fontSize: Typography.sizes.xs,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    urlHint: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
        marginTop: Spacing.sm,
        lineHeight: 16,
    },
    stepsSection: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.md,
    },
    stepCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    stepCardExpanded: {
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        color: Colors.text,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        color: Colors.text,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        marginBottom: 4,
    },
    stepDescription: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
        lineHeight: 18,
    },
    stepIcon: {
        padding: Spacing.xs,
    },
    stepDetails: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: Spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    detailText: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
    },
    openButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: Radius.lg,
        marginBottom: Spacing.lg,
    },
    openButtonText: {
        color: Colors.text,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    tipCard: {
        flexDirection: 'row',
        gap: Spacing.md,
        backgroundColor: Colors.primary + '15',
        borderRadius: Radius.lg,
        padding: Spacing.md,
    },
    tipText: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: Typography.sizes.sm,
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 100,
    },
});
