import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function cart() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/checkout")
    } else {
      router.push("/(auth)/sign-in")
    }
  }

  const handleIncrement = (productId: string, currentQuantity: number, selectedColor?: string, selectedMaterial?: string) => {
    updateQuantity(productId, currentQuantity + 1, selectedColor, selectedMaterial);
  };

  const handleDecrement = (productId: string, currentQuantity: number, selectedColor?: string, selectedMaterial?: string) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1, selectedColor, selectedMaterial);
    }
  };

  const handleRemove = (productId: string, selectedColor?: string, selectedMaterial?: string) => {
    removeFromCart(productId, selectedColor, selectedMaterial);
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={64} color={Colors.textLight} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some furniture to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.headerSubtitle}>{cart.length} items</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cart.map((item, index) => (
          <View key={`${item.product._id}-${item.selectedColor}-${item.selectedMaterial}-${index}`} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image }}
              style={styles.itemImage}
              contentFit="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              {item.selectedColor && (
                <Text style={styles.itemOption}>Color: {item.selectedColor}</Text>
              )}
              {item.selectedMaterial && (
                <Text style={styles.itemOption}>Material: {item.selectedMaterial}</Text>
              )}
              <Text style={styles.itemPrice}>Ksh {item.product.price.toLocaleString()}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.product._id, item.selectedColor, item.selectedMaterial)}
              >
                <Trash2 size={18} color={Colors.error} />
              </TouchableOpacity>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(item.product._id, item.quantity, item.selectedColor, item.selectedMaterial)}
                >
                  <Minus size={16} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(item.product._id, item.quantity, item.selectedColor, item.selectedMaterial)}
                >
                  <Plus size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>Ksh {cartTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>Free</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>Ksh {cartTotal.toLocaleString()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  itemOption: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center' as const,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
