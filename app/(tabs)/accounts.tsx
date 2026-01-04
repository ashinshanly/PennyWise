import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { Account, useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCOUNT_TYPES = [
    { id: 'bank', label: 'Bank', icon: 'business' },
    { id: 'card', label: 'Card', icon: 'card' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    { id: 'cash', label: 'Cash', icon: 'cash' },
];

const COLORS = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#607D8B', // Blue Grey
];

export default function AccountsScreen() {
    const router = useRouter();
    const { accounts, accountBalances, addAccount, deleteAccount } = useTransactions();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('bank');
    const [initialBalance, setInitialBalance] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[1]);

    const handleAddAccount = async () => {
        if (!name.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        await addAccount({
            name: name.trim(),
            type,
            initialBalance: parseFloat(initialBalance) || 0,
            color: selectedColor,
        });

        resetForm();
        setIsModalVisible(false);
    };

    const handleDeleteAccount = (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        // In a real app, we'd confirm this first
        deleteAccount(id);
    };

    const resetForm = () => {
        setName('');
        setType('bank');
        setInitialBalance('');
        setSelectedColor(COLORS[1]);
    };

    const openModal = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        resetForm();
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const renderAccountItem = ({ item, index }: { item: Account; index: number }) => {
        const balance = accountBalances[item.id] || 0;
        const typeInfo = ACCOUNT_TYPES.find(t => t.id === item.type) || ACCOUNT_TYPES[0];

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    style={[styles.accountCard, { borderLeftColor: item.color }]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        router.push(`/account/${item.id}`);
                    }}
                >
                    <View style={styles.accountIconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={typeInfo.icon as any} size={24} color={item.color} />
                        </View>
                    </View>

                    <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{item.name}</Text>
                        <Text style={styles.accountType}>{typeInfo.label}</Text>
                    </View>

                    <View style={styles.accountBalance}>
                        <Text style={[styles.balanceText, { color: balance >= 0 ? Colors.text : Colors.danger }]}>
                            {formatCurrency(balance)}
                        </Text>
                    </View>

                    {/* Simple delete button for demo */}
                    {accounts.length > 1 && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteAccount(item.id);
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Accounts</Text>
                <TouchableOpacity style={styles.addButton} onPress={openModal}>
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={accounts}
                keyExtractor={item => item.id}
                renderItem={renderAccountItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Account Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Account</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Account Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. HDFC Bank, Wallet"
                                    placeholderTextColor={Colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Account Type</Text>
                                <View style={styles.typeContainer}>
                                    {ACCOUNT_TYPES.map((t) => (
                                        <TouchableOpacity
                                            key={t.id}
                                            style={[
                                                styles.typeChip,
                                                type === t.id && styles.typeChipSelected,
                                                type === t.id && { backgroundColor: selectedColor }
                                            ]}
                                            onPress={() => {
                                                setType(t.id as any);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <Ionicons
                                                name={t.icon as any}
                                                size={16}
                                                color={type === t.id ? '#FFF' : Colors.textMuted}
                                            />
                                            <Text style={[
                                                styles.typeText,
                                                type === t.id && styles.typeTextSelected
                                            ]}>
                                                {t.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Initial Balance</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="numeric"
                                    value={initialBalance}
                                    onChangeText={setInitialBalance}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Color Tag</Text>
                                <View style={styles.colorContainer}>
                                    {COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorCircle,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.colorCircleSelected
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: selectedColor }]}
                                onPress={handleAddAccount}
                            >
                                <Text style={styles.saveButtonText}>Create Account</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: Spacing.md,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
    },
    accountIconContainer: {
        marginRight: Spacing.md,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.text,
        marginBottom: 2,
    },
    accountType: {
        fontSize: Typography.sizes.xs,
        color: Colors.textMuted,
    },
    accountBalance: {
        alignItems: 'flex-end',
    },
    balanceText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
    },
    deleteButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.sm,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        paddingTop: Spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text,
    },
    formContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl * 2,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: Radius.md,
        padding: Spacing.md,
        color: Colors.text,
        fontSize: Typography.sizes.base,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 6,
    },
    typeChipSelected: {
        borderColor: 'transparent',
    },
    typeText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.sm,
    },
    typeTextSelected: {
        color: '#FFF',
        fontWeight: Typography.weights.medium,
    },
    colorContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        flexWrap: 'wrap',
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: Colors.card,
        transform: [{ scale: 1.1 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    saveButton: {
        padding: Spacing.md,
        borderRadius: Radius.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
});
