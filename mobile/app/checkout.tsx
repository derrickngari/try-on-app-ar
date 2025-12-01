import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
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
  CheckCircle,
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
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(
    null
  );
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMpesaPayment = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please log in.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
      ]);
      return;
    }

    if (!address.phone || !address.name) {
      Alert.alert("Address Required", "Please fill name and phone.");
      return;
    }

    try {
      setPaymentStatus("pending");
      const res = await api.post("/payments/mpesa/stk-push", {
        phoneNumber: address.phone,
        amount: Math.round(cartTotal),
        accountReference: `VisaraOrder_${Date.now()}`,
        transactionDesc: "Furniture Purchase",
      });

      if (
        res.data.success &&
        res.data.paymentId &&
        res.data.checkoutRequestID
      ) {
        setPaymentId(res.data.paymentId);
        setCheckoutRequestID(res.data.checkoutRequestID);
        Alert.alert("M-Pesa Sent!", "Check phone for PIN. Confirming...", [
          { text: "OK" },
        ]);
      } else {
        console.log("Invalid STK Response:", res.data);
        setPaymentStatus("failed");
        Alert.alert("Payment Error", "Invalid response from M-Pesa.");
      }
    } catch (error: any) {
      console.log("STK Error:", error.response?.data || error.message);
      setPaymentStatus("failed");
      Alert.alert(
        "Payment Error",
        error.response?.data?.message || "Try again."
      );
    }
  };

  useEffect(() => {
    if (!checkoutRequestID || !paymentId) return;

    console.log("useEffect Polling Triggered:", {
      checkoutRequestID,
      paymentId,
    });

    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    interval = setInterval(async () => {
      try {
        console.log("Calling stkQuery...");
        const res = await api.post("/payments/mpesa/stk-query", {
          checkoutRequestID,
        });

        console.log("stkQuery Response:", res.data);

        const { success, status, mpesaCode } = res.data;

        if (!success) {
          console.log("Query Failed (retry):", res.data.message || "Unknown");
          return;
        }

        console.log("Polling Result:", { status, mpesaCode });
        if (status === "Completed" && mpesaCode) {
          console.log("COMPLETED! Creating Order...");
          clearInterval(interval);
          if (timeout) clearTimeout(timeout);

          await createOrder(mpesaCode);
          setPaymentStatus("success");
          clearCart();

          router.push({
            pathname: "/order-success",
            params: { transactionId: mpesaCode, total: cartTotal },
          });
          return;
        }

        if (status === "Failed") {
          console.log("PAYMENT FAILED! Stopping.");
          clearInterval(interval);
          if (timeout) clearTimeout(timeout);
          setPaymentStatus("failed");
          Alert.alert("Payment Failed", res.data.message || "Try again.");
        }
      } catch (err: any) {
        console.log("POLLING ERROR:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
      }
    }, 5000);

    pollingRef.current = interval;
    console.log("Interval Set (ID:", interval, ")");
    timeout = setTimeout(() => {
      console.log("Timeout! Stopping.");
      clearInterval(interval);
      pollingRef.current = null;
      setPaymentStatus("failed");
      Alert.alert(
        "Timeout",
        "Payment not confirmed. Check your M-Pesa messages."
      );
    }, 300000);

    timeoutRef.current = timeout;

    return () => {
      console.log("Polling Cleanup");
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      pollingRef.current = null;
      timeoutRef.current = null;
    };
  }, [checkoutRequestID, paymentId]);

  const createOrder = async (mpesaCode: string) => {
    try {
      await api.post("/orders", {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          priceAtOrder: item.product.price,
        })),
        totalAmount: cartTotal,
        address,
        payment: {
          paymentId: mpesaCode, // Use mpesaCode as transaction ID
          method: "M-Pesa",
        },
      });
      console.log("Order created after payment success");
    } catch (error: any) {
      Alert.alert(
        "Order Error",
        "Payment OK, but order failed. Contact support."
      );
      console.error("Order creation error:", error);
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

  if (paymentStatus === "success") {
    return (
      <View style={styles.successContainer}>
        <CheckCircle size={80} color={Colors.success} />
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successMessage}>Order confirmed. Thank you!</Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text style={styles.successButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        {paymentStatus === "pending" && (
          <View style={styles.pollingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.pollingText}>Confirming payment...</Text>
          </View>
        )}
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
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.success,
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  pollingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    alignSelf: "center",
  },
  pollingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
});
