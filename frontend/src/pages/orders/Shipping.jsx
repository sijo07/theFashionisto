import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import ProgressSteps from "../../components/ProgressSteps";
import { FaCreditCard, FaMoneyBillWave, FaArrowRight, FaTruck, FaShieldAlt, FaUndo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [name, setName] = useState(shippingAddress.name || "");
  const [phone, setPhone] = useState(shippingAddress.phone || "");
  const [email, setEmail] = useState(shippingAddress.email || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [pinCode, setPinCode] = useState(shippingAddress.pinCode || "");
  const [state, setState] = useState(shippingAddress.state || "");
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    if (paymentMethod === "Credit Card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
        toast.error("Please provide complete card information");
        return;
      }
    }

    dispatch(
      saveShippingAddress({
        name,
        phone,
        email,
        address,
        city,
        pinCode,
        state,
        country,
      })
    );
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  const inputClass = "w-full bg-zinc-950 border border-zinc-900 text-white p-4 text-sm focus:border-red-600 focus:outline-none transition-all duration-300 placeholder:text-zinc-800";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2";

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-24 md:pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Progress Steps Center */}
        <div className="mb-16 flex justify-center">
          <ProgressSteps step1 step2 />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

          {/* Left Column: Form */}
          <div className="order-2 lg:order-1">
            <header className="mb-12 border-b border-zinc-900 pb-8">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                Delivery <span className="text-red-600 italic">Details</span>
              </h1>
              <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">
                Secure your collection arrival.
              </p>
            </header>

            <form onSubmit={submitHandler} className="space-y-12">
              {/* Identity Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-red-600 font-black text-xl italic">01.</span>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em]">Client Information</h2>
                  <div className="flex-1 h-px bg-zinc-900"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="full-name" className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      id="full-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="NAME"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>Contact Number</label>
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="PHONE"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="EMAIL"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Address Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-red-600 font-black text-xl italic">02.</span>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em]">Shipping Address</h2>
                  <div className="flex-1 h-px bg-zinc-900"></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className={labelClass}>Street Address</label>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                      placeholder="ADDRESS"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className={labelClass}>City</label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                        placeholder="CITY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pin-code" className={labelClass}>Postal Code</label>
                      <input
                        type="text"
                        id="pin-code"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className={inputClass}
                        placeholder="ZIP"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className={labelClass}>Province / State</label>
                      <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass}
                        placeholder="STATE"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className={labelClass}>Country</label>
                      <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass}
                        placeholder="COUNTRY"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-red-600 font-black text-xl italic">03.</span>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em]">Payment Method</h2>
                  <div className="flex-1 h-px bg-zinc-900"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <label
                    className={`cursor-pointer border p-6 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "Credit Card"
                      ? "border-red-600 bg-red-900/10"
                      : "border-zinc-900 bg-zinc-950/30 hover:border-zinc-700"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={paymentMethod === "Credit Card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "Credit Card" ? "border-red-500" : "border-zinc-700"
                      }`}>
                      {paymentMethod === "Credit Card" && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                    </div>
                    <div>
                      <span className="block font-black uppercase tracking-widest text-xs mb-1">Card Payment</span>
                      <span className="text-zinc-600 text-[10px] font-mono">SECURE TRANSIT</span>
                    </div>
                    <FaCreditCard className={`ml-auto text-xl ${paymentMethod === "Credit Card" ? "text-red-500" : "text-zinc-800"}`} />
                  </label>

                  <label
                    className={`cursor-pointer border p-6 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "COD"
                      ? "border-red-600 bg-red-900/10"
                      : "border-zinc-900 bg-zinc-950/30 hover:border-zinc-700"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? "border-red-500" : "border-zinc-700"
                      }`}>
                      {paymentMethod === "COD" && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                    </div>
                    <div>
                      <span className="block font-black uppercase tracking-widest text-xs mb-1">On Delivery</span>
                      <span className="text-zinc-600 text-[10px] font-mono">PAY AT DOOR</span>
                    </div>
                    <FaMoneyBillWave className={`ml-auto text-xl ${paymentMethod === "COD" ? "text-red-500" : "text-zinc-800"}`} />
                  </label>
                </div>

                {/* Conditional Card Form */}
                {paymentMethod === "Credit Card" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-zinc-950 border border-zinc-900 space-y-6"
                  >
                    <div>
                      <label className={labelClass}>Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className={inputClass}
                        placeholder="NAME ON CARD"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Card Number</label>
                      <input
                        type="text"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className={inputClass}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Expiry Date</label>
                        <input
                          type="text"
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').replace(/\/$/, ''))}
                          className={inputClass}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Security Code (CVV)</label>
                        <input
                          type="password"
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className={inputClass}
                          placeholder="000"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              <div className="pt-8 flex justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-red-600 text-white font-black uppercase tracking-[0.3em] px-12 py-5 hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center gap-4 group shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Continue to Order <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Collection Notes / Branding */}
          <div className="order-1 lg:order-2 sticky top-32 space-y-12">
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                alt="Luxury Fashion"
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <p className="text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
                  The<br /><span className="text-red-600">Fashionisto</span>
                </p>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">
                  Established 2026
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <FaTruck /> Fast Shipping
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Your selection is prepared for expedited delivery via our global boutique network. Tracking details provided upon dispatch.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <FaShieldAlt /> Private & Secure
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  We use industry-leading encryption to ensure your personal information remains confidential during the entire checkout process.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <FaUndo /> 30-Day Returns
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Uncompromised quality. If your selection doesn't meet your standard, our return process is seamless and respectful of your time.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Shipping;
