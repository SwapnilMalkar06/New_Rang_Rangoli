import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
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
      localStorage.setItem('cart', JSON.stringify(state.items));
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
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      const targetId = action.payload;
      state.items = state.items.filter(
        item => item.cartItemId !== targetId && item.product._id !== targetId && item.product.id !== targetId
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('cart');
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
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
