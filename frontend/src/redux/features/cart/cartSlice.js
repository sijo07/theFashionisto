import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../utils/cartUtils";

const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : { cartItems: [], shippingAddress: {}, paymentMethod: "Credit Card" };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, ...item } = action.payload;
      const existItem = state.cartItems.find(
        (x) => x._id === item._id && x.size === item.size
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id && x.size === existItem.size
            ? item
            : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      updateCart(state);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => {
        if (typeof action.payload === 'object') {
          // Remove specific variant
          return !(x._id === action.payload._id && x.size === action.payload.size);
        }
        // Fallback: Remove all matching ID
        return x._id !== action.payload;
      });

      updateCart(state);
    },

    recalculatePrice: (state) => {
      updateCart(state);
    },

    setCartItems: (state, action) => {
      state.cartItems = action.payload;

      // Update cart in localStorage and state
      updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;

      // Update cart in localStorage
      localStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;

      // Update cart in localStorage
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state) => {
      state.cartItems = [];

      // Update cart in localStorage and state
      updateCart(state);
    },

    resetCart: () => initialState,
  },
});

export const {
  addToCart,
  removeFromCart,
  setCartItems,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
  recalculatePrice,
} = cartSlice.actions;

export default cartSlice.reducer;
