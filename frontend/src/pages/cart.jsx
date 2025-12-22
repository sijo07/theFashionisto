import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, recalculatePrice } from "../redux/features/cart/cartSlice";
import { addToFavorites } from "../redux/features/favorites/favoriteSlice";
import { useState, useEffect } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const addToCartHandler = (product, qty) => {
    if (qty > 0 && qty <= product.countInStock) {
      dispatch(addToCart({ ...product, qty }));
    }
  };

  const initiateRemove = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleMoveToFavorites = () => {
    if (selectedItem) {
      dispatch(addToFavorites(selectedItem));
      dispatch(removeFromCart({ _id: selectedItem._id, size: selectedItem.size }));
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  const handleRemove = () => {
    if (selectedItem) {
      dispatch(removeFromCart({ _id: selectedItem._id, size: selectedItem.size }));
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  useEffect(() => {
    dispatch(recalculatePrice());
  }, [cartItems, dispatch]);

  /* 
    Calculate Total MRP based on the higher of Price vs Offer.
    This represents the "Original Price" sum.
  */
  const totalMRP = cartItems.reduce(
    (acc, item) => {
      const price = Number(item.price);
      const offer = Number(item.offer) || 0;
      const higher = Math.max(price, offer || 0);
      return acc + higher * (Number(item.qty) || 1);
    },
    0
  );

  /* 
    Strict Local Calculation for Display to guarantee freshness irrespective of Redux latency.
    We ignore cart.itemsPrice for display to ensure it matches the rendered items.
  */
  const totalAmount = cartItems.reduce((acc, item) => {
    const price = Number(item.price);
    const offer = Number(item.offer) || 0;
    const lower = (offer && offer < price) ? offer : price;
    return acc + lower * (Number(item.qty) || 1);
  }, 0);

  const totalDiscount = totalMRP - totalAmount;

  useEffect(() => {
    dispatch(recalculatePrice());
  }, [dispatch]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
      <div className="p-5">
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">
            HOME&nbsp;
          </Link>
          <Link to="/shop" className="hover:underline uppercase">
            /&nbsp;Shop&nbsp;
          </Link>
          /&nbsp;<span className="font-bold">SHOPPING CART</span>
        </div>
        <div className="max-w-xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-400 hover:font-semibold hover:underline capitalize">
              oops! cart is empty <Link to="/shop">Go To Shop</Link>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start mb-4">
                  <img
                    src={item.image?.url || item.image}
                    alt={item.brand}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="ml-4 flex-grow">
                    <p className="font-bold">{item.brand}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Size: <span className="text-black">{item.size}</span></p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Qty:
                        </label>
                        <div className="relative inline-block">
                          <select
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 appearance-none text-center leading-6 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 ease-in-out"
                            value={item.qty}
                            onChange={(e) =>
                              addToCartHandler(item, Number(e.target.value))
                            }
                          >
                            {[
                              ...Array(Math.min(item.countInStock || item.qty || 1, 10)).keys(),
                            ].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div>
                        <p className="text-lg font-semibold text-teal-500">
                          ₹{(item.offer && Number(item.offer) < Number(item.price)) ? item.offer : item.price}
                        </p>
                      </div>
                      <div>
                        {Math.max(Number(item.price), Number(item.offer) || 0) > ((item.offer && Number(item.offer) < Number(item.price)) ? Number(item.offer) : Number(item.price)) && (
                          <p className="text-sm text-gray-400 line-through">
                            ₹{Math.max(Number(item.price), Number(item.offer) || 0)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => initiateRemove(item)}
                      className="text-sm bg-white text-gray-400 w-[4rem] hover:text-red-600 border-2 border-gray-200 font-semibold capitalize transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <p className="font-bold mb-2">
                  PRICE DETAILS ({cartItems.reduce((acc, item) => acc + item.qty, 0)}{" "}
                  {cartItems.reduce((acc, item) => acc + item.qty, 0) > 1 ? "Items" : "Item"})
                </p>
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Total MRP</p>
                  <p className="text-sm font-semibold">
                    ₹{totalMRP.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Discount</p>
                  <p className="text-sm font-semibold text-green-500">
                    - ₹{totalDiscount.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <p>Total Amount</p>
                  <p>₹{totalAmount.toFixed(2)}</p>
                </div>
                <button
                  className="bg-[#649899] hover:bg-green-700 text-white w-full py-2 rounded font-bold uppercase transition-colors"
                  onClick={checkoutHandler}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove Item?</h3>
            <p className="text-gray-600 mb-6 text-sm">Would you like to move this item to your favorites instead?</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleMoveToFavorites}
                className="w-full bg-[#649899] text-white py-2.5 rounded-lg font-semibold hover:bg-[#538283] transition-colors"
              >
                Move to Favorites
              </button>
              <button
                onClick={handleRemove}
                className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-100"
              >
                Remove
              </button>
              <button
                onClick={() => setModalVisible(false)}
                className="w-full text-gray-500 text-sm font-medium hover:text-gray-700 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;