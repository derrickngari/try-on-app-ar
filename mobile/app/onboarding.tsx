import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    title: 'Transform Your Home',
    subtitle: 'with Elegant Simplicity',
    description: 'Discover premium furniture that elevates your living spaces',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    title: 'Customize Everything',
    subtitle: 'colors & materials',
    description: 'Choose from a wide range of finishes to match your style',
  },
  {
  id: '3',
  image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
  title: 'Try Before You Buy',
  subtitle: 'See it in your room',
  description: 'Use your phone camera to place furniture in your actual space and instantly see how it fits and looks before purchasing.',
}
];

export default function onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const skip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: slide.image }}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.imageOverlay} />
            </View>
            
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>

              <View style={styles.paginationContainer}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={skip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNext} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={goToNext} style={[styles.button, styles.buttonFull]}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    flex: 0.55,
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  content: {
    flex: 0.45,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '300' as const,
    color: Colors.primary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: Colors.textSecondary,
    fontWeight: '400' as const,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  paginationContainer: {
  position: 'absolute',
  bottom: '25%',
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
},

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
    gap: 12,
    paddingTop: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonFull: {
    flex: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
