import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CartItem, CartContextType } from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);

  // Load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setGuestCart(parsedCart);
        return parsedCart;
      }
    } catch (error) {
      // Silently fail
    }
    return [];
  }, []);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
      setGuestCart(cartItems);
    } catch (error) {
      // Silently fail
    }
  }, []);

  // Merge guest cart with user cart when user logs in
  const mergeGuestCartWithUserCart = useCallback(async () => {
    if (user && guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await apiClient.addToCart(item.product.id, item.quantity, item.variantId);
        }
        localStorage.removeItem('guestCart');
        setGuestCart([]);
        await fetchCart();
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, [user, guestCart]);

  // Fetch cart from API or localStorage
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const response = await apiClient.getCart();
        setItems(response.items || []);
      } else {
        const guestItems = loadGuestCart();
        setItems(guestItems);
      }
    } catch (error) {
      if (user) {
        // If API fails for authenticated user, show error
        showNotification('Failed to load cart', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [user, loadGuestCart, showNotification]);

  // Load cart on mount and when user changes
  useEffect(() => {
    if (user) {
      mergeGuestCartWithUserCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(async (product: any, quantity: number = 1, variantId?: string) => {
    try {
      if (user) {
        await apiClient.addToCart(product.id, quantity, variantId);
        await fetchCart();
        showNotification('Added to cart', 'success');
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variantId || 'default'}`,
          product,
          quantity,
          variantId,
          createdAt: new Date()
        };
        const updatedCart = [...guestCart, newItem];
        saveGuestCart(updatedCart);
        setItems(updatedCart);
        showNotification('Added to cart', 'success');
      }
    } catch (error) {
      showNotification('Failed to add to cart', 'error');
    }
  }, [user, guestCart, fetchCart, saveGuestCart, showNotification]);

  // Update cart item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (user) {
        await apiClient.updateCartItem(itemId, quantity);
        await fetchCart();
      } else {
        const updatedCart = guestCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        saveGuestCart(updatedCart);
        setItems(updatedCart);
      }
    } catch (error) {
      showNotification('Failed to update cart', 'error');
    }
  }, [user, guestCart, fetchCart, saveGuestCart, showNotification]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      if (user) {
        await apiClient.removeFromCart(itemId);
        await fetchCart();
      } else {
        const updatedCart = guestCart.filter(item => item.id !== itemId);
        saveGuestCart(updatedCart);
        setItems(updatedCart);
      }
      showNotification('Removed from cart', 'success');
    } catch (error) {
      showNotification('Failed to remove from cart', 'error');
    }
  }, [user, guestCart, fetchCart, saveGuestCart, showNotification]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await apiClient.clearCart();
      }
      localStorage.removeItem('guestCart');
      setItems([]);
      setGuestCart([]);
      showNotification('Cart cleared', 'success');
    } catch (error) {
      showNotification('Failed to clear cart', 'error');
    }
  }, [user, showNotification]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Wrapper functions to match type definitions
  const addItem = useCallback(async (product: Product, quantity: number = 1, variantId?: string) => {
    await addToCart(product, quantity, variantId);
  }, [addToCart]);

  const removeItem = useCallback(async (productId: string, variantId?: string) => {
    // Find the cart item by productId and variantId
    const itemToRemove = items.find(item =>
      item.product.id === productId &&
      (variantId ? item.variantId === variantId : !item.variantId)
    );
    if (itemToRemove) {
      await removeFromCart(itemToRemove.id);
    }
  }, [items, removeFromCart]);

  const updateItemQuantity = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    // Find the cart item by productId and variantId
    const itemToUpdate = items.find(item =>
      item.product.id === productId &&
      (variantId ? item.variantId === variantId : !item.variantId)
    );
    if (itemToUpdate) {
      await updateQuantity(itemToUpdate.id, quantity);
    }
  }, [items, updateQuantity]);

  const value: CartContextType = {
    items,
    loading,
    total: subtotal,
    itemCount,
    addItem,
    updateQuantity: updateItemQuantity,
    removeItem,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

