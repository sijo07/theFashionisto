import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { savePaymentMethod } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import ProgressSteps from "../../components/ProgressSteps";
import { FaCreditCard, FaMoneyBillWave, FaArrowRight, FaLock, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);
    const { shippingAddress, paymentMethod: initialPaymentMethod } = cart;

    const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod || "Credit Card");

    // Card details state (Mock - in a real app these would probably go to a payment gateway immediately)
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate("/shipping");
        }
    }, [navigate, shippingAddress]);

    const submitHandler = (e) => {
        e.preventDefault();

        if (paymentMethod === "Credit Card") {
            // Basic validation for the mock form
            if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
                toast.error("Please provide complete card information");
                return;
            }
        }

        dispatch(savePaymentMethod(paymentMethod));
        navigate("/placeorder", { replace: true });
    };

    const inputClass = "w-full bg-zinc-950 border border-zinc-900 text-white p-4 text-sm focus:border-red-600 focus:outline-none transition-all duration-300 placeholder:text-zinc-800";
    const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2";

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-20 md:pt-32 pb-20">
            <div className="max-w-[1440px] mx-auto px-6">

                {/* Progress Steps Center */}
                <div className="mb-8 md:mb-16 flex justify-center">
                    <ProgressSteps step1 step2 step3 />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* Left Column: Form */}
                    <div className="order-1">
                        <header className="mb-12 border-b border-zinc-900 pb-8">
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                                Select <span className="text-red-600 italic">Payment</span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">
                                Secure checkout. Encrypted transaction.
                            </p>
                        </header>

                        <form onSubmit={submitHandler} className="space-y-12">
                            {/* Payment Method Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`cursor-pointer border p-6 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "Credit Card" ? "border-red-600 bg-red-900/10" : "border-zinc-900 bg-zinc-950/30 hover:border-zinc-700"}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Credit Card"
                                        checked={paymentMethod === "Credit Card"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "Credit Card" ? "border-red-500" : "border-zinc-700"}`}>
                                        {paymentMethod === "Credit Card" && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                                    </div>
                                    <div>
                                        <span className="block font-black uppercase tracking-widest text-xs mb-1">Credit Card</span>
                                        <span className="text-zinc-600 text-[10px] font-mono">VISA / MASTERCARD</span>
                                    </div>
                                    <FaCreditCard className={`ml-auto text-xl ${paymentMethod === "Credit Card" ? "text-red-500" : "text-zinc-800"}`} />
                                </label>

                                <label className={`cursor-pointer border p-6 flex items-center gap-4 transition-all duration-300 ${paymentMethod === "COD" ? "border-red-600 bg-red-900/10" : "border-zinc-900 bg-zinc-950/30 hover:border-zinc-700"}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? "border-red-500" : "border-zinc-700"}`}>
                                        {paymentMethod === "COD" && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                                    </div>
                                    <div>
                                        <span className="block font-black uppercase tracking-widest text-xs mb-1">Cash On Delivery</span>
                                        <span className="text-zinc-600 text-[10px] font-mono">PAY UPON ARRIVAL</span>
                                    </div>
                                    <FaMoneyBillWave className={`ml-auto text-xl ${paymentMethod === "COD" ? "text-red-500" : "text-zinc-800"}`} />
                                </label>
                            </div>

                            {/* Conditional Card Form */}
                            {paymentMethod === "Credit Card" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-zinc-950 border border-zinc-900 space-y-6 relative"
                                >
                                    <div className="absolute top-4 right-4 text-zinc-700">
                                        <FaLock />
                                    </div>
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

                            <div className="pt-8 flex justify-between items-center">
                                <button type="button" onClick={() => navigate('/shipping')} className="text-sm font-bold text-zinc-500 hover:text-white uppercase tracking-widest px-6 py-4">Back</button>
                                <button
                                    type="submit"
                                    className="bg-red-600 text-white font-black uppercase tracking-[0.3em] px-12 py-5 hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center gap-4 group shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Review Order <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Column: Security/Info */}
                    <div className="order-2 sticky top-32 space-y-12">
                        <div className="p-10 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-6">
                            <FaShieldAlt className="text-4xl text-zinc-700" />
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Secure Payment</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    All transactions are secured with military-grade 256-bit encryption. Your financial data is never stored on our servers.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-800 w-full" />
                            <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Placeholder icons for cards */}
                                <div className="h-8 w-12 bg-white/10 rounded"></div>
                                <div className="h-8 w-12 bg-white/10 rounded"></div>
                                <div className="h-8 w-12 bg-white/10 rounded"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Payment;
