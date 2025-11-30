import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Heart, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { api } from "@/services/api";
import { Product, Category } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 88) / 2;

const CATEGORIES: Category[] = [
  "Armchair",
  "Dining Chair",
  "Sofa",
  "Table",
  "Lamp",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const { toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        setProducts(res.data.products);
        setError(null);
      } catch (err: any) {
        setError("Failed to load products. Pull to refresh.");
        console.log("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const topPicks = useMemo(() => {
    return products.filter((p) => p.badge === "Top Pick").slice(0, 4);
  }, [products]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dy9tybz79/image/upload/v1762984544/logo-bg_brn86b.png",
            }}
            style={styles.logoImage}
            contentFit="cover"
          />
          <Text style={styles.headerSubtitle}>Transform Your Home</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search furniture..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory("All")}
            style={[
              styles.categoryChip,
              selectedCategory === "All" && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === "All" && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.promoContainer}>
          <LinearGradient
            colors={["#000", Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Black November Sale</Text>
              <Text style={styles.promoSubtitle}>20% off on Sofas</Text>
              <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoIconContainer}>
              <Sparkles size={48} color="rgba(255, 255, 255, 0.3)" />
            </View>
          </LinearGradient>
        </View>

        {topPicks.length > 0 && selectedCategory === "All" && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Picks</Text>
            <View style={styles.grid}>
              {topPicks.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onPress={handleProductPress}
                  isWishlisted={isInWishlist(product._id)}
                  onWishlist={toggleWishlist}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </Text>
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onPress={handleProductPress}
                isWishlisted={isInWishlist(product._id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const ProductCard = ({
  product,
  onPress,
  isWishlisted,
  onWishlist,
}: {
  product: Product;
  onPress: (id: string) => void;
  isWishlisted: boolean;
  onWishlist: (id: string) => void;
}) => (
  <TouchableOpacity
    style={styles.productCard}
    onPress={() => onPress(product._id)}
    activeOpacity={0.7}
  >
    <View style={styles.productImageContainer}>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        contentFit="cover"
      />
      {product.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={(e) => {
          e.stopPropagation();
          onWishlist(product._id);
        }}
      >
        <Heart
          size={18}
          color={isWishlisted ? Colors.primary : Colors.textLight}
          fill={isWishlisted ? Colors.primary : "transparent"}
        />
      </TouchableOpacity>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>
        Ksh {product.price.toLocaleString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  logoImage: {
    width: 140,
    height: 60,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  categoriesScroll: {
    marginTop: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginTop: 10,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  promoContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  promoBanner: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  promoIconContainer: {
    marginLeft: 16,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    marginHorizontal: 5,
  },
  productImageContainer: {
    width: "100%",
    height: CARD_WIDTH * 1.2,
    position: "relative" as const,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  wishlistButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
  },
});
