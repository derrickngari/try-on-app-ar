import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { BlurView } from "expo-blur";

function CartBadge() {
  const { cartItemCount } = useCart();

  if (cartItemCount === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{cartItemCount}</Text>
    </View>
  );
}

const _layout = () => {
  return (
    <Tabs
  screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
        },
    tabBarBackground: () => (
      <BlurView
        intensity={110}
        tint="light"
        style={{ flex: 1 }}
      />
    ),
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "600",
      marginTop: 4,
    },
    tabBarItemStyle: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }}
>

      <Tabs.Screen
        name={"home"}
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Catalog",
          tabBarIcon: ({ color, size }) => (
            <Grid3x3 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <View>
              <ShoppingCart color={color} size={size} />
              <CartBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({
  badge: {
    position: "absolute" as const,
    top: -6,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
  },
});
