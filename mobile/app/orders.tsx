import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    product: { name: string; image: string; price: number };
    quantity: number;
  }>;
  total: number;
  status: 'Processing' | 'In-Transit' | 'Delivered' | 'Cancelled';
  date: string;
  paymentMethod: 'M-Pesa' | 'Card';
  deliveryAddress: string;
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        setOrders(res.data.orders || []);
        setError(false);
      } catch (err: any) {
        console.log('Orders fetch error:', err);
        setError(true);
        Alert.alert('Error', 'Failed to load orders. Try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Processing': return <Clock size={20} color={Colors.warning} />;
      case 'In-Transit': return <Package size={20} color={Colors.primary} />;
      case 'Delivered': return <CheckCircle size={20} color={Colors.success} />;
      case 'Cancelled': return <XCircle size={20} color={Colors.error} />;
      default: return <FileText size={20} color={Colors.text} />;
    }
  };

  const getStatusText = (status: Order['status']) => status;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load orders</Text>
        <TouchableOpacity onPress={() => router.reload()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
              <Text style={styles.emptyButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => router.push(`/order/[id]`)}
                activeOpacity={0.8}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.orderId}</Text>
                    <Text style={styles.orderDate}>{new Date(order.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    {getStatusIcon(order.status)}
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Image source={{ uri: item?.product?.image }} style={styles.itemThumb} />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>Ksh {item.product.price.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.orderTotal}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>Ksh {order.total.toLocaleString()}</Text>
                </View>
                <View style={styles.orderPayment}>
                  <Text style={styles.paymentMethod}>Paid with {order.paymentMethod}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processing': case 'In-Transit': return Colors.warning;
    case 'Delivered': return Colors.success;
    case 'Cancelled': return Colors.error;
    default: return Colors.textLight;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.text, marginLeft: 12 },
  content: { flex: 1, padding: 24 },
  ordersList: { gap: 16 },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderInfo: { gap: 4 },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.text },
  orderDate: { fontSize: 14, color: Colors.textSecondary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  orderItems: { marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  itemThumb: { width: 48, height: 48, borderRadius: 8 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  itemQty: { fontSize: 12, color: Colors.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 8 },
  totalLabel: { fontSize: 16, color: Colors.text },
  totalAmount: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  orderPayment: { alignItems: 'center', marginTop: 8 },
  paymentMethod: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary },
  errorText: { fontSize: 18, color: Colors.error, marginBottom: 16 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 },
  retryText: { color: '#FFF', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  emptyButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});