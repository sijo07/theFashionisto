// Utility function to round and format numbers
export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// Function to update cart state
export const updateCart = (state) => {
  // Check if cartItems exists
  if (!state.cartItems || !Array.isArray(state.cartItems)) {
    throw new Error("Invalid cartItems");
  }

  // Calculate items price
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  state.itemsPrice = addDecimals(itemsPrice);

  // Calculate shipping price
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  state.shippingPrice = addDecimals(shippingPrice);

  // Calculate tax price
  const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
  state.taxPrice = taxPrice;

  // Calculate total price
  const totalPrice =
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice);
  state.totalPrice = addDecimals(totalPrice);

  // Save state to localStorage
  localStorage.setItem("cart", JSON.stringify(state));

  return state;
};
