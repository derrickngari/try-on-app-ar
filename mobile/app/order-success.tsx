import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,

} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { CheckCircle, ShoppingBag, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';

export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { clearCart } = useCart();
  const cannonRef = useRef<ConfettiCannon>(null);

  const { transactionId = 'N/A', total = 0 } = useLocalSearchParams<{
    transactionId?: string;
    total?: string;
  }>();

  const parsedTotal = Number(total);

  useEffect(() => {
    cannonRef.current?.start();
    clearCart();
  }, [clearCart]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ConfettiCannon
          ref={cannonRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          explosionSpeed={400}
          fallSpeed={3000}
          colors={['#6A0DAD', '#8B3FD9', '#4CAF50', '#FF9800', '#F44336']}
        />

        <View style={styles.iconContainer}>
          <CheckCircle size={80} color={Colors.success} />
        </View>

        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.subtitle}>Your furniture is on its way</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transaction ID:</Text>
            <Text style={styles.summaryValue}>{transactionId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>Ksh {parsedTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment:</Text>
            <Text style={styles.summaryValue}>M-Pesa (Completed)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery:</Text>
            <Text style={styles.summaryValue}>Within 3-5 days</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/orders')}>
            <FileText size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/home')}>
            <ShoppingBag size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, alignItems: 'center', padding: 24 },
  iconContainer: { marginVertical: 40 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: Colors.textSecondary },
  summaryValue: { fontSize: 15, fontWeight: '600', color: Colors.text },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});