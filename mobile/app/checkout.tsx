import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CreditCard,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  Mail,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { api } from "@/services/api";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<"summary" | "address" | "payment">(
    "summary"
  );
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    county: "",
  });

  const handleMpesaPayment = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please log in to complete purchase.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
      ]);
      return;
    }

    try {
      const res = await api.post("/payments/mpesa/stk-push", {
        phoneNumber: address.phone,
        amount: Math.round(cartTotal),
        accountReference: "VisaraOrder",
        transactionDesc: "Furniture Purchase",
      });

      if (res.data.success) {

        await api.post("/orders", {
          items: cart.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total: cartTotal,
          paymentMethod: "M-Pesa",
          deliveryAddress: address,
        });

        Alert.alert("Success!", "Order placed. Check your phone for PIN.", [
          { text: "OK", onPress: () => router.push("/order-success") },
        ]);
      }

      Alert.alert("M-Pesa Push Sent!", "Check your phone for PIN prompt.", [
        {
          text: "OK",
          onPress: () => {
            setTimeout(() => {
              clearCart();
              router.push("/order-success");
            }, 3000);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Payment Error",
        error.response?.data?.message || "Try again."
      );
    }
  };

  const handleProceed = () => {
    if (step === "summary") setStep("address");
    else if (step === "address") setStep("payment");
  };

  const handleBack = () => {
    if (step === "address") setStep("summary");
    else if (step === "payment") setStep("address");
    else router.push("/(tabs)/cart");
  };

  const steps = ["summary", "address", "payment"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step Indicators */}
        <View style={styles.stepIndicator}>
          {steps.map((s, index) => (
            <React.Fragment key={s}>
              <View
                style={[
                  styles.stepDot,
                  index <= currentStepIndex && styles.stepDotActive,
                ]}
              />
              {index < steps.length - 1 && <View style={styles.stepLine} />}
            </React.Fragment>
          ))}
        </View>

        {step === "summary" && (
          <View>
            <Text style={styles.stepTitle}>Order Summary</Text>
            {cart.map((item) => (
              <View key={item.product._id} style={styles.cartItem}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemPrice}>
                    Ksh {item.product.price.toLocaleString()}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                Ksh {cartTotal.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>Continue to Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "address" && (
          <View>
            <Text style={styles.stepTitle}>Delivery Address</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <User
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={address.name}
                  onChangeText={(v) => setAddress({ ...address, name: v })}
                />
              </View>
              <View style={styles.inputContainer}>
                <Phone
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={address.phone}
                  onChangeText={(v) => setAddress({ ...address, phone: v })}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputContainer}>
                <Mail
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={address.email}
                  onChangeText={(v) => setAddress({ ...address, email: v })}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputContainer}>
                <MapPin
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address Line 1"
                  value={address.line1}
                  onChangeText={(v) => setAddress({ ...address, line1: v })}
                />
              </View>
              <View style={styles.inputContainer}>
                <MapPin
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address Line 2"
                  value={address.line2}
                  onChangeText={(v) => setAddress({ ...address, line2: v })}
                />
              </View>
              <View style={styles.twoColumn}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={address.city}
                    onChangeText={(v) => setAddress({ ...address, city: v })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="County"
                    value={address.county}
                    onChangeText={(v) => setAddress({ ...address, county: v })}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "payment" && (
          <View>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <View style={styles.paymentOption}>
              <View style={styles.paymentRow}>
                <CreditCard size={24} color={Colors.primary} />
                <Text style={styles.paymentTitle}>M-Pesa</Text>
              </View>
              <Text style={styles.paymentDesc}>
                Secure mobile payment via Safaricom
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payButton}
              onPress={handleMpesaPayment}
            >
              <Text style={styles.payButtonText}>
                Pay Ksh {cartTotal.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    // backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: { flex: 1, padding: 24 },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: { gap: 12, marginBottom: 24 },
  inputContainer: { position: "relative" },
  inputIcon: { position: "absolute", left: 16, top: 18, zIndex: 1 },
  input: {
    paddingLeft: 56,
    paddingRight: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    fontSize: 16,
    color: Colors.text,
  },
  twoColumn: { flexDirection: "row", gap: 12 },
  paymentOption: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  paymentTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  paymentDesc: { fontSize: 15, color: Colors.textSecondary },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonText: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  proceedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  proceedText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  cartItem: { flexDirection: "row", gap: 12, marginBottom: 16 },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600", color: Colors.text },
  itemPrice: { fontSize: 14, color: Colors.primary },
  itemQty: { fontSize: 14, color: Colors.textSecondary },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalLabel: { fontSize: 18, color: Colors.text },
  totalPrice: { fontSize: 24, fontWeight: "700", color: Colors.primary },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
});
