// app/(auth)/sign-up.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoggingIn } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      const res = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });

      // Save user
      login({ ...res.data.user, accessToken: res.data.accessToken });

      Alert.alert("Welcome!", "Account created successfully");
      setTimeout(() => router.replace("/(tabs)/home"), 300);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Sign up failed. Try again.";
      Alert.alert("Sign Up Error", msg);
    }
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <BlurView intensity={80} tint="light" style={styles.background} />

        <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Visara</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>
              Join thousands visualizing homes in{" "}
            </Text>

            {/* Name */}
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={Colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Full Name"
                placeholderTextColor={Colors.textLight}
                value={form.name}
                onChangeText={(v) => updateField("name", v)}
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={Colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor={Colors.textLight}
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={Colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                value={form.password}
                onChangeText={(v) => updateField("password", v)}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={Colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textLight}
                value={form.confirmPassword}
                onChangeText={(v) => updateField("confirmPassword", v)}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                isLoggingIn && styles.signupButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 size={20} color="#FFF" style={{ marginRight: 8 }} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign In Link */}
            <View style={styles.signinLink}>
              <Text style={styles.signinText}>
                Already have an account?{" "}
                <Text
                  style={styles.signinBold}
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            © 2025 Visara. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.backgroundLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 8,
    marginLeft: 4,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.textLight,
  },
  signinLink: {
    alignItems: "center",
  },
  signinText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  signinBold: {
    color: Colors.primary,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});
