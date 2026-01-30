import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { Product } from '@/types/product';

export default function VirtualStagingScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [roomImageBase64, setRoomImageBase64] = useState<string | null | undefined>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (err) {
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please allow camera access to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please allow gallery access to pick photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled) {
        setRoomImage(result.assets[0].uri);
        setRoomImageBase64(result.assets[0].base64);
        setGeneratedImage(null); // Reset generated image when new room is picked
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleGenerate = async () => {
    if (!roomImage || !product) return;

    try {
      setGenerating(true);

      let furnitureImageToSend = product.image;

      // Check if product image is a local file URI (e.g. from cache or local storage)
      if (product.image.startsWith('file://')) {
        try {
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(product.image, {
            encoding: 'base64',
          });
          furnitureImageToSend = `data:image/jpeg;base64,${base64}`;
        } catch (readError) {
          console.error("Error reading local product image:", readError);
          Alert.alert("Error", "Could not process product image. Please try another product.");
          setGenerating(false);
          return;
        }
      }

      // Call backend API
      const res = await api.post('/virtual-stage', {
        roomImage: `data:image/jpeg;base64,${roomImageBase64}`, // Send base64 data
        furnitureImage: furnitureImageToSend,
        furnitureName: product.name
      });

      if (res.data.imageUrl) {
        setGeneratedImage(res.data.imageUrl);
        Alert.alert('Success', 'Virtual staging complete!');
      } else {
        Alert.alert('Notice', 'Generation completed but no image returned. Check logs.');
      }

    } catch (error: any) {
      console.error("Virtual Staging Error Full:", JSON.stringify(error, null, 2));
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate image';
      Alert.alert('Error', errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Staging</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Preview */}
        <View style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productThumb} contentFit="contain" />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>Ksh {product.price.toLocaleString()}</Text>
          </View>
        </View>

        {/* Main Image Area */}
        <View style={styles.imageArea}>
          {generatedImage ? (
            <Image source={{ uri: generatedImage }} style={styles.mainImage} contentFit="cover" />
          ) : roomImage ? (
            <Image source={{ uri: roomImage }} style={styles.mainImage} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <ImageIcon size={48} color={Colors.textLight} />
              <Text style={styles.placeholderText}>Take a photo of your room</Text>
            </View>
          )}

          {generating && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.generatingText}>Designing your room...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        {!generatedImage && (
          <View style={styles.controls}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
                <Camera size={24} color={Colors.primary} />
                <Text style={styles.actionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(false)}>
                <ImageIcon size={24} color={Colors.primary} />
                <Text style={styles.actionText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {roomImage && (
              <TouchableOpacity
                style={[styles.generateButton, generating && styles.disabledButton]}
                onPress={handleGenerate}
                disabled={generating}
              >
                <Sparkles size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>Generate Magic</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {generatedImage && (
          <View style={styles.resultControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setGeneratedImage(null)}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  imageArea: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resultControls: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});