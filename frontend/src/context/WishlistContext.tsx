import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  // LocalStorage key unique to logged-in user or guest
  const storageKey = user && user.username ? `wishlist_${user.username}` : 'wishlist_guest';

  const readWishlistFromStorage = (key: string): Product[] => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && (p.id || p.name));
        }
      }
    } catch (e) {
      console.error('Failed to parse wishlist:', e);
      localStorage.removeItem(key);
    }
    return [];
  };

  const [wishlist, setWishlist] = useState<Product[]>(() => readWishlistFromStorage(storageKey));
  const [prevKey, setPrevKey] = useState(storageKey);
  if (prevKey !== storageKey) {
    setPrevKey(storageKey);
    setWishlist(readWishlistFromStorage(storageKey));
  }

  const saveWishlist = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem(storageKey, JSON.stringify(newWishlist));
  };

  const toggleWishlist = (product: Product) => {
    if (!product || (!product.id && !product.name)) return;
    const pId = product.id || product.name;
    const exists = wishlist.some((item) => (item.id || item.name) === pId);
    if (exists) {
      const filtered = wishlist.filter((item) => (item.id || item.name) !== pId);
      saveWishlist(filtered);
      showToast(`Removed "${product.name}" from Wishlist`, 'info');
    } else {
      saveWishlist([...wishlist, product]);
      showToast(`Added "${product.name}" to Wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => (item.id || item.name) === productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
