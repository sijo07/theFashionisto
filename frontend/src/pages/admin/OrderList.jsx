import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch, FaDownload, FaEye, FaEllipsisV,
  FaUserCircle, FaTruck, FaCheckCircle, FaTimesCircle,
  FaBoxOpen, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave,
  FaCalendarAlt, FaTimes, FaRupeeSign, FaLayerGroup
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Message from "../../components/message";
import AdminHeader from "./AdminHeader";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  usePayOrderMutation,
  useUpdateOrderItemStatusMutation
} from "../../redux/api/orderApiSlice";
import moment from "moment";

const OrderList = () => {
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery(undefined, { pollingInterval: 0 });
  const [updateOrderItemStatus] = useUpdateOrderItemStatusMutation();
  const [payOrder] = usePayOrderMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenActionId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusUpdate = async (orderId, itemId, status) => {
    try {
      await updateOrderItemStatus({ orderId, itemId, status }).unwrap();
      refetch();
      toast.success(`Asset status updated to ${status}.`);
      setOpenActionId(null);
    } catch (err) {
      toast.error("Order status update failed.");
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      await payOrder({ orderId, details: { status: "COMPLETED" } }).unwrap();
      refetch();
      toast.success("Financial settlement confirmed.");
      setOpenActionId(null);
    } catch (err) {
      toast.error("Settlement failed.");
    }
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.totalPrice.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "All Status" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return toast.error("No data for export.");
    const headers = ["Order_ID", "Client", "Email", "Date", "Value", "Status", "Method"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(o => [
        o._id, o.user?.username || 'Guest', o.user?.email || 'N/A',
        moment(o.createdAt).format("YYYY-MM-DD"), o.totalPrice, o.orderStatus, o.paymentMethod
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_export_${moment().format("YYYYMMDD")}.csv`;
    link.click();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;
  if (error) return <Message variant="danger">ACCESS_DENIED: {error?.data?.message || error.error}</Message>;

  return (
    <div className="min-h-screen bg-[#FDFEFE] font-sans text-gray-900 pb-20 overflow-x-hidden">
      <AdminHeader title="Order History" subtitle={`Tracking ${orders?.length || 0} customer transactions for your brand.`}>
        <div className="flex items-center gap-4">
          <div className="relative group w-64 hidden lg:block">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-teal-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl">
            <FaDownload size={10} /> Export Data
          </button>
        </div>
      </AdminHeader>

      <div className="px-6 lg:px-10 py-10 max-w-[1700px] mx-auto space-y-10">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-teal-50 p-6 rounded-[2rem] border border-teal-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg"><FaBoxOpen /></div>
            <div><p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Gross Sales</p><h4 className="text-2xl font-black text-gray-900">₹{orders?.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()}</h4></div>
          </div>
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg"><FaCalendarAlt /></div>
            <div><p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Active Orders</p><h4 className="text-2xl font-black text-gray-900">{orders?.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length} Units</h4></div>
          </div>
          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><FaTruck /></div>
            <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">In Transit</p><h4 className="text-2xl font-black text-gray-900">{orders?.filter(o => o.isPaid && !o.isDelivered).length} Units</h4></div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><FaCheckCircle /></div>
            <div><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fulfilled</p><h4 className="text-2xl font-black text-gray-900">{orders?.filter(o => o.isDelivered).length} Units</h4></div>
          </div>
        </div>

        {/* Order Table */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Product Item</th>
                  <th className="px-8 py-6">Transaction ID</th>
                  <th className="px-8 py-6">Client</th>
                  <th className="px-8 py-6">Total</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.flatMap(o => o.orderItems.map((item, i) => ({ o, item, i }))).map(({ o, item, i }) => (
                  <motion.tr key={`${o._id}-${i}`} variants={itemVariants} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Qty: {item.qty} {item.size && `• ${item.size}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-100 font-bold uppercase tracking-tighter">
                        #{o.orderId || o._id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-bold uppercase border border-indigo-100">{o.user?.username?.charAt(0) || "G"}</div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 uppercase leading-none">{o.user?.username || "Guest"}</p>
                          <p className="text-[9px] text-gray-400 lowercase">{o.user?.email || "No link"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                      <div className="flex gap-1 mt-1">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${o.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {o.isPaid ? 'Settled' : 'Unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${(item.itemStatus || o.orderStatus) === 'Pending' ? 'bg-amber-500' : (item.itemStatus || o.orderStatus) === 'Processing' ? 'bg-blue-500' : (item.itemStatus || o.orderStatus) === 'Shipped' ? 'bg-purple-500' : (item.itemStatus || o.orderStatus) === 'Delivered' ? 'bg-emerald-500' : 'bg-gray-400'} animate-pulse`}></span>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.itemStatus || o.orderStatus}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button onClick={() => { setSelectedOrder(o); setOpenActionId(`${o._id}-${i}`); }} className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><FaEllipsisV /></button>
                      <AnimatePresence>
                        {openActionId === `${o._id}-${i}` && (
                          <motion.div ref={dropdownRef} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute right-8 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2 text-left">
                            <button onClick={() => setSelectedOrder(o)} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all"><FaEye /> Visual Review</button>
                            <div className="border-t border-gray-50 my-1"></div>
                            <button onClick={() => handleStatusUpdate(o._id, item._id, 'Processing')} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FaBoxOpen /> Set Processing</button>
                            <button onClick={() => handleStatusUpdate(o._id, item._id, 'Shipped')} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><FaTruck /> Set Shipped</button>
                            <button onClick={() => handleStatusUpdate(o._id, item._id, 'Delivered')} className="w-full flex items-center gap-3 p-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FaCheckCircle /> Set Delivered</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl px-4 p-8">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative border border-white/20">
              <div className="p-8 lg:p-12 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-500/20"><FaEye size={24} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">TRANSACTION_VISUALIZER</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Active UUID: {selectedOrder._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-4 text-gray-300 hover:text-rose-500 transition-colors"><FaTimes size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2 flex items-center gap-2"><FaBoxOpen className="text-teal-600" /> Item Details</h4>
                      <div className="space-y-4">
                        {selectedOrder.orderItems.map((item, i) => (
                          <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex items-center gap-6 group">
                            <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform"><img src={item.image} className="w-full h-full object-cover" /></div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-gray-900 uppercase">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref ID: {item.product}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-teal-600">₹{item.price.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Qty: {item.qty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FaMoneyBillWave /> Financial Resolution</h4>
                      <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
                        <p className="text-gray-400">Items Base</p><p className="text-right">₹{selectedOrder.itemsPrice.toLocaleString()}</p>
                        <p className="text-gray-400">Logistics Cost</p><p className="text-right">₹{selectedOrder.shippingPrice.toLocaleString()}</p>
                        <p className="text-gray-400">System Tax</p><p className="text-right">₹{selectedOrder.taxPrice.toLocaleString()}</p>
                        <div className="col-span-2 pt-6 mt-2 border-t border-white/10 flex justify-between items-center text-2xl font-black">
                          <p className="text-teal-400 uppercase tracking-tighter">Gross Total</p>
                          <p>₹{selectedOrder.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500 opacity-10 rounded-full blur-[80px]"></div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FaUserCircle /> Customer Profile</h4>
                      <p className="text-sm font-black text-gray-900 uppercase">{selectedOrder.user?.username || "Guest User"}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{selectedOrder.user?.email || "No email provided"}</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FaMapMarkerAlt /> Shipping Destination</h4>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700 uppercase">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-xs font-bold text-gray-700 uppercase">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                        <p className="text-xs font-bold text-gray-700 uppercase">{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                    <div className="bg-teal-600 p-8 rounded-[2rem] text-white shadow-xl">
                      <h4 className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-6 flex items-center gap-2"><FaCreditCard /> Payment Summary</h4>
                      <p className="text-sm font-black uppercase">{selectedOrder.paymentMethod}</p>
                      <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.isPaid ? 'bg-white text-teal-700' : 'bg-rose-500 text-white'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedOrder.isPaid ? 'bg-teal-500' : 'bg-white animate-pulse'}`}></span>
                        {selectedOrder.isPaid ? 'Payment Confirmed' : 'Awaiting Settlement'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;

