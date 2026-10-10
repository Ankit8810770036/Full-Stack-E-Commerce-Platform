import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Strictly isolate cart per user
  const storageKey = user && user.username ? `cart_${user.username}` : 'cart_guest';

  const readCartFromStorage = (key: string): CartItem[] => {
    try {
      const storedCart = localStorage.getItem(key);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.product && (item.product.id || item.product.name));
        }
      }
    } catch (e) {
      console.error('Failed to parse cart for', key, e);
      localStorage.removeItem(key);
    }
    return [];
  };

  const [cart, setCart] = useState<CartItem[]>(() => readCartFromStorage(storageKey));
  const [prevKey, setPrevKey] = useState(storageKey);
  if (prevKey !== storageKey) {
    setPrevKey(storageKey);
    setCart(readCartFromStorage(storageKey));
  }

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(storageKey, JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product || (!product.id && !product.name)) return;
    const prodId = product.id || product.name;
    const existingIndex = cart.findIndex(item => (item.product?.id || item.product?.name) === prodId);

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      saveCart(newCart);
    } else {
      saveCart([...cart, { product, quantity }]);
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter(item => (item.product?.id || item.product?.name) !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(
      cart.map(item => ((item.product?.id || item.product?.name) === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + ((Number(item?.product?.price) || 0) * (Number(item?.quantity) || 0)), 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
