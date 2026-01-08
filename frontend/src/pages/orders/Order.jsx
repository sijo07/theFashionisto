import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Message, Loader } from "../../components/index";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useUpdateOrderStatusMutation,
} from "../../redux/api/orderApiSlice";
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList, FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaUser, FaHistory, FaReceipt } from "react-icons/fa";
import { motion } from "framer-motion";
import moment from "moment";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [updateOrderStatus, { isLoading: loadingStatusUpdate }] = useUpdateOrderStatusMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus || "Processing");
    }
  }, [order]);

  const onApprove = async () => {
    try {
      await payOrder({ orderId, details: { id: "MOCK_PAYMENT_ID", status: "COMPLETED", payer: {} } });
      refetch();
      toast.success("Payment Verified");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const statusHandler = async () => {
    try {
      await updateOrderStatus({ orderId, status });
      refetch();
      toast.success("Status Updated");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const steps = [
    { name: "Order Placed", date: order?.createdAt, active: true },
    { name: "Processing", active: ["Processing", "Shipped", "Delivered"].includes(order?.orderStatus) },
    { name: "Out for Delivery", active: ["Shipped", "Delivered"].includes(order?.orderStatus) },
    { name: "Delivered", active: order?.isDelivered || order?.orderStatus === "Delivered" },
  ];

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Message variant="danger">{error?.data?.message || error?.error || "Order Not Found"}</Message></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 font-sans selection:bg-red-900 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] bg-zinc-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-red-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* Header Navigation */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 border-b border-zinc-800/50 pb-8">
          <div>
            <Link to="/user-orders" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors mb-6">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> List View
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none"
            >
              Receipt <span className="text-zinc-800">#</span>{order._id.substring(0, 8)}
            </motion.h1>
            <p className="mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
              Digital Record • {moment(order.createdAt).format("MM.DD.YYYY")} • {moment(order.createdAt).format("HH:mm")}
            </p>
          </div>

          <div className="flex gap-4">
            <div className={`px-6 py-3 border backdrop-blur-md ${order.isPaid ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-red-500/20 bg-red-500/5 text-red-500'} text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2`}>
              <FaReceipt /> {order.isPaid ? "Paid" : "Unpaid"}
            </div>
            <div className={`px-6 py-3 border backdrop-blur-md ${order.isDelivered ? 'border-white/20 bg-white/5 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500'} text-[10px] font-black uppercase tracking-[0.2em]`}>
              {order.orderStatus}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-zinc-800">
            {steps.map((step, idx) => (
              <div key={idx} className={`p-6 border-r border-zinc-800 last:border-r-0 relative group transition-colors duration-500 ${step.active ? 'bg-zinc-900/20' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black text-zinc-700 group-hover:text-zinc-500 transition-colors">0{idx + 1}</span>
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${step.active ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110' : 'bg-zinc-800'}`} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${step.active ? 'text-white' : 'text-zinc-600'}`}>{step.name}</p>
                {step.active && <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Confirmed</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Content - Items */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600" /> Line Items
              </h2>
              <div className="space-y-6">
                {order.orderItems.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="flex gap-6 p-6 border border-zinc-900 bg-zinc-950/50 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="w-24 h-32 bg-zinc-900 flex-shrink-0 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-grayscale duration-500" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link to={`/product/${item.product}`} className="text-lg font-black uppercase tracking-tight text-white hover:text-red-500 transition-colors line-clamp-1">
                            {item.name}
                          </Link>
                          <p className="text-lg font-black text-white tracking-tight">₹{item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.brand || "Fashionisto Archive"}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-zinc-900 pt-4">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Qty <span className="text-white ml-2">0{item.qty}</span></p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Subtotal <span className="text-white ml-2">₹{(item.qty * item.price).toLocaleString()}</span></p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Logistics Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 border border-zinc-900 bg-zinc-950/30">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FaMapMarkerAlt /> Shipping</h3>
                <p className="text-white font-bold uppercase tracking-wide text-sm mb-1">{order.user?.username}</p>
                <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{order.user?.email}</p>
              </div>
              <div className="p-8 border border-zinc-900 bg-zinc-950/30">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FaCreditCard /> Payment</h3>
                <p className="text-white font-bold uppercase tracking-wide text-sm mb-1">{order.paymentMethod}</p>
                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 ${order.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{order.isPaid ? 'Verified' : 'Pending'}</span>
                </div>
                {order.isPaid && <p className="mt-2 text-[9px] text-zinc-600 font-mono">{moment(order.paidAt).format("YYYY-MM-DD HH:mm:ss")}</p>}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Logic & Totals */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <div className="p-10 border border-zinc-800 bg-zinc-900/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] pointer-events-none" />

              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Financial Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Cart Total</span>
                  <span className="text-white">₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-white">₹{order.shippingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Tax</span>
                  <span className="text-white">₹{order.taxPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="py-6 border-t border-zinc-800 flex justify-between items-end mb-8">
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Total Due</span>
                <span className="text-3xl font-black text-white tracking-tighter">₹{order.totalPrice.toLocaleString()}</span>
              </div>

              {!order.isPaid && (
                <div>
                  {loadingPay && <Loader />}
                  {!loadingPay && (
                    <button
                      onClick={onApprove}
                      className="w-full py-5 bg-white text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xl"
                    >
                      Complete Payment
                    </button>
                  )}
                  <p className="text-center text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-4">Secure Encryption • 256-bit SSL</p>
                </div>
              )}
            </div>

            {/* Admin Tools */}
            {userInfo && userInfo.isAdmin && !order.isDelivered && (
              <div className="p-8 border border-red-900/30 bg-red-900/5">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FaUser /> Admin Override</h3>
                <div className="flex gap-4">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex-1 bg-black border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button
                    onClick={statusHandler}
                    disabled={loadingStatusUpdate}
                    className="px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                  >
                    {loadingStatusUpdate ? "Updating..." : "Update"}
                  </button>
                </div>
                {loadingDeliver && <Loader />}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Order;
