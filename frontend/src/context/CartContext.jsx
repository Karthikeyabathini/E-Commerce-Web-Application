import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Cart items on startup or auth changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user && token) {
        try {
          const res = await api.get('/cart');
          if (res.data.success && res.data.cart) {
            // Map backend product structure to local structure
            const dbItems = res.data.cart.products.map(item => ({
              product: item.product,
              quantity: item.quantity
            })).filter(item => item.product !== null);
            
            // If local storage has items from guest session, sync them to database
            const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (guestCart.length > 0) {
              setLoading(true);
              for (const guestItem of guestCart) {
                try {
                  await api.post('/cart', {
                    productId: guestItem.product._id,
                    quantity: guestItem.quantity
                  });
                } catch (err) {
                  console.error('Failed to sync guest item to DB:', err);
                }
              }
              localStorage.removeItem('cart');
              // Refetch synced cart
              const syncRes = await api.get('/cart');
              const syncedItems = syncRes.data.cart.products.map(item => ({
                product: item.product,
                quantity: item.quantity
              })).filter(item => item.product !== null);
              setCartItems(syncedItems);
            } else {
              setCartItems(dbItems);
            }
          }
        } catch (error) {
          console.error('Error fetching database cart:', error);
        }
      } else {
        // Load guest cart from local storage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
      }
      setLoading(false);
    };

    fetchCart();
  }, [user, token]);

  // Calculations
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );
  const taxPrice = Number((cartSubtotal * 0.08).toFixed(2));
  const shippingPrice = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 50;
  const cartTotal = Number((cartSubtotal + taxPrice + shippingPrice).toFixed(2));
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Add Item
  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity);
    if (user) {
      try {
        const res = await api.post('/cart', { productId: product._id, quantity: qty });
        if (res.data.success) {
          const dbItems = res.data.cart.products.map(item => ({
            product: item.product,
            quantity: item.quantity
          })).filter(item => item.product !== null);
          setCartItems(dbItems);
          return { success: true };
        }
      } catch (error) {
        console.error('Error adding to DB cart:', error);
        return { success: false, message: error.response?.data?.message || 'Stock limits reached' };
      }
    } else {
      // Guest local storage update
      const updatedItems = [...cartItems];
      const itemIndex = updatedItems.findIndex(
        (item) => item.product._id === product._id
      );

      if (itemIndex > -1) {
        const newQty = updatedItems[itemIndex].quantity + qty;
        if (newQty > product.stock) {
          return { success: false, message: `Only ${product.stock} items left in stock.` };
        }
        updatedItems[itemIndex].quantity = newQty;
      } else {
        if (qty > product.stock) {
          return { success: false, message: `Only ${product.stock} items left in stock.` };
        }
        updatedItems.push({ product, quantity: qty });
      }

      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return { success: true };
    }
  };

  // Update Item Quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) return removeFromCart(productId);

    if (user) {
      try {
        const res = await api.put(`/cart/${productId}`, { quantity: qty });
        if (res.data.success) {
          const dbItems = res.data.cart.products.map(item => ({
            product: item.product,
            quantity: item.quantity
          })).filter(item => item.product !== null);
          setCartItems(dbItems);
          return { success: true };
        }
      } catch (error) {
        console.error('Error updating DB cart quantity:', error);
        return { success: false, message: error.response?.data?.message || 'Failed to update' };
      }
    } else {
      const updatedItems = cartItems.map((item) => {
        if (item.product._id === productId) {
          if (qty > item.product.stock) {
            return item; // do not update if exceeds stock
          }
          return { ...item, quantity: qty };
        }
        return item;
      });

      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return { success: true };
    }
  };

  // Remove Item
  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        if (res.data.success) {
          const dbItems = res.data.cart.products.map(item => ({
            product: item.product,
            quantity: item.quantity
          })).filter(item => item.product !== null);
          setCartItems(dbItems);
        }
      } catch (error) {
        console.error('Error removing from DB cart:', error);
      }
    } else {
      const updatedItems = cartItems.filter(
        (item) => item.product._id !== productId
      );
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setCartItems([]);
      } catch (error) {
        console.error('Error clearing DB cart:', error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        taxPrice,
        shippingPrice,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
