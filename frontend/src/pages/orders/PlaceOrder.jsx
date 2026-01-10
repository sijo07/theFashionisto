import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import ProgressSteps from "../../components/ProgressSteps";
import { Message, Loader } from "../../components/index";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { FaUser, FaTruck, FaCreditCard, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    if (cart.cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(
        err?.data?.message || err.message || "Failed to create order"
      );
    }
  };

  const itemsPrice = Number(cart.itemsPrice) || 0;
  const shippingPrice = Number(cart.shippingPrice) || 0;
  const taxPrice = Number(cart.taxPrice) || 0;
  const totalPrice = Number(cart.totalPrice) || 0;

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">

        <div className="mb-12">
          <ProgressSteps step1 step2 step3 step4 />
        </div>

        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-12">

              {/* Header */}
              <div className="border-b border-zinc-900 pb-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
                  Order <span className="text-red-600">Confirmation</span>
                </h1>
                <p className="text-zinc-500 font-mono text-xs">REVIEW YOUR ORDER DETAILS</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Shipping Info */}
                <div className="bg-zinc-950/50 border border-zinc-900 p-6 relative group hover:border-zinc-700 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FaTruck size={40} />
                  </div>
                  <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaTruck /> Shipping To
                  </h2>
                  <div className="space-y-1 text-sm font-mono text-zinc-400">
                    <p className="text-white font-bold uppercase">{cart.shippingAddress.name}</p>
                    <p>{cart.shippingAddress.address}</p>
                    <p>
                      {cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.pinCode}
                    </p>
                    <p>{cart.shippingAddress.country}</p>
                    <p className="pt-2 text-xs text-zinc-600">{cart.shippingAddress.email}</p>
                    <p className="text-xs text-zinc-600">{cart.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-zinc-950/50 border border-zinc-900 p-6 relative group hover:border-zinc-700 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FaCreditCard size={40} />
                  </div>
                  <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaCreditCard /> Payment Method
                  </h2>
                  <div className="space-y-1 text-sm font-mono text-zinc-400">
                    <p className="text-white font-bold uppercase">{cart.paymentMethod}</p>
                    <p className="text-xs mt-2">SECURE ENCRYPTED CHANNEL</p>
                  </div>
                </div>
              </div>


              {/* Selection (Items) */}
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  Selection <span className="text-zinc-600 text-sm font-mono">({cart.cartItems.length} ITEMS)</span>
                </h3>

                <div className="space-y-4">
                  {cart.cartItems.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-zinc-900 bg-zinc-950/30 items-center">
                      <div className="w-16 h-20 bg-zinc-900 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <Link to={`/product/${item.product}`} className="block font-bold uppercase tracking-wide text-sm hover:text-red-500 transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-xs text-zinc-500 font-bold uppercase mt-1">{item.brand}</p>
                      </div>

                      <div className="text-right font-mono text-sm">
                        <p className="text-zinc-400 text-xs mb-1">{item.qty} x ₹{item.price}</p>
                        <p className="font-bold text-white">₹{(item.qty * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-950 border border-zinc-900 p-8 sticky top-32">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b border-zinc-900">Order Total</h2>

                <div className="space-y-3 font-mono text-sm text-zinc-400 mb-8">
                  <div className="flex justify-between">
                    <span>SUBTOTAL</span>
                    <span className="text-white">₹{itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHIPPING</span>
                    <span className="text-white">₹{shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TAX IMPLICATION</span>
                    <span className="text-white">₹{taxPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-zinc-900 pt-6 mb-8">
                  <span className="font-bold uppercase tracking-widest text-red-600">Final Total</span>
                  <span className="text-3xl font-black text-white">₹{totalPrice.toFixed(2)}</span>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-900/20 border border-red-900 text-red-500 text-xs font-bold uppercase">
                    {error?.data?.message || error?.error || "Error occurred"}
                  </div>
                )}

                <button
                  onClick={placeOrderHandler}
                  disabled={cart.cartItems.length === 0}
                  className="w-full bg-red-600 text-white font-black uppercase tracking-[0.2em] py-5 hover:bg-white hover:text-black transition-all duration-300 flex justify-center items-center gap-2 group"
                >
                  {isLoading ? "Processing..." : <>Place Order <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;