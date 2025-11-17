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
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { api } from "@/services/api";
import { useAuth, setAuthToken } from "@/contexts/AuthContext";
import { Link, router } from "expo-router";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Min 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const res = await api.post("/auth/login", { email, password });
      login({ ...res.data.user, accessToken: res.data.accessToken });
      //show success then redirect
      setTimeout(() => router.replace("/(tabs)/home"), 300);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      Alert.alert("Login Error", msg);
      console.log("Login Error: ", msg);
    }
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
            <Text style={styles.tagline}>
              Sign in to visualize your dream home
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to continue
            </Text>

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
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => Alert.alert("Forgot Password", "Coming soon!")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoggingIn && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 size={20} color="#FFF" style={{ marginRight: 8 }} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupLink}>
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text
                  style={styles.signupBold}
                  onPress={() => router.push("/(auth)/sign-up")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            © 2025 Elegant AR. All rights reserved.
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
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
  signupLink: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  signupBold: {
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
