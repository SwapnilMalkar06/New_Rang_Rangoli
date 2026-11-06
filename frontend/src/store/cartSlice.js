import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, logout } from './authSlice';

// Helper to determine isolated storage key per customer/session
const getCartKey = (user) => {
  if (user && (user.id || user._id || user.email)) {
    const identifier = user.id || user._id || user.email;
    return `cart_user_${String(identifier).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }
  return 'cart_guest';
};

const loadCartFromStorage = (user) => {
  try {
    const key = getCartKey(user);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveCartToStorage = (key, items) => {
  try {
    if (key) {
      localStorage.setItem(key, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Error saving cart to storage:', e);
  }
};

// Clean legacy un-isolated global cart key if still present
if (typeof window !== 'undefined' && localStorage.getItem('cart')) {
  localStorage.removeItem('cart');
}

// Load initial state based on currently authenticated user session
const currentStoredUser = (() => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch (e) {
    return null;
  }
})();

const initialKey = getCartKey(currentStoredUser);
const initialItems = loadCartFromStorage(currentStoredUser);

const initialState = {
  items: initialItems,
  storageKey: initialKey,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      // Mandatory authentication: guests cannot add products to cart
      if (!state.storageKey || state.storageKey === 'cart_guest') {
        console.warn('Mandatory login required: Guests cannot add products to cart.');
        return;
      }

      const {
        product,
        quantity = 1,
        selectedWeight = null,
        customPrice = null,
        customWholesalePrice = null
      } = action.payload;

      const cartItemId = selectedWeight 
        ? `${product._id || product.id}_${selectedWeight}`
        : `${product._id || product.id}`;

      const existingItem = state.items.find(
        item => (item.cartItemId || item.product._id || item.product.id) === cartItemId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          cartItemId,
          product,
          quantity,
          selectedWeight,
          customPrice,
          customWholesalePrice
        });
      }
      saveCartToStorage(state.storageKey, state.items);
    },
    updateQuantity(state, action) {
      const { cartItemId, productId, quantity } = action.payload;
      const targetId = cartItemId || productId;
      const existingItem = state.items.find(
        item => item.cartItemId === targetId || item.product._id === targetId || item.product.id === targetId
      );
      if (existingItem) {
        existingItem.quantity = quantity;
      }
      saveCartToStorage(state.storageKey, state.items);
    },
    removeFromCart(state, action) {
      const targetId = action.payload;
      state.items = state.items.filter(
        item => item.cartItemId !== targetId && item.product._id !== targetId && item.product.id !== targetId
      );
      saveCartToStorage(state.storageKey, state.items);
    },
    clearCart(state) {
      state.items = [];
      if (state.storageKey) {
        localStorage.removeItem(state.storageKey);
      }
    },
    setUserCart(state, action) {
      const user = action.payload;
      const key = getCartKey(user);
      state.storageKey = key;
      state.items = loadCartFromStorage(user);
    }
  },
  extraReducers: (builder) => {
    builder
      // When a user logs in, load ONLY that specific user's cart
      .addCase(loginUser.fulfilled, (state, action) => {
        const loggedInUser = action.payload?.data;
        const key = getCartKey(loggedInUser);
        state.storageKey = key;
        state.items = loadCartFromStorage(loggedInUser);
      })
      // When a new user registers, initialize their isolated cart
      .addCase(registerUser.fulfilled, (state, action) => {
        const registeredUser = action.payload?.data;
        const key = getCartKey(registeredUser);
        state.storageKey = key;
        state.items = loadCartFromStorage(registeredUser);
      })
      // When user logs out, completely clear active items to prevent cross-contamination
      .addCase(logout, (state) => {
        state.storageKey = 'cart_guest';
        state.items = [];
      });
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setUserCart } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state, isWholesale) => {
  return state.cart.items.reduce((total, item) => {
    let price;
    if (isWholesale) {
      price = item.customWholesalePrice != null ? item.customWholesalePrice : item.product.wholesalePrice;
    } else {
      price = item.customPrice != null ? item.customPrice : (item.product.currentPrice || item.product.price);
    }
    return total + ((price || 0) * item.quantity);
  }, 0);
};

export default cartSlice.reducer;
