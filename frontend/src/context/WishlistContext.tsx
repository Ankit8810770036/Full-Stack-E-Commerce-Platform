import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // LocalStorage key unique to logged-in user or guest
  const storageKey = user ? `wishlist_${user.username}` : 'wishlist_guest';

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setWishlist(JSON.parse(stored));
    } else {
      setWishlist([]);
    }
  }, [storageKey]);

  const saveWishlist = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem(storageKey, JSON.stringify(newWishlist));
  };

  const toggleWishlist = (product: Product) => {
    if (!product.id) return;
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      const filtered = wishlist.filter((item) => item.id !== product.id);
      saveWishlist(filtered);
      showToast(`Removed "${product.name}" from Wishlist`, 'info');
    } else {
      saveWishlist([...wishlist, product]);
      showToast(`Added "${product.name}" to Wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
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
