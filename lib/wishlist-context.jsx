"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const WishlistContext = createContext();
const STORAGE_KEY = "litwaypicks-wishlist";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* corrupted — start empty */ }
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((current) => {
      if (current.find((i) => i.id === product.id)) return current;
      toast.success("Added to wishlist");
      return [...current, product];
    });
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((i) => i.id !== id));
    toast.success("Removed from wishlist");
  };

  const isInWishlist = (id) => items.some((i) => i.id === id);

  const toggleItem = (product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
