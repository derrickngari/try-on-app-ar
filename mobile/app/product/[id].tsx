import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Heart, Share2, ShoppingCart, Cable, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!id || id.length !== 24) {
          setError(true);
          return;
        }
        const res = await api.get(`/products/${id}`);
        const fetchedProduct = res.data.product;
        setProduct(fetchedProduct);
        setSelectedColorId(fetchedProduct.colors[0]?.id || null);
        setSelectedMaterialId(fetchedProduct.materials[0]?.id || null);
      } catch (err: any) {
        console.log("Product fetch error:", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const selectedColor = useMemo(() =>
    product?.colors.find((c) => c.id === selectedColorId),
    [product, selectedColorId]
  );

  const selectedMaterial = useMemo(() =>
    product?.materials.find((m) => m.id === selectedMaterialId),
    [product, selectedMaterialId]
  );

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      product,
      selectedColor?.name || undefined,
      selectedMaterial?.name || undefined
    );
    Alert.alert("Added!", `${product.name} added to cart.`, [
      { text: "Continue Shopping", style: "cancel" },
      { text: "View Cart", onPress: () => router.push("/cart") },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BACK BUTTON */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(245, 245, 220, 0.8)', Colors.background]}
            style={styles.imageGradient}
          />

          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleWishlist(product._id)}
            >
              <Heart
                size={20}
                color={isInWishlist(product._id) ? Colors.primary : Colors.text}
                fill={isInWishlist(product._id) ? Colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {product.images.length > 1 && (
            <View style={styles.imageThumbnails}>
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} contentFit="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {/* ... rest of your content (unchanged) */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.title}>{product.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>Star {product.rating}</Text>
                <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>Ksh {product.price.toLocaleString()}</Text>
              {product.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.colors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsContainer}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color.id}
                    onPress={() => setSelectedColorId(color.id)}
                    style={[
                      styles.colorOption,
                      selectedColorId === color.id && styles.colorOptionActive,
                    ]}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
                    <Text style={[styles.colorName, selectedColorId === color.id && styles.colorNameActive]}>
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {product.materials.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Material</Text>
              <View style={styles.materialsContainer}>
                {product.materials.map((material) => (
                  <TouchableOpacity
                    key={material.id}
                    onPress={() => setSelectedMaterialId(material.id)}
                    style={[
                      styles.materialOption,
                      selectedMaterialId === material.id && styles.materialOptionActive,
                    ]}
                  >
                    <Text style={[styles.materialName, selectedMaterialId === material.id && styles.materialNameActive]}>
                      {material.name}
                    </Text>
                    <Text style={styles.materialDescription}>{material.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.arButton} onPress={() => Alert.alert("AR", "Coming soon!")}>
            <Cable size={20} color={Colors.primary} />
            <Text style={styles.arButtonText}>View in AR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleAddToCart}>
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.buyButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    position: 'relative' as const,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  imageGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageActions: {
    position: 'absolute' as const,
    top: 60,
    right: 20,
    gap: 12,
  },
  actionButton: {
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  imageThumbnails: {
    position: 'absolute' as const,
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    paddingHorizontal: 24,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  category: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.surface,
    minWidth: 80,
  },
  colorOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  colorNameActive: {
    color: Colors.primary,
  },
  materialsContainer: {
    gap: 12,
  },
  materialOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  materialOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  materialNameActive: {
    color: Colors.primary,
  },
  materialDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    marginBottom: 28,
  },
  arButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  relatedContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  relatedCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  relatedImage: {
    width: 140,
    height: 140,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  relatedPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButton: {
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
    elevation: 4,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary },
  // errorText: { fontSize: 18, color: Colors.error, marginBottom: 16 },
  // backButton: { padding: 12, backgroundColor: Colors.primary, borderRadius: 12 },
  backButtonText: { color: '#FFF', fontWeight: '600' },
});
