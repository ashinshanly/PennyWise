import BalanceCard from '@/components/BalanceCard';
import SpendingChart from '@/components/SpendingChart';
import TransactionItem from '@/components/TransactionItem';
import { Colors, Radius, Spacing, Typography } from '@/constants/Colors';
import { CURRENCIES, useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const {
    transactions,
    notifications,
    loading,
    totals,
    spendingByCategory,
    recentTransactions,
    deleteTransaction,
    loadTransactions,
    currencySymbol,
    currency,
    setCurrency,
    accounts,
  } = useTransactions();

  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);

  const [refreshing, setRefreshing] = React.useState(false);

  // Auto-reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  const handleDelete = useCallback((id: string) => {
    deleteTransaction(id);
  }, [deleteTransaction]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening 👋</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Text style={{ fontSize: 20, color: Colors.text }}>{currencySymbol}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/scan')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              {notifications.some(n => !n.read) && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Setup Guide or Balance Card */}
        {accounts.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.setupCard}>
            <View style={styles.setupIconContainer}>
              <Ionicons name="wallet-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.setupContent}>
              <Text style={styles.setupTitle}>Setup Your Account</Text>
              <Text style={styles.setupDescription}>
                Create a bank account or wallet to start tracking your expenses automatically.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => router.push('/accounts')}
            >
              <Text style={styles.setupButtonText}>Add Account</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <BalanceCard
            balance={totals.balance}
            income={totals.income}
            expenses={totals.expenses}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Spending Chart */}
        <SpendingChart spendingByCategory={spendingByCategory} />

        {/* Recent Transactions */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.seeAll}>See All</Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                index={index}
                onDelete={handleDelete}
                currencySymbol={currencySymbol}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setShowCurrencyModal(false)}
          >
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40
            }}>
              <Text style={{
                color: Colors.text,
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16
              }}>Select Currency</Text>
              {Object.keys(CURRENCIES).map((code) => (
                <TouchableOpacity
                  key={code}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border
                  }}
                  onPress={() => {
                    setCurrency(code as any);
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={{ fontSize: 24, width: 40, color: Colors.text }}>
                    {CURRENCIES[code as keyof typeof CURRENCIES].symbol}
                  </Text>
                  <Text style={{ fontSize: 16, color: Colors.text, flex: 1 }}>
                    {CURRENCIES[code as keyof typeof CURRENCIES].name}
                  </Text>
                  {currency === code && (
                    <Ionicons name="checkmark" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    color: Colors.text,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  date: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.base,
  },
  emptyContainer: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
  },
  bottomSpacer: {
    height: 100,
  },
  setupCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setupIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  setupContent: {
    gap: Spacing.xs,
  },
  setupTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  setupDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
  },
  setupButtonText: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
