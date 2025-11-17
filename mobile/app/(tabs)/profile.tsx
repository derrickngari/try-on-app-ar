// app/(tabs)/profile.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Heart,
  Package,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight,
  LogOut,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { Link, Redirect, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
};

function MenuItem({ icon, label, value, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>{icon}</View>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        <ChevronRight size={20} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { wishlist, cart } = useCart();
  const { logout, isLogginOut, user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Card */}
          <View style={styles.profileCardContainer}>
            <BlurView intensity={80} tint="light" style={styles.blurBackground} />

            <View style={styles.profileCard}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatar}>
                    {user ? (
                      <Image
                        source={{ uri: user.profilePic }}
                        style={styles.profilePic}
                        contentFit="cover"
                      />
                    ) : (
                      <User size={40} color={Colors.primary} />
                    )}
                  </View>
                </View>
              </View>

              {/* User Info */}
              <Text style={styles.userName}>
                {user ? user.name : "Guest User"}
              </Text>
              <Text style={styles.userEmail}>
                {user ? user.email : "Sign in to save your data"}
              </Text>

              {/* Sign In Button */}
              {!user && (
                <Link href="/(auth)/sign-in" style={styles.signInButton}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </Link>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{cart.length}</Text>
              <Text style={styles.statLabel}>In Cart</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{wishlist.length}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon={<Heart size={20} color={Colors.primary} />}
                label="Wishlist"
                value={wishlist.length > 0 ? `${wishlist.length} items` : undefined}
                onPress={() => {router.replace("/wishlist")}}
              />
              <MenuItem icon={<Package size={20} color={Colors.primary} />} label="Orders" onPress={() => {router.replace("/orders")}} />
              <MenuItem icon={<MapPin size={20} color={Colors.primary} />} label="Addresses" onPress={() => {router.replace("/address")}} />
              <MenuItem icon={<CreditCard size={20} color={Colors.primary} />} label="Payment Methods" onPress={() => {router.replace("/payment")}} />
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.menuGroup}>
              <MenuItem icon={<Bell size={20} color={Colors.primary} />} label="Notifications" onPress={() => {router.replace("/notifications")}} />
              <MenuItem icon={<HelpCircle size={20} color={Colors.primary} />} label="Help & Support" onPress={() => {}} />
            </View>
          </View>

          {/* Logout */}
          {user && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              disabled={isLogginOut}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.logoutButtonText}>
                {isLogginOut ? "Signing out..." : "Sign Out"}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.7,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  profileCardContainer: {
    marginBottom: 28,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 15,
  },

  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  profileCard: {
    padding: 30,
    alignItems: "center",
    gap: 10,
  },

  avatarWrapper: {
    marginBottom: 14,
  },

  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    padding: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },

  avatar: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: Colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
  },

  profilePic: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },

  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },

  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },

  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },

  statsContainer: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },

  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },

  menuItemLabel: {
    fontSize: 15.5,
    fontWeight: "500",
    color: Colors.text,
  },

  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  menuItemValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.error,
  },

  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 32,
  },
});

