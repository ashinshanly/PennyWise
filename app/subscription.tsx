import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionScreen() {
    const router = useRouter();
    const { unlockPro, currencySymbol } = useTransactions();
    const [processing, setProcessing] = useState(false);

    const scale = useSharedValue(1);

    const handleSubscribe = async () => {
        setProcessing(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Simulate network request
        setTimeout(async () => {
            await unlockPro();
            setProcessing(false);
            Alert.alert(
                'Welcome to Pro! 🌟',
                'You now have access to automated SMS tracking and more!',
                [{ text: 'Awesome!', onPress: () => router.back() }]
            );
        }, 1500);
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.95);
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
    };

    const FEATURES = [
        {
            icon: 'chatbubble-ellipses',
            title: 'Automated SMS Tracking',
            desc: 'Automatically track expenses from bank SMS alerts without lifting a finger.',
        },
        {
            icon: 'pie-chart',
            title: 'Advanced Analytics',
            desc: 'Get deeper insights into your spending habits with unlimited history.',
        },
        {
            icon: 'cloud-upload',
            title: 'Cloud Backup (Coming Soon)',
            desc: 'Securely backup your data to the cloud and sync across devices.',
        },
        {
            icon: 'shield-checkmark',
            title: 'Priority Support',
            desc: 'Get help faster when you need it.',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>

                {/* Hero Section */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="diamond" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Unlock PennyWise Pro</Text>
                    <Text style={styles.subtitle}>Supercharge your expense tracking</Text>
                </Animated.View>

                {/* Features List */}
                <View style={styles.featuresContainer}>
                    {FEATURES.map((feature, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(index * 100 + 300).duration(500)}
                            style={styles.featureRow}
                        >
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon as any} size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Bottom Spacer */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.actionContainer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Monthly Plan</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹19</Text>
                        <Text style={styles.period}>/ month</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubscribe}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    disabled={processing}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.subscribeButton, animatedButtonStyle]}>
                        {processing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.subscribeText}>Subscribe Now</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </Animated.View>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>Cancel anytime. Secure payment.</Text>
            </Animated.View>
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
        padding: Spacing.lg,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: Radius.full,
    },
    hero: {
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing['2xl'],
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.lg,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    featuresContainer: {
        gap: Spacing.xl,
    },
    featureRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: Radius.lg,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    actionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.card,
        borderTopLeftRadius: Radius['2xl'],
        borderTopRightRadius: Radius['2xl'],
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    priceLabel: {
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    price: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.bold,
        color: Colors.text,
    },
    period: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
    },
    subscribeButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: Radius.xl,
        gap: Spacing.sm,
    },
    subscribeText: {
        color: '#fff',
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    disclaimer: {
        textAlign: 'center',
        fontSize: Typography.sizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.md,
    },
});
