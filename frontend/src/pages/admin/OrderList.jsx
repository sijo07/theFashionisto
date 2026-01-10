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
import Message from "../../components/Message";
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



  /* Modal logic removed - now navigating to AdminOrderDetails page */

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

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader /></div>;
  if (error) return <Message variant="danger">ACCESS_DENIED: {error?.data?.message || error.error}</Message>;

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white pb-20 overflow-x-hidden">
      <AdminHeader title="Order History" subtitle={`Tracking ${orders?.length || 0} customer transactions for your brand.`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative group w-full lg:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-teal-500/5 transition-all text-white placeholder:text-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl shadow-red-600/20 whitespace-nowrap">
            <FaDownload size={10} /> Export
          </button>
        </div>
      </AdminHeader>

      <div className="px-6 lg:px-10 py-10 max-w-[1700px] mx-auto space-y-10">

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 flex items-center gap-4 hover:bg-zinc-900/80 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:bg-red-500 group-hover:text-white transition-all"><FaBoxOpen size={20} /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Gross Sales</p><h4 className="text-2xl font-black text-white mt-1">₹{orders?.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()}</h4></div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 flex items-center gap-4 hover:bg-zinc-900/80 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)] group-hover:bg-teal-500 group-hover:text-white transition-all"><FaCalendarAlt size={20} /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Active Orders</p><h4 className="text-2xl font-black text-white mt-1">{orders?.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length} Units</h4></div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 flex items-center gap-4 hover:bg-zinc-900/80 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500 group-hover:text-white transition-all"><FaTruck size={20} /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">In Transit</p><h4 className="text-2xl font-black text-white mt-1">{orders?.filter(o => o.isPaid && !o.isDelivered).length} Units</h4></div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 flex items-center gap-4 hover:bg-zinc-900/80 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:bg-emerald-500 group-hover:text-white transition-all"><FaCheckCircle size={20} /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Fulfilled</p><h4 className="text-2xl font-black text-white mt-1">{orders?.filter(o => o.isDelivered).length} Units</h4></div>
          </div>
        </div>

        {/* Order Table */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-zinc-900/30 backdrop-blur-xl rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <th className="px-8 py-8">Product Details</th>
                  <th className="px-8 py-8">Order Ref</th>
                  <th className="px-8 py-8">Customer</th>
                  <th className="px-8 py-8">Amount</th>
                  <th className="px-8 py-8">Status</th>
                  <th className="px-8 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filteredOrders.flatMap(o => o.orderItems.map((item, i) => ({ o, item, i }))).map(({ o, item, i }) => (
                  <motion.tr key={`${o._id}-${i}`} variants={itemVariants} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700/50 shrink-0 shadow-sm group-hover:border-zinc-500 transition-colors">
                          <img src={item.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-xs font-bold text-zinc-200 uppercase tracking-tight line-clamp-1 group-hover:text-white transition-colors">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Qty: {item.qty} {item.size && `• ${item.size}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/50 px-2 py-1.5 rounded-lg border border-zinc-700/50 font-bold uppercase tracking-widest group-hover:text-white group-hover:border-zinc-600 transition-colors">
                        #{o.orderId || o._id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-black uppercase border border-zinc-700 group-hover:bg-zinc-700 group-hover:text-white transition-colors">{o.user?.username?.charAt(0) || "G"}</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-300 uppercase leading-none group-hover:text-white transition-colors">{o.user?.username || "Guest"}</p>
                          <p className="text-[9px] text-zinc-600 font-medium lowercase mt-0.5">{o.user?.email || "No link"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white">₹{item.price.toLocaleString()}</p>
                      <div className="flex gap-1 mt-1.5">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${o.isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {o.isPaid ? 'Paid' : 'Due'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${(item.itemStatus || o.orderStatus) === 'Pending' ? 'bg-amber-500' : (item.itemStatus || o.orderStatus) === 'Processing' ? 'bg-blue-500' : (item.itemStatus || o.orderStatus) === 'Shipped' ? 'bg-purple-500' : (item.itemStatus || o.orderStatus) === 'Delivered' ? 'bg-emerald-500' : 'bg-zinc-600'} shadow-[0_0_10px_currentColor] opacity-80`}></span>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest group-hover:text-zinc-300 transition-colors">{item.itemStatus || o.orderStatus}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <Link
                        to={`/admin/order/${o._id}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all ml-auto"
                      >
                        <FaEye size={12} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Editorial Style (Order Centric) */}
          <div className="md:hidden space-y-4 p-4">
            {filteredOrders.map((o) => (
              <motion.div key={o._id} variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                {/* Header: ID & Status */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest backdrop-blur-md">
                      #{o._id.substring(0, 8)}
                    </span>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mt-2">{moment(o.createdAt).format("MMM DD, YYYY")}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${o.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${o.isPaid ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{o.isPaid ? 'Paid' : 'Due'}</span>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-lg font-black text-zinc-500">
                    {o.user?.username?.charAt(0) || "G"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{o.user?.username || "Guest User"}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{o.orderItems.length} Items • ₹{o.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                {/* Item Preview (Thumbnails) */}
                <div className="flex -space-x-3 mb-6 relative z-10 pl-2">
                  {o.orderItems.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden relative shadow-lg">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                  {o.orderItems.length > 4 && (
                    <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 z-10">
                      +{o.orderItems.length - 4}
                    </div>
                  )}
                </div>

                {/* Global Status Indicator */}
                <div className="mb-6 flex items-center gap-2 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] 
                        ${o.orderStatus === 'Pending' ? 'bg-amber-500' :
                      o.orderStatus === 'Processing' ? 'bg-blue-500' :
                        o.orderStatus === 'Shipped' ? 'bg-purple-500' :
                          o.orderStatus === 'Delivered' ? 'bg-emerald-500' : 'bg-zinc-500'}`}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Status: <span className="text-white">{o.orderStatus}</span>
                  </span>
                </div>

                {/* Action Button */}
                <Link to={`/admin/order/${o._id}`} className="block w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10 active:scale-95">
                  View Manifest <FaEye className="inline ml-2 mb-0.5" />
                </Link>

              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default OrderList;

