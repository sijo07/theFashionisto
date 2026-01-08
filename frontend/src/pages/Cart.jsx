import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, recalculatePrice } from "../redux/features/cart/cartSlice";
import { addToFavorites } from "../redux/features/favorites/favoriteSlice";
import { useState, useEffect } from "react";
import { FaTrash, FaHeart, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";

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

  const totalMRP = cartItems.reduce(
    (acc, item) => {
      const price = Number(item.price);
      const offer = Number(item.offer) || 0;
      const higher = Math.max(price, offer || 0);
      return acc + higher * (Number(item.qty) || 1);
    },
    0
  );

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = Number(item.price);
    const offer = Number(item.offer) || 0;
    const lower = (offer && offer < price) ? offer : price;
    return acc + lower * (Number(item.qty) || 1);
  }, 0);

  const totalDiscount = totalMRP - totalAmount;

  return (
    <div className="bg-black min-h-screen text-white pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
              Your <span className="text-red-600">Selection</span>
            </h1>
            <p className="text-zinc-500 font-medium font-mono text-sm">
              [{cartItems.reduce((acc, item) => acc + item.qty, 0)}] ITEMS RESERVED
            </p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
            Continue Shopping <FaArrowRight />
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-zinc-900 rounded-sm">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-600 mb-4">Bag is Empty</h2>
            <Link to="/shop" className="inline-block bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-8">
              {cartItems.map((item) => (
                <div key={item._id} className="group relative flex flex-col sm:flex-row gap-6 p-6 border border-zinc-900 bg-zinc-950/30 hover:border-zinc-800 transition-all duration-300">
                  {/* Image */}
                  <div className="w-full sm:w-32 aspect-[3/4] bg-zinc-900 overflow-hidden relative">
                    <img
                      src={item.image?.url || item.image}
                      alt={item.brand}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold uppercase tracking-wide">{item.name}</h3>
                        <p className="text-red-500 font-bold font-mono text-lg">
                          ₹{(item.offer && Number(item.offer) < Number(item.price)) ? item.offer : item.price}
                        </p>
                      </div>
                      <p className="text-zinc-500 text-sm mb-4 font-bold uppercase tracking-wider">{item.brand}</p>

                      {/* Attributes grid */}
                      <div className="grid grid-cols-2 gap-4 max-w-xs text-xs font-mono text-zinc-400 mb-6">
                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                          <span>SIZE</span>
                          <span className="text-white">{item.size}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                          <span>COLOR</span>
                          <span className="text-white">N/A</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between">
                      {/* Qty Selector */}
                      <div className="flex items-center border border-zinc-800 bg-black">
                        <button
                          onClick={() => addToCartHandler(item, Number(item.qty) - 1)}
                          disabled={item.qty <= 1}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors disabled:opacity-30"
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold font-mono">{item.qty}</span>
                        <button
                          onClick={() => addToCartHandler(item, Number(item.qty) + 1)}
                          disabled={item.qty >= item.countInStock}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors disabled:opacity-30"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <button onClick={() => initiateRemove(item)} className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-colors flex items-center gap-2">
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-950 border border-zinc-900 p-8 sticky top-32">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b border-zinc-900">Order Summary</h2>

                <div className="space-y-4 font-mono text-sm text-zinc-400 mb-8">
                  <div className="flex justify-between">
                    <span>SUBTOTAL (Items)</span>
                    <span className="text-white">₹{totalMRP.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DISCOUNT</span>
                    <span className="text-red-500">- ₹{totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHIPPING</span>
                    <span className="text-white">CALCULATED AT CHECKOUT</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-zinc-900 pt-6 mb-8">
                  <span className="font-bold uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-white">₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  onClick={checkoutHandler}
                  className="w-full bg-red-600 text-white font-black uppercase tracking-[0.2em] py-5 hover:bg-white hover:text-black transition-all duration-300"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-600 uppercase tracking-wider">Secure Encrypted Transaction</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Remove Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-8 max-w-sm w-full">
            <h3 className="text-xl font-black text-white uppercase mb-2">Remove Item</h3>
            <p className="text-zinc-500 mb-8 text-sm">Do you want to remove this item from your bag?</p>

            <div className="space-y-3">
              <button
                onClick={handleMoveToFavorites}
                className="w-full bg-white text-black py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Move to Favorites
              </button>
              <button
                onClick={handleRemove}
                className="w-full border border-red-900 text-red-600 py-3 font-bold uppercase tracking-wider hover:bg-red-900/20 transition-colors"
              >
                Remove Item
              </button>
              <button
                onClick={() => setModalVisible(false)}
                className="w-full text-zinc-500 text-xs font-bold uppercase tracking-wider hover:text-white pt-2"
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