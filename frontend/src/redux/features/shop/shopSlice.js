import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  products: [],
  checked: [], // IDs of checked categories
  radio: [], // Selected brand(s)
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload; // Updated list of checked category IDs
    },
    setRadio: (state, action) => {
      state.radio = action.payload; // Updated selected brand(s)
    },
  },
});

export const { setCategories, setProducts, setChecked, setRadio } =
  shopSlice.actions;

export default shopSlice.reducer;
