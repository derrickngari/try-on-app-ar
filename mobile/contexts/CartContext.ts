import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Product } from '@/types/product';

export type CartItem = {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedMaterial?: string;
};

export type WishlistItem = {
  productId: string;
};

const CART_STORAGE_KEY = 'elegant-ar-cart';
const WISHLIST_STORAGE_KEY = 'elegant-ar-wishlist';

export const [CartProvider, useCart] = createContextHook(() => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const saveCartMutation = useMutation({
    mutationFn: async (newCart: CartItem[]) => {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return newCart;
    },
  });
  const { mutate: saveCart } = saveCartMutation;

  const saveWishlistMutation = useMutation({
    mutationFn: async (newWishlist: string[]) => {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
      return newWishlist;
    },
  });
  const { mutate: saveWishlist } = saveWishlistMutation;

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  useEffect(() => {
    if (wishlistQuery.data) {
      setWishlist(wishlistQuery.data);
    }
  }, [wishlistQuery.data]);

  const addToCart = useCallback(
    (product: Product, selectedColor?: string, selectedMaterial?: string) => {
      const existingIndex = cart.findIndex(
        (item) =>
          item.product._id === product._id &&
          item.selectedColor === selectedColor &&
          item.selectedMaterial === selectedMaterial
      );

      let newCart: CartItem[];
      if (existingIndex >= 0) {
        newCart = [...cart];
        newCart[existingIndex].quantity += 1;
      } else {
        newCart = [
          ...cart,
          {
            product,
            quantity: 1,
            selectedColor,
            selectedMaterial,
          },
        ];
      }

      setCart(newCart);
      saveCart(newCart);
    },
    [cart, saveCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedColor?: string, selectedMaterial?: string) => {
      const newCart = cart
        .map((item) => {
          if (
            item.product._id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedMaterial === selectedMaterial
          ) {
            return { ...item, quantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      setCart(newCart);
      saveCart(newCart);
    },
    [cart, saveCart]
  );

  const removeFromCart = useCallback(
    (productId: string, selectedColor?: string, selectedMaterial?: string) => {
      const newCart = cart.filter(
        (item) =>
          !(
            item.product._id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedMaterial === selectedMaterial
          )
      );

      setCart(newCart);
      saveCart(newCart);
    },
    [cart, saveCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, [saveCart]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const newWishlist = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];

      setWishlist(newWishlist);
      saveWishlist(newWishlist);
    },
    [wishlist, saveWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    wishlist,
    cartTotal,
    cartItemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    isLoading: cartQuery.isLoading || wishlistQuery.isLoading,
  };
});
