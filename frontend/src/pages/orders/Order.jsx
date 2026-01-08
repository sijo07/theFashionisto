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
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList, FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaUser, FaHistory } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
      toast.success("Payment Received Successfully");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const statusHandler = async () => {
    try {
      await updateOrderStatus({ orderId, status });
      refetch();
      toast.success("Collection status updated");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  const steps = [
    { name: "Order Placed", date: order?.createdAt, active: true },
    { name: "Processing", active: ["Processing", "Shipped", "Delivered"].includes(order?.orderStatus) },
    { name: "Out for Delivery", active: ["Shipped", "Delivered"].includes(order?.orderStatus) },
    { name: "Delivered", active: order?.isDelivered || order?.orderStatus === "Delivered" },
  ];

  const cardClass = "bg-zinc-950 border border-zinc-900 rounded-none p-6 md:p-8 relative overflow-hidden group";
  const labelClass = "text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block";
  const valueClass = "text-sm font-bold text-white uppercase tracking-wider";

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black pt-24 px-6 text-center">
      <Message variant="danger">{error?.data?.message || error?.error || "Order data retrieval failed"}</Message>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 px-6 font-sans">
      <div className="max-w-screen-xl mx-auto">

        {/* Editorial Header */}
        <div className="mb-12 border-b border-zinc-900 pb-10 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/profile" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-red-500 transition-colors mb-4 group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Account
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-3">
              Order Receipt <span className="text-red-500">/</span> {order.orderId || order._id.substring(0, 8)}
            </h1>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Logged on {moment(order.createdAt).format("MMM DD, YYYY [@] HH:mm")}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2">
            <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${order.isPaid ? "border-emerald-500/30 text-emerald-500" : "border-red-600/30 text-red-600"}`}>
              {order.isPaid ? "Transaction Verified" : "Payment Pending"}
            </div>
            <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-800 text-zinc-500">
              {order.orderStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Status Stepper - Magazine Style */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-0 border border-zinc-900 divide-x divide-y md:divide-y-0 divide-zinc-900">
          {steps.map((step, idx) => (
            <div key={idx} className="p-6 md:p-8 flex flex-col gap-3 relative">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-zinc-800">0{idx + 1}</span>
                {step.active && <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${step.active ? 'text-white' : 'text-zinc-700'}`}>{step.name}</p>
              {step.date && <p className="text-[9px] text-zinc-600 font-bold">{moment(step.date).format("MMM DD")}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Selected Items */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-6 border-b border-zinc-900 pb-3">Selected Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="flex p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-colors group"
                  >
                    <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.product}`} className="text-base font-black uppercase tracking-tight text-white hover:text-red-500 transition-colors">
                            {item.name}
                          </Link>
                          <span className="text-base font-black tracking-tighter">₹{item.price.toLocaleString()}</span>
                        </div>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">{item.brand || "T-FASHIONISTO"}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-zinc-900 pt-3">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">QTY: 0{item.qty}</span>
                        <span className="text-zinc-300 text-xs font-black uppercase tracking-widest">Sub: ₹{(item.qty * item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Meta Grid - Repositioned for balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logistics Information */}
              <div className={cardClass}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-white flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" size={14} /> Shipping Data
                </h3>
                <div className="space-y-5">
                  <div>
                    <span className={labelClass}>Client</span>
                    <p className={valueClass}>{order.user?.username || order.user?.name || "Anonymous Client"}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Email</span>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{order.user?.email || "No contact record"}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Destination</span>
                    <p className="text-xs font-bold text-white uppercase tracking-wider leading-relaxed">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Transaction */}
              <div className={cardClass}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-white flex items-center gap-2">
                  <FaCreditCard className="text-red-600" size={14} /> Transaction Data
                </h3>
                <div className="space-y-5">
                  <div>
                    <span className={labelClass}>Instrument</span>
                    <p className={valueClass}>{order.paymentMethod}</p>
                  </div>
                  <div className={`mt-2 p-4 ${order.isPaid ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-red-600/5 border border-red-600/20'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${order.isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                      {order.isPaid ? `Paid on ${moment(order.paidAt).format("MMM DD, YYYY")}` : 'Awaiting Settlement'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {userInfo && userInfo.isAdmin && !order.isDelivered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-600/5 border border-red-600/30 p-6 md:p-8">
                <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <FaHistory /> Administrative Override
                </h2>
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-900 text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-red-600 outline-none"
                  >
                    <option value="Processing">Status: Processing</option>
                    <option value="Shipped">Status: Shipped</option>
                    <option value="Delivered">Status: Delivered</option>
                  </select>
                  <button
                    onClick={statusHandler}
                    disabled={loadingStatusUpdate}
                    className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[9px] px-8 py-3 transition-all disabled:opacity-50"
                  >
                    {loadingStatusUpdate ? "Updating Records..." : "Commit Change"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sticky Sidebar Area */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {/* Purchase Summary */}
            <div className={cardClass}>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-white">Purchase Summary</h3>
              <div className="space-y-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span className="text-white">₹{order.itemsPrice.toLocaleString()}</span></div>
                <div className="flex justify-between text-zinc-600"><span>Shipping</span><span className="text-white">₹{order.shippingPrice.toLocaleString()}</span></div>
                <div className="flex justify-between text-zinc-600"><span>Taxation</span><span className="text-white">₹{order.taxPrice.toLocaleString()}</span></div>
                <div className="pt-4 border-t border-zinc-900 mt-4 flex justify-between text-xl font-black tracking-tighter text-red-600">
                  <span>Grand Total</span><span>₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {!order.isPaid && (
                <div className="mt-8">
                  {order.paymentMethod === "COD" ? (
                    <div className="bg-zinc-900 text-zinc-500 p-4 text-[9px] font-black uppercase text-center tracking-widest border border-zinc-800">
                      Standard Cash on Delivery
                    </div>
                  ) : (
                    <button
                      className="w-full bg-white text-black font-black py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all duration-300"
                      onClick={onApprove}
                      disabled={loadingPay}
                    >
                      {loadingPay ? "Validating..." : "Execute Payment"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Order;
